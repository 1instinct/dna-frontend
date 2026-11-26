import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { CreatorProduct } from "../creator/types";
import {
  canDelete,
  canEdit,
  canSubmitNow,
  willSubmit
} from "../creator/reviewRules";

type P = Pick<CreatorProduct, "review_state" | "live_asset_version" | "asset">;
const draftAsset = (files = 1) => ({
  id: 1,
  version: null as unknown as number,
  status: "draft" as const,
  manifest: {},
  files: Array.from({ length: files }, (_, i) => ({
    id: i + 1,
    filename: `f${i}.wav`,
    byte_size: 1,
    content_type: "audio/wav"
  }))
});
const liveAsset = {
  ...draftAsset(1),
  status: "published" as const,
  version: 1
};
const p = (over: Partial<P>): P => ({
  review_state: "draft",
  live_asset_version: null,
  asset: draftAsset(),
  ...over
});

describe("canEdit (PATCH)", () => {
  test("draft, changes requested and approved can be edited", () => {
    for (const s of ["draft", "changes_requested", "approved"] as const)
      assert.equal(canEdit(p({ review_state: s })), true, s);
  });
  test("in review never; rejected only once live", () => {
    assert.equal(canEdit(p({ review_state: "submitted" })), false);
    assert.equal(canEdit(p({ review_state: "rejected" })), false);
    assert.equal(
      canEdit(p({ review_state: "rejected", live_asset_version: 1 })),
      true
    );
  });
});

describe("canSubmitNow (POST submit, as saved)", () => {
  test("a draft with draft files", () => {
    assert.equal(canSubmitNow(p({})), true);
    assert.equal(canSubmitNow(p({ asset: draftAsset(0) })), false);
    assert.equal(canSubmitNow(p({ asset: null })), false);
  });
  test("only from draft or changes requested", () => {
    assert.equal(canSubmitNow(p({ review_state: "changes_requested" })), true);
    for (const s of ["submitted", "approved", "rejected"] as const)
      assert.equal(
        canSubmitNow(p({ review_state: s, live_asset_version: 1 })),
        false,
        s
      );
  });
  test("a live product back in draft has changes waiting (files or preview media)", () => {
    assert.equal(
      canSubmitNow(p({ live_asset_version: 1, asset: liveAsset })),
      true
    );
  });
});

describe("willSubmit (after saving pending edits)", () => {
  const live = p({
    review_state: "approved",
    live_asset_version: 1,
    asset: liveAsset
  });
  test("a live product needs a file, manifest or preview change", () => {
    assert.equal(willSubmit(live, { asset: false, preview: false }), false);
    assert.equal(willSubmit(live, { asset: true, preview: false }), true);
    assert.equal(willSubmit(live, { asset: false, preview: true }), true);
  });
  test("a new product can be submitted; an in-review one can't", () => {
    assert.equal(willSubmit(null, { asset: true, preview: false }), true);
    assert.equal(
      willSubmit(p({ review_state: "submitted" }), {
        asset: true,
        preview: false
      }),
      false
    );
  });
  test("a draft without files needs an asset change", () => {
    const empty = p({ asset: draftAsset(0) });
    assert.equal(willSubmit(empty, { asset: false, preview: false }), false);
    assert.equal(willSubmit(empty, { asset: true, preview: false }), true);
  });
});

describe("canDelete", () => {
  test("only a draft that never went live", () => {
    assert.equal(canDelete(p({})), true);
    assert.equal(canDelete(p({ live_asset_version: 1 })), false);
    assert.equal(canDelete(p({ review_state: "changes_requested" })), false);
  });
});
