import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LINE_NOT_BUYABLE_MESSAGE,
  cartLineSlugs,
  checkoutErrorMessage,
  findUnavailableSlugs,
  isLineNotBuyableError,
  spreeErrorText,
  unavailableCartLines
} from "../cartAvailability";

const line = (id: string, slug?: string, name = `Item ${id}`) => ({
  id,
  type: "line_item",
  attributes: { name, slug }
});

const cart = {
  included: [
    line("1", "example-product", "Example Product"),
    { id: "9", type: "variant", attributes: { slug: "not-a-line" } },
    line("2", "usb-c-cable", "USB-C Cable"),
    line("3", "example-product", "Example Product"),
    line("4")
  ]
};

const product = (slug: string, available: boolean) => ({
  ok: true,
  status: 200,
  json: async () => ({ data: { attributes: { slug, available } } })
});
const status = (code: number) => ({
  ok: code < 400,
  status: code,
  json: async () => ({})
});

describe("cartLineSlugs", () => {
  it("is each line's slug once, ignoring other records", () => {
    assert.deepEqual(cartLineSlugs(cart), ["example-product", "usb-c-cable"]);
  });

  it("copes with no cart", () => {
    assert.deepEqual(cartLineSlugs(undefined), []);
    assert.deepEqual(cartLineSlugs({}), []);
  });
});

describe("findUnavailableSlugs", () => {
  const check = (replies: Record<string, unknown>) =>
    findUnavailableSlugs(Object.keys(replies), {
      baseUrl: "",
      fetchImpl: (async (url: string) => {
        const slug = url.split("/").pop() as string;
        const reply = replies[slug];
        if (reply === "throw") throw new Error("network");
        return reply;
      }) as any
    });

  it("names a 404 and a 200 with available: false", async () => {
    assert.deepEqual(
      await check({
        gone: status(404),
        hidden: product("hidden", false),
        fine: product("fine", true)
      }),
      ["gone", "hidden"]
    );
  });

  it("never blames a line when the API couldn't answer", async () => {
    assert.deepEqual(
      await check({ a: status(500), b: status(429), c: "throw" }),
      []
    );
  });
});

describe("unavailableCartLines", () => {
  it("is every line on those slugs, with its id and name", () => {
    assert.deepEqual(unavailableCartLines(cart, ["example-product"]), [
      { id: "1", name: "Example Product" },
      { id: "3", name: "Example Product" }
    ]);
  });

  it("is empty before the check has answered", () => {
    assert.deepEqual(unavailableCartLines(cart, undefined), []);
  });
});

describe("spreeErrorText", () => {
  it("prefers the server's words over the SDK's generic message", () => {
    assert.equal(
      spreeErrorText({
        message: "Spree returned a HTTP 422 error code",
        summary: "Some line items in this order have insufficient quantity."
      }),
      "Some line items in this order have insufficient quantity."
    );
  });

  it("falls back to the message", () => {
    assert.equal(spreeErrorText({ message: "No response" }), "No response");
    assert.equal(spreeErrorText(undefined), "");
  });
});

describe("isLineNotBuyableError", () => {
  it("recognizes what the backend says about a line", () => {
    for (const text of [
      "Some line items in this order have insufficient quantity.",
      "This item is not available.",
      'Quantity selected of "Example Product" is not available.',
      "An item in your cart has become unavailable.",
      "Some line items in this order have products that are no longer available."
    ]) {
      assert.equal(isLineNotBuyableError(text), true, text);
    }
  });

  it("leaves other checkout errors alone", () => {
    for (const text of [
      "Your card was declined.",
      "is not available to shipment address",
      "Spree returned a HTTP 422 error code",
      ""
    ]) {
      assert.equal(isLineNotBuyableError(text), false, text);
    }
  });
});

describe("checkoutErrorMessage", () => {
  it("replaces a line problem with what the shopper can do about it", () => {
    assert.equal(
      checkoutErrorMessage(
        new Error("Some line items in this order have insufficient quantity.")
      ),
      LINE_NOT_BUYABLE_MESSAGE
    );
  });

  it("keeps any other message, and has a default", () => {
    assert.equal(
      checkoutErrorMessage(new Error("Your card was declined.")),
      "Your card was declined."
    );
    assert.equal(
      checkoutErrorMessage(new Error("")),
      "Failed to complete checkout. Please try again."
    );
  });
});
