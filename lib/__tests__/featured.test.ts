import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

import { DEFAULT_FEATURED_TAXON, fetchFeaturedProducts } from "../featured";
import {
  describeRequestError,
  isVideosIncludeError,
  markVideosUnsupported,
  resetVideosSupport,
  VIDEOS_RETRY_AFTER_MS,
  withoutVideos,
  withVideos
} from "../spreeInclude";

type Route = (url: string) => { status: number; body: unknown };

const fakeFetch = (route: Route, calls: string[] = []) => {
  return async (url: string) => {
    calls.push(url);
    const { status, body } = route(url);
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => (typeof body === "string" ? body : JSON.stringify(body))
    };
  };
};

const PRODUCTS = {
  data: [
    { id: "34", type: "product", attributes: { slug: "reservation" } },
    { id: "6", type: "product", attributes: { slug: "pack" } }
  ],
  included: [{ id: "1", type: "image", attributes: { styles: [] } }]
};

beforeEach(() => resetVideosSupport());

describe("fetchFeaturedProducts", () => {
  test("looks up the taxon, then lists its products in taxon order", async () => {
    const calls: string[] = [];
    const doc = await fetchFeaturedProducts({
      baseUrl: "https://api.test/",
      fetchImpl: fakeFetch(
        (url) =>
          url.includes("/taxons/")
            ? { status: 200, body: { data: { id: "43" } } }
            : { status: 200, body: PRODUCTS },
        calls
      )
    });
    assert.deepEqual(
      doc?.data.map((p) => p.id),
      ["34", "6"]
    );
    assert.equal(
      calls[0],
      "https://api.test/api/v2/storefront/taxons/collections/featured"
    );
    assert.match(calls[1], /filter\[taxons\]=43&sort_by=default/);
    assert.match(calls[1], /include=[^&]*\bimages\b/);
    assert.match(calls[1], /include=[^&]*\bvideos\b/);
    assert.match(calls[1], /include=[^&]*\bproduct_properties\b/);
  });

  test("pages: page and per_page go to the query, meta comes back", async () => {
    const calls: string[] = [];
    const doc = await fetchFeaturedProducts({
      baseUrl: "",
      perPage: 24,
      page: 2,
      fetchImpl: fakeFetch(
        (url) =>
          url.includes("/taxons/")
            ? { status: 200, body: { data: { id: "43" } } }
            : {
                status: 200,
                body: { ...PRODUCTS, meta: { total_count: 30, total_pages: 2 } }
              },
        calls
      )
    });
    assert.match(calls[1], /per_page=24&page=2/);
    assert.deepEqual(doc?.meta, { total_count: 30, total_pages: 2 });
  });

  test("custom permalink", async () => {
    const calls: string[] = [];
    await fetchFeaturedProducts({
      baseUrl: "",
      permalink: "collections/staff picks",
      fetchImpl: fakeFetch(() => ({ status: 404, body: {} }), calls)
    });
    assert.equal(
      calls[0],
      "/api/v2/storefront/taxons/collections/staff%20picks"
    );
  });

  test("missing taxon: null, and never queries products", async () => {
    const calls: string[] = [];
    const doc = await fetchFeaturedProducts({
      baseUrl: "",
      fetchImpl: fakeFetch(
        () => ({ status: 404, body: { error: "nf" } }),
        calls
      )
    });
    assert.equal(doc, null);
    assert.equal(calls.length, 1);
  });

  test("taxon without an id: null, never queries products", async () => {
    const calls: string[] = [];
    const doc = await fetchFeaturedProducts({
      baseUrl: "",
      fetchImpl: fakeFetch(() => ({ status: 200, body: { data: null } }), calls)
    });
    assert.equal(doc, null);
    assert.equal(calls.length, 1);
  });

  test("empty taxon: null", async () => {
    const doc = await fetchFeaturedProducts({
      baseUrl: "",
      fetchImpl: fakeFetch((url) =>
        url.includes("/taxons/")
          ? { status: 200, body: { data: { id: "44" } } }
          : { status: 200, body: { data: [] } }
      )
    });
    assert.equal(doc, null);
  });

  test("network or server failure: null", async () => {
    assert.equal(
      await fetchFeaturedProducts({
        baseUrl: "",
        fetchImpl: async () => {
          throw new Error("offline");
        }
      }),
      null
    );
    assert.equal(
      await fetchFeaturedProducts({
        baseUrl: "",
        fetchImpl: fakeFetch((url) =>
          url.includes("/taxons/")
            ? { status: 200, body: { data: { id: "43" } } }
            : { status: 500, body: "boom" }
        )
      }),
      null
    );
  });

  test("backend without videos: retries once without, then stops asking", async () => {
    const calls: string[] = [];
    const route: Route = (url) => {
      if (url.includes("/taxons/"))
        return { status: 200, body: { data: { id: "43" } } };
      if (/include=[^&]*videos/.test(url))
        return {
          status: 400,
          body: {
            error:
              "videos is not specified as a relationship on Spree::V2::Storefront::ProductSerializer"
          }
        };
      return { status: 200, body: PRODUCTS };
    };
    const doc = await fetchFeaturedProducts({
      baseUrl: "",
      fetchImpl: fakeFetch(route, calls)
    });
    assert.equal(doc?.data.length, 2);
    assert.equal(calls.length, 3);
    assert.doesNotMatch(calls[2], /videos/);

    const again: string[] = [];
    await fetchFeaturedProducts({
      baseUrl: "",
      fetchImpl: fakeFetch(route, again)
    });
    assert.equal(again.length, 2);
    assert.doesNotMatch(again[1], /videos/);
  });

  test("a hung Spree: null after the timeout, and the request is aborted", async () => {
    let aborted = false;
    const started = Date.now();
    const doc = await fetchFeaturedProducts({
      baseUrl: "",
      timeoutMs: 30,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            aborted = true;
            reject(new Error("aborted"));
          });
        })
    });
    assert.equal(doc, null);
    assert.equal(aborted, true);
    assert.ok(Date.now() - started < 2000);
  });

  test("default permalink", () => {
    assert.equal(DEFAULT_FEATURED_TAXON, "collections/featured");
  });
});

