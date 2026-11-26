import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { selectAnnouncement, selectAppLinkOverride } from "../announcement";

const bar = (over = {}) => ({
  id: 1,
  section_type: "announcement_bar",
  position: 0,
  is_visible: true,
  content: "",
  created_at: "",
  updated_at: "2026-11-20T00:00:00Z",
  settings: { message: "Beta is open", dismissible: true },
  ...over
});

describe("selectAnnouncement", () => {
  test("returns the message of a visible bar", () => {
    assert.equal(selectAnnouncement([bar()])?.message, "Beta is open");
  });

  test("picks the lowest position, not the array order", () => {
    const sections = [
      bar({ id: 2, position: 5, settings: { message: "second" } }),
      bar({ id: 3, position: 1, settings: { message: "first" } })
    ];
    assert.equal(selectAnnouncement(sections)?.message, "first");
  });

  test("ignores other section types and invisible rows", () => {
    assert.equal(selectAnnouncement([bar({ section_type: "hero" })]), null);
    assert.equal(selectAnnouncement([bar({ is_visible: false })]), null);
  });

  test("drops a non-http(s) cta_href but still renders the banner", () => {
    for (const href of [
      "javascript:alert(1)",
      "data:text/html,x",
      "/relative"
    ]) {
      const banner = selectAnnouncement([
        bar({ settings: { message: "Beta is open", cta_href: href } })
      ]);
      assert.equal(banner?.message, "Beta is open");
      assert.equal(banner?.ctaHref, null);
    }
    assert.equal(
      selectAnnouncement([
        bar({ settings: { message: "m", cta_href: " https://x.co/a " } })
      ])?.ctaHref,
      "https://x.co/a"
    );
  });

  test("returns null for an empty, non-array or missing payload", () => {
    assert.equal(selectAnnouncement([]), null);
    assert.equal(selectAnnouncement(null), null);
    assert.equal(selectAnnouncement({ nope: true }), null);
  });

  test("returns null when settings is an unparsed Ruby hash string", () => {
    assert.equal(
      selectAnnouncement([bar({ settings: '{"message"=>"x"}' })]),
      null
    );
  });

  test("returns null when the message is missing or blank", () => {
    assert.equal(
      selectAnnouncement([bar({ settings: { message: "  " } })]),
      null
    );
  });

  test("honours a one-sided start bound", () => {
    const s = [
      bar({ settings: { message: "m", starts_at: "2026-12-01T00:00:00Z" } })
    ];
    assert.equal(selectAnnouncement(s, new Date("2026-11-20T00:00:00Z")), null);
    assert.equal(
      selectAnnouncement(s, new Date("2026-12-02T00:00:00Z"))?.message,
      "m"
    );
  });

  test("honours a one-sided end bound", () => {
    const s = [
      bar({ settings: { message: "m", ends_at: "2026-11-01T00:00:00Z" } })
    ];
    assert.equal(selectAnnouncement(s, new Date("2026-11-20T00:00:00Z")), null);
  });

  test("an unparseable date does not hide a visible banner", () => {
    const s = [bar({ settings: { message: "m", starts_at: "whenever" } })];
    assert.equal(
      selectAnnouncement(s, new Date("2026-11-20T00:00:00Z"))?.message,
      "m"
    );
  });

  test("a skipped out-of-window bar does not shadow a later valid one", () => {
    const sections = [
      bar({
        id: 2,
        position: 0,
        settings: { message: "expired", ends_at: "2026-01-01T00:00:00Z" }
      }),
      bar({ id: 3, position: 1, settings: { message: "live" } })
    ];
    assert.equal(
      selectAnnouncement(sections, new Date("2026-11-20T00:00:00Z"))?.message,
      "live"
    );
  });
});

describe("selectAppLinkOverride", () => {
  test("reads urls from the lowest-position visible app_links row", () => {
    const sections = [
      bar({
        id: 4,
        section_type: "app_links",
        position: 2,
        settings: { ios_url: "b" }
      }),
      bar({
        id: 5,
        section_type: "app_links",
        position: 0,
        settings: { ios_url: "a" }
      })
    ];
    assert.deepEqual(selectAppLinkOverride(sections), {
      ios_url: "a",
      android_url: ""
    });
  });

  test("returns null when there is no app_links row or settings are unusable", () => {
    assert.equal(selectAppLinkOverride([bar()]), null);
    assert.equal(
      selectAppLinkOverride([
        bar({ section_type: "app_links", settings: "{}=>x" })
      ]),
      null
    );
  });
});
