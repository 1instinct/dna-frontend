import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  absoluteUrl,
  buildGallery,
  hasMsrp,
  isPreorder,
  JsonApiResource,
  pickGridMedia,
  pickStyle,
  playbackDecision,
  staticMedia
} from "../productMedia";

const BASE = "https://admin.example.test";

const styles = (name: string) => [
  { url: `/s/48/${name}`, width: "48", height: "48" },
  { url: `/s/240/${name}`, width: "240", height: "240" },
  { url: `/s/600/${name}`, width: "600", height: "600" },
  { url: `/s/1000/${name}`, width: "1000", height: "1000" },
  { url: `/s/1600x900/${name}`, width: "1600", height: "900" },
  { url: `/s/900x1600/${name}`, width: "900", height: "1600" }
];

const image = (
  id: string,
  name: string,
  extra: Record<string, unknown> = {}
): JsonApiResource => ({
  id,
  type: "image",
  attributes: { styles: styles(name), ...extra }
});

const gif = (id: string, position?: number) =>
  image(id, `${id}.gif`, {
    position,
    content_type: "image/gif",
    animated: true,
    animated_url: `/rails/active_storage/blobs/redirect/${id}/teaser.gif`
  });

const video = (
  id: string,
  extra: Record<string, unknown> = {}
): JsonApiResource => ({
  id,
  type: "product_video",
  attributes: {
    url: `/rails/active_storage/blobs/redirect/v${id}/clip.mp4`,
    content_type: "video/mp4",
    poster_url: `/p/1000/v${id}.jpg`,
    poster_thumb_url: `/p/240/v${id}.jpg`,
    position: 1,
    ...extra
  }
});

const product = (
  rel: { images?: string[]; videos?: string[]; props?: string[] },
  attrs: Record<string, unknown> = {}
): JsonApiResource => ({
  id: "1",
  type: "product",
  attributes: { name: "Example Product", ...attrs },
  relationships: {
    ...(rel.images
      ? { images: { data: rel.images.map((id) => ({ id, type: "image" })) } }
      : {}),
    ...(rel.videos
      ? {
          videos: {
            data: rel.videos.map((id) => ({ id, type: "product_video" }))
          }
        }
      : {}),
    ...(rel.props
      ? {
          product_properties: {
            data: rel.props.map((id) => ({ id, type: "product_property" }))
          }
        }
      : {})
  }
});

describe("absoluteUrl", () => {
  test("prefixes relative paths and tolerates slashes", () => {
    assert.equal(absoluteUrl("/a.png", BASE), `${BASE}/a.png`);
    assert.equal(absoluteUrl("a.png", `${BASE}/`), `${BASE}/a.png`);
    assert.equal(absoluteUrl("/a.png", ""), "/a.png");
  });
  test("leaves absolute and special URLs alone", () => {
    assert.equal(
      absoluteUrl("https://cdn.x/a.png", BASE),
      "https://cdn.x/a.png"
    );
    assert.equal(absoluteUrl("//cdn.x/a.png", BASE), "//cdn.x/a.png");
    assert.equal(
      absoluteUrl("data:image/gif;base64,AA", BASE),
      "data:image/gif;base64,AA"
    );
  });
  test("returns null for empty input", () => {
    assert.equal(absoluteUrl(null, BASE), null);
    assert.equal(absoluteUrl("", BASE), null);
  });
});

describe("pickStyle", () => {
  test("smallest square style at least minWidth", () => {
    assert.equal(pickStyle(styles("x"), 600)?.url, "/s/600/x");
    assert.equal(pickStyle(styles("x"), 601)?.url, "/s/1000/x");
  });
  test("falls back to the widest square when none is wide enough", () => {
    assert.equal(pickStyle(styles("x"), 5000)?.url, "/s/1000/x");
  });
  test("empty", () => {
    assert.equal(pickStyle([], 600), null);
    assert.equal(pickStyle(undefined, 600), null);
  });
});