describe("spreeInclude", () => {
  test("withVideos / withoutVideos", () => {
    assert.equal(withVideos("images,variants"), "images,variants,videos");
    assert.equal(withVideos("images,videos"), "images,videos");
    assert.equal(withoutVideos("images,videos,variants"), "images,variants");
  });

  test("a rejected include is retried after a while, not never (long-lived server)", () => {
    const t0 = 1_000_000;
    markVideosUnsupported(t0);
    assert.equal(withVideos("images", t0 + 1), "images");
    assert.equal(
      withVideos("images", t0 + VIDEOS_RETRY_AFTER_MS - 1),
      "images"
    );
    assert.equal(
      withVideos("images", t0 + VIDEOS_RETRY_AFTER_MS),
      "images,videos"
    );
  });

  test("describeRequestError reads SDK and fetch errors", () => {
    const sdk = {
      summary: "videos is not specified as a relationship",
      serverResponse: { status: 400, data: { error: "videos ..." } }
    };
    const d = describeRequestError(sdk);
    assert.equal(d.status, 400);
    assert.equal(isVideosIncludeError(d.status, d.message), true);
    const plain = Object.assign(new Error("videos nope"), { status: 400 });
    assert.equal(describeRequestError(plain).status, 400);
    assert.deepEqual(describeRequestError(undefined), {
      status: undefined,
      message: ""
    });
  });

  test("isVideosIncludeError only for the 400 about videos", () => {
    assert.equal(isVideosIncludeError(400, "videos is not specified"), true);
    assert.equal(isVideosIncludeError(400, "something else"), false);
    assert.equal(isVideosIncludeError(500, "videos"), false);
    assert.equal(isVideosIncludeError(undefined, undefined), false);
  });
});
