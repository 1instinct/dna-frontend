import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

import {
  TokenStorage,
  VISITOR_TOKEN_KEY,
  ensureVisitorToken,
  randomToken,
  readVisitorToken,
  resetVisitorTokenMemory,
  writeVisitorToken
} from "../chat/visitorToken";

const memory = (): TokenStorage & { data: Record<string, string> } => {
  const data: Record<string, string> = {};
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    }
  };
};

const blocked: TokenStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  }
};

beforeEach(() => resetVisitorTokenMemory());

describe("visitor token", () => {
  test("creates a token on first use and stores it in localStorage", () => {
    const storage = memory();
    const token = ensureVisitorToken(storage);
    assert.match(token, /^[A-Za-z0-9_-]{8,128}$/);
    assert.equal(storage.data[VISITOR_TOKEN_KEY], token);
  });

  test("keeps the stored token on later visits", () => {
    const storage = memory();
    storage.data[VISITOR_TOKEN_KEY] = "existing-token-1";
    assert.equal(ensureVisitorToken(storage), "existing-token-1");
  });

  test("a token from the server replaces the stored one", () => {
    const storage = memory();
    ensureVisitorToken(storage);
    writeVisitorToken("server-token-2", storage);
    assert.equal(readVisitorToken(storage), "server-token-2");
  });

  test("ignores values that don't look like a token", () => {
    const storage = memory();
    storage.data[VISITOR_TOKEN_KEY] = "<script>";
    assert.equal(readVisitorToken(storage), null);
    writeVisitorToken("a b", storage);
    writeVisitorToken(null, storage);
    assert.equal(storage.data[VISITOR_TOKEN_KEY], "<script>");
  });

  test("blocked storage still gives one stable token for the page", () => {
    const first = ensureVisitorToken(blocked);
    assert.equal(ensureVisitorToken(blocked), first);
    assert.equal(ensureVisitorToken(null), first);
  });

  test("random tokens differ", () => {
    assert.notEqual(randomToken(), randomToken());
  });
});