describe("pickGridMedia", () => {
  test("today's payload: first image, static, 600px poster, prefixed", () => {
    const p = product({ images: ["7", "68"] });
    const m = pickGridMedia(p, [image("7", "a.jpg"), image("68", "b.gif")], {
      baseUrl: BASE
    });
    assert.ok(m);
    assert.equal(m.kind, "image");
    assert.equal(m.poster, `${BASE}/s/600/a.jpg`);
    assert.equal(m.src, m.poster);
    assert.equal(m.thumb, `${BASE}/s/240/a.jpg`);
    assert.equal(m.alt, "Example Product");
  });

  test("motion beats position: animated image wins over an earlier JPG", () => {
    const p = product({ images: ["7", "68"] });
    const m = pickGridMedia(
      p,
      [image("7", "a.jpg", { position: 1 }), gif("68", 1)],
      { baseUrl: BASE }
    );
    assert.equal(m?.kind, "gif");
    assert.equal(m?.sourceId, "68");
    // Poster is the static first-frame style, src the original.
    assert.equal(m?.poster, `${BASE}/s/600/68.gif`);
    assert.equal(
      m?.src,
      `${BASE}/rails/active_storage/blobs/redirect/68/teaser.gif`
    );
  });

  test("a GIF without animated_url is just an image", () => {
    const p = product({ images: ["68"] });
    const m = pickGridMedia(
      p,
      [image("68", "b.gif", { animated: true, animated_url: null })],
      { baseUrl: BASE }
    );
    assert.equal(m?.kind, "image");
  });

  test("first playable video wins over everything, with the thumb poster", () => {
    const p = product({ images: ["68"], videos: ["2", "3"] });
    const m = pickGridMedia(
      p,
      [gif("68"), video("2", { position: 2 }), video("3", { position: 1 })],
      { baseUrl: BASE }
    );
    assert.equal(m?.kind, "video");
    assert.equal(m?.sourceId, "3");
    assert.equal(m?.poster, `${BASE}/p/240/v3.jpg`);
    assert.equal(
      m?.src,
      `${BASE}/rails/active_storage/blobs/redirect/v3/clip.mp4`
    );
  });

  test("skips unplayable or poster-less videos", () => {
    const p = product({ images: ["7"], videos: ["2", "3", "4"] });
    const m = pickGridMedia(
      p,
      [
        image("7", "a.jpg"),
        video("2", { content_type: "video/quicktime" }),
        video("3", { url: null }),
        video("4", { poster_url: null, poster_thumb_url: null })
      ],
      { baseUrl: BASE }
    );
    assert.equal(m?.kind, "image");
  });

  test("videos relationship missing or not included: falls back to images", () => {
    const p = product({ images: ["7"], videos: ["9"] });
    assert.equal(pickGridMedia(p, [image("7", "a.jpg")])?.kind, "image");
  });

  test("no media: null (caller shows the placeholder)", () => {
    assert.equal(pickGridMedia(product({ images: [] }), []), null);
    assert.equal(pickGridMedia(product({}), undefined), null);
    assert.equal(pickGridMedia(null, []), null);
  });

  test("uses alt from the record when present", () => {
    const p = product({ images: ["7"] });
    const m = pickGridMedia(p, [image("7", "a.jpg", { alt: "Front view" })]);
    assert.equal(m?.alt, "Front view");
  });
});

describe("buildGallery", () => {
  const included = [
    image("7", "black-1.jpg", { position: 1 }),
    gif("68", 1),
    image("8", "black-2.jpg", { position: 2 }),
    image("69", "rack.jpg", { position: 2 }),
    video("2", { position: 2 }),
    video("3", { position: 1 })
  ];
  const p = product({ images: ["7", "68", "8", "69"], videos: ["2", "3"] });

  test("videos first by position, then images by position (stable ties)", () => {
    const g = buildGallery(p, included, { baseUrl: BASE });
    assert.deepEqual(
      g.map((m) => m.key),
      [
        "product_video-3",
        "product_video-2",
        "image-7",
        "image-68",
        "image-8",
        "image-69"
      ]
    );
  });

  test("PDP posters are the large renditions; thumbs are static", () => {
    const g = buildGallery(p, included, { baseUrl: BASE });
    const v = g[0];
    assert.equal(v.poster, `${BASE}/p/1000/v3.jpg`);
    assert.equal(v.thumb, `${BASE}/p/240/v3.jpg`);
    const gifItem = g.find((m) => m.key === "image-68");
    assert.equal(gifItem?.kind, "gif");
    assert.equal(gifItem?.poster, `${BASE}/s/1600x900/68.gif`);
    assert.equal(gifItem?.thumb, `${BASE}/s/240/68.gif`);
    assert.match(gifItem?.src || "", /teaser\.gif$/);
  });

  test("prefers transformed_url for the main slide, like the old PDP", () => {
    const g = buildGallery(
      product({ images: ["7"] }),
      [image("7", "a.jpg", { transformed_url: "/t/2400/a.jpg" })],
      { baseUrl: BASE }
    );
    assert.equal(g[0].poster, `${BASE}/t/2400/a.jpg`);
  });

  test("selected variant: its images plus product-level videos", () => {
    const g = buildGallery(p, included, {
      baseUrl: BASE,
      variantImageIds: ["7", "8"]
    });
    assert.deepEqual(
      g.map((m) => m.key),
      ["product_video-3", "product_video-2", "image-7", "image-8"]
    );
  });

  test("variant with no matching images keeps the full list", () => {
    const g = buildGallery(p, included, { variantImageIds: ["999"] });
    assert.equal(g.length, 6);
  });

  test("alt text numbers images when none is given", () => {
    const g = buildGallery(product({ images: ["7"] }), [image("7", "a.jpg")]);
    assert.equal(g[0].alt, "Example Product - Image 1");
  });

  test("no images relationship: uses every included image", () => {
    const g = buildGallery(product({}), [
      image("7", "a.jpg"),
      image("8", "b.jpg")
    ]);
    assert.equal(g.length, 2);
  });

  test("empty", () => {
    assert.deepEqual(buildGallery(null, []), []);
    assert.deepEqual(buildGallery(product({ images: [] }), []), []);
  });
});

