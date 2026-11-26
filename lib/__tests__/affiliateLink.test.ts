import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAffiliateLink, linkOrigin } from "../affiliate/link";

const ORIGIN = "https://example.com";

describe("buildAffiliateLink", () => {
  it("links the home page by default", () => {
    assert.equal(buildAffiliateLink(ORIGIN, "", "nova"), `${ORIGIN}/?ref=nova`);
  });

  it("accepts a path with or without a leading slash", () => {
    assert.equal(
      buildAffiliateLink(ORIGIN, "browse", "nova"),
      `${ORIGIN}/browse?ref=nova`
    );
    assert.equal(
      buildAffiliateLink(ORIGIN, " /some-product ", "nova"),
      `${ORIGIN}/some-product?ref=nova`
    );
  });

  it("keeps other query values and replaces an existing ref", () => {
    assert.equal(
      buildAffiliateLink(ORIGIN, "/browse?sort=newest&ref=other", "nova"),
      `${ORIGIN}/browse?sort=newest&ref=nova`
    );
  });

  it("takes the path from a pasted site URL and keeps the hash", () => {
    assert.equal(
      buildAffiliateLink(
        ORIGIN,
        "https://example.com/some-product#specs",
        "nova"
      ),
      `${ORIGIN}/some-product?ref=nova#specs`
    );
    assert.equal(
      buildAffiliateLink(ORIGIN, "example.com/browse", "nova"),
      `${ORIGIN}/browse?ref=nova`
    );
  });

  it("returns null for a URL on another site", () => {
    assert.equal(
      buildAffiliateLink(ORIGIN, "https://other.example.org/x", "nova"),
      null
    );
  });
});

describe("linkOrigin", () => {
  it("reads the origin of the server's link, with a fallback", () => {
    assert.equal(linkOrigin("https://example.com/?ref=nova", "x"), ORIGIN);
    assert.equal(linkOrigin(undefined, ORIGIN), ORIGIN);
    assert.equal(linkOrigin("not a url", ORIGIN), ORIGIN);
  });
});
