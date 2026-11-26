import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  cartHasDigital,
  cartNeedsDelivery,
  checkoutFailure,
  DIGITAL_ACCOUNT_MESSAGE,
  isDigitalRequiresAccountError,
  loginRedirectFor
} from "../digitalCheckout";

const cart = (slugs: string[], attrs: Record<string, unknown> = {}) => ({
  data: { attributes: attrs },
  included: slugs.map((slug, i) => ({
    id: String(i + 1),
    type: "line_item",
    attributes: { slug }
  }))
});

describe("cartNeedsDelivery", () => {
  test("the order's checkout steps decide when the API sends them", () => {
    assert.equal(
      cartNeedsDelivery(
        cart(["tee"], {
          checkout_steps: ["address", "payment", "confirm", "complete"]
        }),
        []
      ),
      false
    );
    assert.equal(
      cartNeedsDelivery(
        cart(["guide"], {
          checkout_steps: ["address", "delivery", "payment", "complete"]
        }),
        ["guide"]
      ),
      true
    );
  });

  test("without steps, a cart of only digital products needs no delivery", () => {
    assert.equal(
      cartNeedsDelivery(cart(["guide", "font"]), ["guide", "font"]),
      false
    );
  });

  test("one physical line keeps delivery", () => {
    assert.equal(cartNeedsDelivery(cart(["guide", "tee"]), ["guide"]), true);
  });

  test("unknown answers keep delivery (the safe default)", () => {
    assert.equal(cartNeedsDelivery(cart(["guide"]), undefined), true);
    assert.equal(cartNeedsDelivery(cart([]), []), true);
    assert.equal(cartNeedsDelivery(null, ["guide"]), true);
  });

  test("cartHasDigital", () => {
    assert.equal(cartHasDigital(cart(["guide", "tee"]), ["guide"]), true);
    assert.equal(cartHasDigital(cart(["tee"]), ["guide"]), false);
    assert.equal(cartHasDigital(cart(["tee"]), undefined), false);
  });
});

describe("isDigitalRequiresAccountError", () => {
  test("spots the code in an SDK error summary, body or message", () => {
    assert.equal(
      isDigitalRequiresAccountError({ summary: "digital_requires_account" }),
      true
    );
    assert.equal(
      isDigitalRequiresAccountError({
        serverResponse: {
          status: 422,
          data: { error: "digital_requires_account" }
        }
      }),
      true
    );
    assert.equal(
      isDigitalRequiresAccountError(new Error("digital_requires_account")),
      true
    );
    assert.equal(
      isDigitalRequiresAccountError({
        code: "digital_requires_account"
      }),
      true
    );
  });

  test("other errors are not it", () => {
    assert.equal(
      isDigitalRequiresAccountError(new Error("Insufficient stock")),
      false
    );
    assert.equal(isDigitalRequiresAccountError(null), false);
  });

  test("loginRedirectFor sends guests back to checkout", () => {
    assert.equal(loginRedirectFor("/checkout"), "/login?redirect=%2Fcheckout");
  });
});

describe("checkoutFailure", () => {
  test("keeps the digital_requires_account code from a Spree failure", () => {
    const err = checkoutFailure(
      {
        summary: "Unprocessable",
        serverResponse: { data: { error: "digital_requires_account" } }
      },
      "Failed"
    );
    assert.equal(isDigitalRequiresAccountError(err), true);
    assert.equal(err.message, DIGITAL_ACCOUNT_MESSAGE);
  });

  test("other failures keep their text, or the fallback", () => {
    const a = checkoutFailure({ summary: "Insufficient stock" }, "Failed");
    assert.equal(a.message, "Insufficient stock");
    assert.equal(isDigitalRequiresAccountError(a), false);
    assert.equal(checkoutFailure({}, "Failed").message, "Failed");
  });
});
