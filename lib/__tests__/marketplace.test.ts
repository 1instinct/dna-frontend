import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  creatorOf,
  creatorSharePercent,
  DEFAULT_DIGITAL_KIND,
  filterMarketplace,
  kindsIn,
  marketplaceTaxonPermalink,
  sellableKinds
} from "../marketplace";
import { parseDigitalKinds } from "../digitalKinds";

const p = (
  id: string,
  name: string,
  price: string,
  kind: string | null,
  creator: { handle: string | null; name: string | null } | null = null,
  created_at = "2026-11-01T00:00:00Z"
) => ({
  id,
  attributes: { name, slug: id, price, digital_kind: kind, creator, created_at }
});

const items = [
  p("a", "Field Guide", "9.99", "ebook", { handle: "kai", name: "Kai" }),
  p("b", "Type Specimen", "2.00", "font", null, "2026-11-05T00:00:00Z"),
  p("c", "Grid Kit", "0", "template", { handle: "mo", name: "Mo Lin" }),
  p("d", "T-shirt", "20.00", null)
];

const names = (xs: { attributes?: Record<string, any> }[]) =>
  xs.map((x) => x.attributes?.name);

describe("filterMarketplace", () => {
  test("keeps only products with a digital kind", () => {
    const out = filterMarketplace(items, {
      kinds: [],
      search: "",
      sort: "name_asc"
    });
    assert.deepEqual(names(out), ["Field Guide", "Grid Kit", "Type Specimen"]);
  });

  test("kind chips narrow to the chosen kinds", () => {
    const out = filterMarketplace(items, {
      kinds: ["template", "font"],
      search: "",
      sort: "name_asc"
    });
    assert.deepEqual(names(out), ["Grid Kit", "Type Specimen"]);
  });

  test("search matches the creator's name as well as the product", () => {
    const out = filterMarketplace(items, {
      kinds: [],
      search: "mo l",
      sort: "name_asc"
    });
    assert.deepEqual(names(out), ["Grid Kit"]);
  });

  test("sorts by price and by newest", () => {
    assert.deepEqual(
      names(
        filterMarketplace(items, { kinds: [], search: "", sort: "price_asc" })
      ),
      ["Grid Kit", "Type Specimen", "Field Guide"]
    );
    assert.deepEqual(
      names(
        filterMarketplace(items, { kinds: [], search: "", sort: "newest" })
      )[0],
      "Type Specimen"
    );
  });

  test("kindsIn lists the kinds present, by name when none are configured", () => {
    assert.deepEqual(kindsIn(items), ["ebook", "font", "template"]);
  });
});

describe("creatorOf", () => {
  test("reads the creator's handle and name", () => {
    assert.deepEqual(creatorOf(items[0]), { handle: "kai", name: "Kai" });
  });

  test("falls back to the handle, and is null without either", () => {
    assert.deepEqual(
      creatorOf(p("x", "X", "1", "ebook", { handle: "zed", name: null })),
      { handle: "zed", name: "zed" }
    );
    assert.deepEqual(
      creatorOf(p("y", "Y", "1", "ebook", { handle: null, name: "Ann" })),
      { handle: null, name: "Ann" }
    );
    assert.equal(
      creatorOf(p("z", "Z", "1", "ebook", { handle: null, name: null })),
      null
    );
    assert.equal(creatorOf(items[1]), null);
    assert.equal(creatorOf(null), null);
  });
});

describe("configuration", () => {
  test("the marketplace is off until a taxon is named", () => {
    assert.equal(marketplaceTaxonPermalink(""), null);
    assert.equal(marketplaceTaxonPermalink(undefined), null);
    assert.equal(marketplaceTaxonPermalink(" marketplace "), "marketplace");
    assert.equal(marketplaceTaxonPermalink("/shop/market/"), "shop/market");
  });

  test("sellable kinds are the configured ones, else one default kind", () => {
    assert.deepEqual(
      sellableKinds(parseDigitalKinds("ebook,course")).map((k) => k.kind),
      ["ebook", "course"]
    );
    assert.deepEqual(
      sellableKinds([]).map((k) => k.kind),
      [DEFAULT_DIGITAL_KIND]
    );
  });

  test("the advertised share is a percentage, or nothing", () => {
    assert.equal(creatorSharePercent("70"), 70);
    assert.equal(creatorSharePercent(""), null);
    assert.equal(creatorSharePercent(undefined), null);
    assert.equal(creatorSharePercent("0"), null);
    assert.equal(creatorSharePercent("150"), null);
    assert.equal(creatorSharePercent("lots"), null);
  });
});
