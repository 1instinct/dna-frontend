import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  FROM_APP_KEY,
  FlagStorage,
  captureFromApp,
  fromAppInUrl,
  isFromApp
} from "../fromApp";

const memory = (): FlagStorage & { data: Record<string, string> } => {
  const data: Record<string, string> = {};
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    }
  };
};

const blocked: FlagStorage = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  }
};

describe("fromAppInUrl", () => {
  test("finds from=app in a full URL or a path", () => {
    assert.equal(
      fromAppInUrl("https://example.com/some-product?from=app"),
      true
    );
    assert.equal(fromAppInUrl("/some-product?ref=x&from=app"), true);
  });

  test("ignores other values and URLs without it", () => {
    assert.equal(fromAppInUrl("https://example.com/some-product"), false);
    assert.equal(fromAppInUrl("/some-product?from=web"), false);
    assert.equal(fromAppInUrl("/some-product?from="), false);
    assert.equal(fromAppInUrl("/some-product#from=app"), false);
  });
});

describe("captureFromApp / isFromApp", () => {
  test("stores the flag when the URL carries from=app", () => {
    const s = memory();
    assert.equal(captureFromApp("/some-product?from=app", s), true);
    assert.equal(s.data[FROM_APP_KEY], "1");
    assert.equal(isFromApp(s), true);
  });

  test("a later page without the parameter keeps the flag", () => {
    const s = memory();
    captureFromApp("/some-product?from=app", s);
    assert.equal(captureFromApp("/checkout", s), false);
    assert.equal(isFromApp(s), true);
  });

  test("no parameter, no flag", () => {
    const s = memory();
    assert.equal(captureFromApp("/some-product", s), false);
    assert.deepEqual(s.data, {});
    assert.equal(isFromApp(s), false);
  });

  test("blocked or missing storage is harmless", () => {
    assert.equal(captureFromApp("/some-product?from=app", blocked), false);
    assert.equal(isFromApp(blocked), false);
    assert.equal(captureFromApp("/some-product?from=app", null), false);
    assert.equal(isFromApp(null), false);
  });

  test("without a window (server render) it is never from the app", () => {
    assert.equal(captureFromApp("/some-product?from=app"), false);
    assert.equal(isFromApp(), false);
  });
});
