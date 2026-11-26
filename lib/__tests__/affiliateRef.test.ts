import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_REF_DAYS,
  REF_COOKIE,
  newerRef,
  normalizeRefCode,
  readRef,
  refCookieString,
  refFromUrl,
  writeRef
} from "../affiliate/ref";

const DAY = 86400000;
const NOW = Date.UTC(2026, 10, 14, 12);

const cookie = (code: string, ts: number, days = 30) =>
  `${REF_COOKIE}=${encodeURIComponent(JSON.stringify({ code, ts, days }))}`;

describe("normalizeRefCode", () => {
  it("lowercases and trims a valid code", () => {
    assert.equal(normalizeRefCode("  DJ-Nova "), "dj-nova");
  });

  it("rejects codes outside 4–24 characters of [a-z0-9-]", () => {
    assert.equal(normalizeRefCode("abc"), null);
    assert.equal(normalizeRefCode("a".repeat(25)), null);
    assert.equal(normalizeRefCode("bad code"), null);
    assert.equal(normalizeRefCode("nova_1"), null);
    assert.equal(normalizeRefCode(""), null);
    assert.equal(normalizeRefCode(undefined), null);
  });
});

describe("refFromUrl", () => {
  it("lowercases and validates the ref parameter", () => {
    assert.equal(refFromUrl("https://example.com/?ref=NOVA"), "nova");
    assert.equal(
      refFromUrl("https://example.com/shop?x=1&ref=North-Lab"),
      "north-lab"
    );
    assert.equal(refFromUrl("https://example.com/?ref=no"), null);
    assert.equal(refFromUrl("https://example.com/?ref=%3Cscript%3E"), null);
  });

  it("accepts a path without an origin", () => {
    assert.equal(refFromUrl("/browse?ref=nova"), "nova");
  });

  it("returns null without a ref or for an unparsable url", () => {
    assert.equal(refFromUrl("https://example.com/browse"), null);
    assert.equal(refFromUrl("http://[bad"), null);
  });
});

describe("readRef", () => {
  it("reads a live cookie", () => {
    const ref = readRef(`a=1; ${cookie("nova", NOW - DAY)}; b=2`, NOW);
    assert.deepEqual(ref, { code: "nova", ts: NOW - DAY, days: 30 });
  });

  it("newest ref wins when the header carries more than one", () => {
    const header = `${cookie("older", NOW - 5 * DAY)}; ${cookie(
      "newer",
      NOW - DAY
    )}; ${cookie("oldest", NOW - 9 * DAY)}`;
    assert.equal(readRef(header, NOW)?.code, "newer");
  });

  it("ignores an expired cookie", () => {
    assert.equal(readRef(cookie("nova", NOW - 31 * DAY), NOW), null);
    assert.equal(readRef(cookie("nova", NOW - 8 * DAY, 7), NOW), null);
    assert.equal(readRef(cookie("nova", NOW - 6 * DAY, 7), NOW)?.code, "nova");
  });

  it("falls back to the default lifetime when days is missing", () => {
    const raw = `${REF_COOKIE}=${encodeURIComponent(
      JSON.stringify({ code: "nova", ts: NOW - 29 * DAY })
    )}`;
    assert.equal(readRef(raw, NOW)?.days, DEFAULT_REF_DAYS);
  });

  it("ignores malformed or invalid values", () => {
    assert.equal(readRef(`${REF_COOKIE}=not-json`, NOW), null);
    assert.equal(readRef(cookie("NO SPACES", NOW), NOW), null);
    assert.equal(readRef(cookie("nova", NOW + DAY), NOW), null);
    assert.equal(readRef("", NOW), null);
  });
});

describe("newerRef", () => {
  it("keeps the more recent of two refs", () => {
    const a = { code: "aaaa", ts: 1, days: 30 };
    const b = { code: "bbbb", ts: 2, days: 30 };
    assert.equal(newerRef(a, b), b);
    assert.equal(newerRef(b, a), b);
    assert.equal(newerRef(null, a), a);
    assert.equal(newerRef(a, null), a);
  });
});

describe("refCookieString", () => {
  it("sets path, lifetime and SameSite, and Secure only on https", () => {
    const s = refCookieString({ code: "nova", ts: NOW, days: 7 }, true);
    assert.match(s, /^aff_ref=/);
    assert.match(s, /; path=\/; max-age=604800; SameSite=Lax; Secure$/);
    assert.doesNotMatch(
      refCookieString({ code: "nova", ts: NOW, days: 7 }, false),
      /Secure/
    );
  });
});

describe("writeRef", () => {
  const g = globalThis as unknown as { document?: { cookie: string } };
  afterEach(() => {
    delete g.document;
  });

  it("writes a cookie readRef can read back, newest replacing older", () => {
    const jar: string[] = [];
    g.document = {
      get cookie() {
        return jar.join("; ");
      },
      set cookie(v: string) {
        const pair = v.split(";")[0];
        const name = pair.split("=")[0];
        const i = jar.findIndex((c) => c.startsWith(`${name}=`));
        if (i >= 0) jar.splice(i, 1);
        jar.push(pair);
      }
    };
    writeRef("Nova", 30, NOW - DAY);
    writeRef("north-lab", 14, NOW);
    assert.deepEqual(readRef(undefined, NOW), {
      code: "north-lab",
      ts: NOW,
      days: 14
    });
  });

  it("refuses an invalid code and returns null", () => {
    g.document = { cookie: "" };
    assert.equal(writeRef("x", 30, NOW), null);
    assert.equal(g.document.cookie, "");
  });
});