describe("playbackDecision", () => {
  const base = {
    visible: true,
    active: true,
    reducedMotion: false,
    saveData: false
  };

  test("grid: plays only while visible", () => {
    for (const kind of ["video", "gif"] as const) {
      assert.deepEqual(playbackDecision({ ...base, kind, surface: "grid" }), {
        animate: true,
        showControls: false
      });
      assert.equal(
        playbackDecision({ ...base, kind, surface: "grid", visible: false })
          .animate,
        false
      );
    }
  });

  test("grid: reduced motion and save-data mean poster only, no controls", () => {
    for (const flag of ["reducedMotion", "saveData"] as const) {
      for (const kind of ["video", "gif"] as const) {
        assert.deepEqual(
          playbackDecision({ ...base, kind, surface: "grid", [flag]: true }),
          { animate: false, showControls: false }
        );
      }
    }
  });

  test("pdp: only the selected slide plays", () => {
    // Autoplays, with controls to pause it (or start it if autoplay is refused).
    assert.deepEqual(
      playbackDecision({ ...base, kind: "video", surface: "pdp" }),
      { animate: true, showControls: true }
    );
    assert.deepEqual(
      playbackDecision({ ...base, kind: "gif", surface: "pdp" }),
      { animate: true, showControls: false }
    );
    assert.deepEqual(
      playbackDecision({
        ...base,
        kind: "video",
        surface: "pdp",
        active: false
      }),
      { animate: false, showControls: false }
    );
    assert.equal(
      playbackDecision({ ...base, kind: "gif", surface: "pdp", active: false })
        .animate,
      false
    );
  });

  test("pdp + reduced motion/save-data: video offers controls, GIF stays still", () => {
    for (const flag of ["reducedMotion", "saveData"] as const) {
      assert.deepEqual(
        playbackDecision({
          ...base,
          kind: "video",
          surface: "pdp",
          [flag]: true
        }),
        { animate: false, showControls: true }
      );
      assert.deepEqual(
        playbackDecision({
          ...base,
          kind: "gif",
          surface: "pdp",
          [flag]: true
        }),
        { animate: false, showControls: false }
      );
    }
  });

  test("static images never animate", () => {
    assert.deepEqual(
      playbackDecision({ ...base, kind: "image", surface: "pdp" }),
      { animate: false, showControls: false }
    );
  });
});

describe("staticMedia", () => {
  test("wraps a URL, null for none", () => {
    assert.equal(staticMedia("/a.png", "A")?.kind, "image");
    assert.equal(staticMedia("/a.png", "A")?.poster, "/a.png");
    assert.equal(staticMedia(null, "A"), null);
  });
});

describe("price and properties", () => {
  test("hasMsrp only when compare_at_price exceeds price", () => {
    assert.equal(hasMsrp("49.00", "199.99"), true);
    assert.equal(hasMsrp("199.00", "0.00"), false);
    assert.equal(hasMsrp("49.00", null), false);
    assert.equal(hasMsrp("49.00", "49.00"), false);
    assert.equal(hasMsrp(undefined, "10"), false);
  });

  test("isPreorder reads the preorder product property", () => {
    const p = product({ props: ["10", "11"] });
    const props = (value: string): JsonApiResource[] => [
      {
        id: "10",
        type: "product_property",
        attributes: { name: "material", value: "cotton" }
      },
      {
        id: "11",
        type: "product_property",
        attributes: { name: "preorder", value }
      }
    ];
    assert.equal(isPreorder(p, props("true")), true);
    assert.equal(isPreorder(p, props(" TRUE ")), true);
    assert.equal(isPreorder(p, props("false")), false);
    assert.equal(isPreorder(product({}), props("true")), false);
  });
});
