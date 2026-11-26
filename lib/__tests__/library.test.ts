import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  groupLibrary,
  includedLine,
  libraryAppLink,
  LibraryItem
} from "../library";
import {
  digitalKindOf,
  formatBytes,
  humanizeKind,
  kindLabel,
  orderKinds,
  parseDigitalKinds
} from "../digitalKinds";

const item = (
  id: number,
  kind: string,
  name: string,
  revoked_at: string | null = null,
  granted_at = "2026-11-01T00:00:00Z"
): LibraryItem => ({
  ownership_id: id,
  variant_id: id * 10,
  product: {
    id,
    slug: name.toLowerCase(),
    name,
    image_url: null,
    creator: null
  },
  kind,
  asset: { id, version: 1, byte_size: 10, manifest: {}, files: [] },
  source: "order",
  granted_at,
  revoked_at
});

describe("parseDigitalKinds", () => {
  test("reads kind, kind:Label and kind:Label:Plural entries in order", () => {
    assert.deepEqual(
      parseDigitalKinds("ebook:E-book:E-books, video_course ,template:Theme"),
      [
        { kind: "ebook", label: "E-book", plural: "E-books" },
        {
          kind: "video_course",
          label: "Video course",
          plural: "Video courses"
        },
        { kind: "template", label: "Theme", plural: "Themes" }
      ]
    );
  });

  test("skips malformed and repeated kinds; empty means none configured", () => {
    assert.deepEqual(
      parseDigitalKinds("Bad Kind,ebook,,ebook:Again").map((k) => k.kind),
      ["ebook"]
    );
    assert.deepEqual(parseDigitalKinds(""), []);
    assert.deepEqual(parseDigitalKinds(undefined), []);
  });
});

describe("kind labels and order", () => {
  const kinds = parseDigitalKinds("ebook:E-book:E-books,course");

  test("configured labels win, others come from the kind's name", () => {
    assert.equal(kindLabel("ebook", false, kinds), "E-book");
    assert.equal(kindLabel("ebook", true, kinds), "E-books");
    assert.equal(kindLabel("font_family", false, kinds), "Font family");
    assert.equal(kindLabel("font_family", true, kinds), "Font families");
    assert.equal(humanizeKind("audio_book"), "Audio book");
    assert.equal(kindLabel("box", true, kinds), "Boxes");
  });

  test("configured kinds first, in their order, then the rest by name", () => {
    assert.deepEqual(
      orderKinds(["zine", "course", "art", "ebook", "course"], kinds),
      ["ebook", "course", "art", "zine"]
    );
  });

  test("digitalKindOf reads digital_kind and ignores anything else", () => {
    const p = (attributes: Record<string, unknown>) => ({ attributes });
    assert.equal(digitalKindOf(p({ digital_kind: "ebook" })), "ebook");
    assert.equal(digitalKindOf(p({})), null);
    assert.equal(digitalKindOf(p({ digital_kind: null })), null);
    assert.equal(digitalKindOf(p({ digital_kind: "Not a kind" })), null);
    assert.equal(digitalKindOf(null), null);
  });

  test("formatBytes", () => {
    assert.equal(formatBytes(0), "0 B");
    assert.equal(formatBytes(512), "512 B");
    assert.equal(formatBytes(1536), "1.5 KB");
    assert.equal(formatBytes(5 * 1024 * 1024), "5.0 MB");
    assert.equal(formatBytes(3 * 1024 * 1024 * 1024), "3.00 GB");
  });
});

describe("groupLibrary", () => {
  const kinds = parseDigitalKinds("ebook,course");

  test("groups by kind, configured kinds first, and skips empty kinds", () => {
    const groups = groupLibrary(
      [
        item(1, "course", "Course"),
        item(2, "art", "Print"),
        item(3, "ebook", "Book")
      ],
      kinds
    );
    assert.deepEqual(
      groups.map((g) => g.kind),
      ["ebook", "course", "art"]
    );
  });

  test("with no kinds configured, groups by name", () => {
    const groups = groupLibrary(
      [item(1, "zine", "Z"), item(2, "art", "A")],
      []
    );
    assert.deepEqual(
      groups.map((g) => g.kind),
      ["art", "zine"]
    );
  });

  test("newest first within a kind, revoked items last", () => {
    const [g] = groupLibrary(
      [
        item(1, "ebook", "Old", null, "2026-10-01T00:00:00Z"),
        item(
          2,
          "ebook",
          "Gone",
          "2026-11-10T00:00:00Z",
          "2026-11-09T00:00:00Z"
        ),
        item(3, "ebook", "New", null, "2026-11-05T00:00:00Z")
      ],
      kinds
    );
    assert.deepEqual(
      g.items.map((i) => i.product.name),
      ["New", "Old", "Gone"]
    );
  });

  test("ignores items without a kind", () => {
    assert.deepEqual(
      groupLibrary([{ ...item(1, "ebook", "X"), kind: "" }], kinds),
      []
    );
  });
});

describe("includedLine", () => {
  test("files and size, when known", () => {
    assert.equal(
      includedLine({ kind: "ebook", file_count: 3, byte_size: 1536 }),
      "3 files · 1.5 KB"
    );
    assert.equal(includedLine({ kind: "ebook", file_count: 1 }), "1 file");
    assert.equal(includedLine({ kind: "ebook" }), "");
    assert.equal(includedLine(null), "");
  });
});

describe("libraryAppLink", () => {
  test("joins the configured app link and the variant id", () => {
    assert.equal(
      libraryAppLink(42, "exampleapp://library"),
      "exampleapp://library/42"
    );
    assert.equal(
      libraryAppLink("7", "https://app.example.com/library/"),
      "https://app.example.com/library/7"
    );
  });

  test("no link without a configured, safe base", () => {
    assert.equal(libraryAppLink(42, ""), null);
    assert.equal(libraryAppLink(42, undefined), null);
    assert.equal(libraryAppLink(42, "library"), null);
    assert.equal(libraryAppLink(42, "javascript:alert(1)"), null);
    assert.equal(libraryAppLink(42, "data:text/html,x"), null);
  });
});
