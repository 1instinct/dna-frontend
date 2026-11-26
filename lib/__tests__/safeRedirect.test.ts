import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeRedirect } from "../safeRedirect";

describe("safeRedirect", () => {
  it("keeps same-origin relative paths", () => {
    assert.equal(safeRedirect("/account/orders"), "/account/orders");
    assert.equal(safeRedirect("/browse?mode=a#x"), "/browse?mode=a#x");
  });

  it("refuses other origins and odd forms", () => {
    for (const bad of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "\\\\evil.example",
      "javascript:alert(1)",
      "account",
      " /account",
      "/\t/evil.example",
      ""
    ]) {
      assert.equal(safeRedirect(bad), "/", bad);
    }
  });

  it("handles missing and array query values", () => {
    assert.equal(safeRedirect(undefined), "/");
    assert.equal(safeRedirect(["/a", "/b"]), "/a");
    assert.equal(safeRedirect(undefined, "/home"), "/home");
  });
});
