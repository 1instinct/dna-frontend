import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RESERVED_SLUGS,
  isRoutableSlug,
  lookupProduct,
  resolveSlug
} from "../slugRoute";

type Reply = { status: number; body?: unknown } | "hang" | "throw" | "garbage";

const BASE = "https://api.test";

const productDoc = (slug: string, available?: boolean): Reply => ({
  status: 200,
  body: { data: { id: "1", attributes: { slug, name: "Name", available } } }
});
const missing: Reply = { status: 404, body: { error: "not found" } };

// Answers every request with `reply`; records what was asked.
const fakeFetch = (reply: Reply) => {
  const urls: string[] = [];
  const impl = (url: string, init?: { signal?: AbortSignal }) => {
    urls.push(url);
    if (reply === "throw") return Promise.reject(new Error("ECONNREFUSED"));
    if (reply === "hang") {
      return new Promise<never>((_, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new Error("aborted"))
        );
      });
    }
    if (reply === "garbage") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError("<html>"))
      });
    }
    return Promise.resolve({
      ok: reply.status >= 200 && reply.status < 300,
      status: reply.status,
      json: () => Promise.resolve(reply.body)
    });
  };
  return { impl, urls };
};

const resolve = async (slug: string, product: Reply) => {
  const f = fakeFetch(product);
  const result = await resolveSlug(slug, {
    baseUrl: BASE,
    fetchImpl: f.impl,
    timeoutMs: 20
  });
  return { result, urls: f.urls };
};

describe("resolveSlug: products", () => {
  it("a visible product is a product, with no product data carried along", async () => {
    const { result, urls } = await resolve("case", productDoc("case", true));
    assert.deepEqual(result, { kind: "product" });
    assert.equal(urls.length, 1);
  });

  it("asks for the one product by slug, never the ignored filter[slug]", async () => {
    // Spree 4.2 ignores filter[slug] and returns the whole catalog, which made
    // every slug look like a product.
    const { urls } = await resolve("case", productDoc("case", true));
    assert.equal(urls[0], `${BASE}/api/v2/storefront/products/case`);
  });

  it("treats a payload without `available` as visible", async () => {
    const { result } = await resolve("case", productDoc("case"));
    assert.deepEqual(result, { kind: "product" });
  });

  it("hidden product (200 with available: false) is not found", async () => {
    const { result } = await resolve("hidden", productDoc("hidden", false));
    assert.deepEqual(result, { kind: "not-found" });
  });

  it("hidden product (backend answers 404) is not found", async () => {
    const { result } = await resolve("hidden", missing);
    assert.deepEqual(result, { kind: "not-found" });
  });

  it("unknown slug is not found", async () => {
    const { result } = await resolve("nope", missing);
    assert.deepEqual(result, { kind: "not-found" });
  });

  it("a numeric id that resolves to another slug is not a product page", async () => {
    // The API also finds by id: /api/v2/storefront/products/2 returns a product.
    const { result } = await resolve("2", productDoc("carrying-case", true));
    assert.deepEqual(result, { kind: "not-found" });
  });
});

describe("resolveSlug: API failures are never a 404 and never a product", () => {
  const cases: [string, Reply][] = [
    ["500", { status: 500 }],
    ["503", { status: 503 }],
    ["429", { status: 429 }],
    ["timeout", "hang"],
    ["connection refused", "throw"],
    ["not JSON", "garbage"]
  ];
  for (const [name, product] of cases) {
    it(name, async () => {
      const { result } = await resolve("x", product);
      assert.deepEqual(result, { kind: "unavailable" });
    });
  }
});

describe("resolveSlug: without asking the backend", () => {
  const offline = async (slug: string) => {
    const { result, urls } = await resolve(slug, "throw");
    assert.equal(urls.length, 0, `${slug} should not reach the API`);
    return result;
  };

  it("reserved slugs are not found", async () => {
    for (const slug of RESERVED_SLUGS) {
      assert.deepEqual(await offline(slug), { kind: "not-found" });
    }
    assert.ok(RESERVED_SLUGS.includes("category"));
    assert.ok(RESERVED_SLUGS.includes("tag"));
  });

  it("file-like and odd paths are not found", async () => {
    for (const slug of [
      "robots.txt",
      "sitemap.xml",
      "wp-login.php",
      "..",
      "a/b",
      "a b",
      "",
      "x".repeat(256)
    ]) {
      assert.deepEqual(await offline(slug), { kind: "not-found" });
    }
  });

  it("accepts real slug shapes", () => {
    assert.equal(isRoutableSlug("carrying-case"), true);
    assert.equal(isRoutableSlug("some_slug"), true);
    assert.equal(
      isRoutableSlug(
        "pre-order-reservation-512eb3fe-9876-489b-808d-a5aa162f5be7"
      ),
      true
    );
  });
});

describe("lookupProduct", () => {
  it("returns the attributes of a visible product", async () => {
    const f = fakeFetch(productDoc("case", true));
    const found = await lookupProduct("case", {
      baseUrl: BASE,
      fetchImpl: f.impl
    });
    assert.equal(found.status, "visible");
    assert.equal(
      found.status === "visible" ? found.attributes.name : "",
      "Name"
    );
  });

  it("does not hand back attributes for a hidden product", async () => {
    const f = fakeFetch(productDoc("case", false));
    const found = await lookupProduct("case", {
      baseUrl: BASE,
      fetchImpl: f.impl
    });
    assert.deepEqual(found, { status: "hidden" });
  });

  it("gives up after the timeout", async () => {
    const f = fakeFetch("hang");
    const found = await lookupProduct("case", {
      baseUrl: BASE,
      fetchImpl: f.impl,
      timeoutMs: 10
    });
    assert.deepEqual(found, { status: "error" });
  });
});
