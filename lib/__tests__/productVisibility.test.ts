import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ProductNotFoundError,
  assertProductVisible,
  isProductHidden,
  isProductNotFoundError,
  robotsContent,
  shouldRetryProductFetch,
  visibleRecentProducts
} from "../productVisibility";

describe("isProductHidden", () => {
  it("is true only for an explicit available: false", () => {
    assert.equal(isProductHidden({ available: false }), true);
    assert.equal(isProductHidden({ available: true }), false);
    // A payload without the field is not treated as hidden: a backend that
    // hides products answers 404 instead.
    assert.equal(isProductHidden({}), false);
    assert.equal(isProductHidden(undefined), false);
  });
});

describe("assertProductVisible", () => {
  it("returns a visible product document unchanged", () => {
    const doc = { data: { attributes: { available: true, name: "Case" } } };
    assert.equal(assertProductVisible(doc, "case"), doc);
  });

  it("throws not-found for a hidden product (200 with available: false)", () => {
    assert.throws(
      () =>
        assertProductVisible(
          { data: { attributes: { available: false, name: "Hidden" } } },
          "hidden"
        ),
      ProductNotFoundError
    );
  });

  it("throws not-found for an empty document", () => {
    assert.throws(() => assertProductVisible({}, "x"), ProductNotFoundError);
  });
});

describe("isProductNotFoundError", () => {
  it("recognizes the error class and a 404 status, nothing else", () => {
    assert.equal(isProductNotFoundError(new ProductNotFoundError("x")), true);
    assert.equal(
      isProductNotFoundError(Object.assign(new Error("x"), { status: 404 })),
      true
    );
    assert.equal(
      isProductNotFoundError(Object.assign(new Error("x"), { status: 503 })),
      false
    );
    assert.equal(isProductNotFoundError(new Error("network")), false);
    assert.equal(isProductNotFoundError(null), false);
  });
});

describe("robotsContent", () => {
  it("noindexes the 404, the error page and the unavailable state", () => {
    assert.equal(robotsContent("/404"), "noindex");
    assert.equal(robotsContent("/_error"), "noindex");
    assert.equal(robotsContent("/[slug]", { type: "unavailable" }), "noindex");
  });

  it("leaves real pages indexable", () => {
    assert.equal(robotsContent("/[slug]", { type: "product" }), "noodp");
    for (const page of ["/", "/browse", "/about", "/terms", "/privacy"]) {
      assert.equal(robotsContent(page, {}), "noodp");
    }
  });
});

describe("shouldRetryProductFetch", () => {
  it("never retries not-found, so a hidden product doesn't sit on a spinner", () => {
    assert.equal(
      shouldRetryProductFetch(0, new ProductNotFoundError("x")),
      false
    );
  });

  it("retries a transient failure a few times", () => {
    assert.equal(shouldRetryProductFetch(0, new Error("503")), true);
    assert.equal(shouldRetryProductFetch(2, new Error("503")), true);
    assert.equal(shouldRetryProductFetch(3, new Error("503")), false);
  });
});

describe("visibleRecentProducts", () => {
  const recent = [
    { slug: "gone", name: "Gone", imgSrc: "", viewedAt: 2 },
    { slug: "case", name: "Case", imgSrc: "", viewedAt: 1 }
  ];
  const listing = (slugs: string[], totalPages = 1) => ({
    data: slugs.map((slug) => ({ attributes: { slug } })),
    meta: { total_pages: totalPages }
  });

  it("drops entries missing from a complete product listing", () => {
    assert.deepEqual(
      visibleRecentProducts(recent, listing(["case"])).map((p) => p.slug),
      ["case"]
    );
  });

  it("keeps everything when the listing is partial or absent", () => {
    assert.equal(visibleRecentProducts(recent, listing(["case"], 2)).length, 2);
    assert.equal(visibleRecentProducts(recent, undefined).length, 2);
    assert.equal(visibleRecentProducts(recent, { data: "x" }).length, 2);
  });

  it("keeps everything when the listing has no pagination info", () => {
    assert.equal(
      visibleRecentProducts(recent, {
        data: [{ attributes: { slug: "case" } }]
      }).length,
      2
    );
  });
});
