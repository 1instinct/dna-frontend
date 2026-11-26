// Pure helpers that turn a Spree storefront (JSON:API) product plus its
// `included` records into media the UI can render: one item for a grid card,
// or an ordered list for the PDP gallery. No React, no window: safe on the
// server and under the plain Node test runner.
//
// Contract (backend, may be absent on older deploys):
//   image: styles[] (static; frame 0 for a GIF), alt, position, content_type,
//          width, height, byte_size, animated, animated_url
//   product_video: url, content_type, byte_size, alt, position, poster_url,
//          poster_thumb_url
// Every new attribute is optional here, so today's payloads still work.

export interface JsonApiRef {
  id: string;
  type: string;
}

export interface JsonApiResource {
  id: string;
  type: string;
  attributes?: Record<string, any>;
  relationships?: Record<string, { data?: JsonApiRef | JsonApiRef[] | null }>;
}

export type MediaKind = "video" | "gif" | "image";

export interface MediaItem {
  /** Stable React key, e.g. "image-68" or "product_video-3". */
  key: string;
  kind: MediaKind;
  /** JSON:API id of the image or product_video record. */
  sourceId: string;
  alt: string;
  /** Static frame shown before (or instead of) motion. Null only for a video with no poster. */
  poster: string | null;
  /** Small static frame for thumbnail strips. */
  thumb: string | null;
  /** What plays: the GIF original, the video file, or the full image for kind "image". */
  src: string | null;
  contentType: string | null;
}

export interface MediaOptions {
  /** Prefix for relative paths, normally NEXT_PUBLIC_SPREE_API_URL. */
  baseUrl?: string;
  /** Used to build alt text when the record has none. */
  productName?: string;
  /** Minimum poster width for the surface (grid card vs. PDP). */
  posterWidth?: number;
}

const DEFAULT_GRID_POSTER_WIDTH = 600;
const THUMB_WIDTH = 240;

// ── URLs ─────────────────────────────────────────────────────────────

/**
 * Make a Spree path absolute. Absolute (http/https), protocol-relative, data:
 * and blob: URLs pass through; anything else is prefixed with baseUrl.
 */
export function absoluteUrl(
  path: string | null | undefined,
  baseUrl = ""
): string | null {
  if (!path || typeof path !== "string") return null;
  if (/^(https?:)?\/\//i.test(path) || /^(data|blob):/i.test(path)) return path;
  const base = baseUrl.replace(/\/+$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}

// ── Styles ───────────────────────────────────────────────────────────

interface Style {
  url: string;
  width?: string | number;
  height?: string | number;
}

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Smallest style at least `minWidth` wide, preferring square styles (Spree also
 * ships 1600x900 and 900x1600 crops that look wrong in a square card). Falls
 * back to the widest style when none is wide enough.
 */
export function pickStyle(
  styles: Style[] | null | undefined,
  minWidth: number
): Style | null {
  const list = (styles || []).filter((s) => s && s.url);
  if (!list.length) return null;
  const square = list.filter(
    (s) => !s.height || num(s.width) === num(s.height)
  );
  const pool = square.length ? square : list;
  const sorted = [...pool].sort((a, b) => num(a.width) - num(b.width));
  return (
    sorted.find((s) => num(s.width) >= minWidth) || sorted[sorted.length - 1]
  );
}

/** The largest static rendition, used for the PDP main slide (matches the old PDP choice). */
function largestStatic(attrs: Record<string, any>): string | null {
  if (attrs.transformed_url) return attrs.transformed_url;
  const styles: Style[] = attrs.styles || [];
  const widest = styles.reduce<Style | null>(
    (best, s) => (!best || num(s.width) > num(best.width) ? s : best),
    null
  );
  return widest?.url || null;
}

// ── Records → MediaItem ──────────────────────────────────────────────

const altFor = (
  attrs: Record<string, any>,
  opts: MediaOptions,
  fallbackIndex?: number
): string => {
  if (attrs.alt) return String(attrs.alt);
  const name = opts.productName || "Product";
  return fallbackIndex !== undefined
    ? `${name} - Image ${fallbackIndex + 1}`
    : name;
};

/** True when the image is an animated GIF with a reachable original. */
export function isAnimatedImage(image: JsonApiResource): boolean {
  const a = image.attributes || {};
  return a.animated === true && !!a.animated_url;
}

export function imageToMedia(
  image: JsonApiResource,
  opts: MediaOptions = {},
  index?: number,
  surface: "grid" | "pdp" = "grid"
): MediaItem | null {
  const a = image.attributes || {};
  const base = opts.baseUrl || "";
  const posterStyle =
    surface === "pdp"
      ? largestStatic(a)
      : pickStyle(a.styles, opts.posterWidth || DEFAULT_GRID_POSTER_WIDTH)
          ?.url || null;
  const poster = absoluteUrl(posterStyle, base);
  if (!poster) return null;
  const thumb =
    absoluteUrl(pickStyle(a.styles, THUMB_WIDTH)?.url, base) || poster;
  const animated = isAnimatedImage(image);
  return {
    key: `image-${image.id}`,
    kind: animated ? "gif" : "image",
    sourceId: image.id,
    alt: altFor(a, opts, index),
    poster,
    thumb,
    src: animated ? absoluteUrl(a.animated_url, base) : poster,
    contentType: a.content_type ?? null
  };
}

const PLAYABLE_VIDEO = /^video\/(mp4|webm)\b/i;

/** A video is playable when it has a file and (if typed) is MP4 or WebM. */
export function isPlayableVideo(video: JsonApiResource): boolean {
  const a = video.attributes || {};
  if (!a.url) return false;
  return !a.content_type || PLAYABLE_VIDEO.test(String(a.content_type));
}

export function videoToMedia(
  video: JsonApiResource,
  opts: MediaOptions = {},
  surface: "grid" | "pdp" = "grid"
): MediaItem | null {
  if (!isPlayableVideo(video)) return null;
  const a = video.attributes || {};
  const base = opts.baseUrl || "";
  const big = absoluteUrl(a.poster_url, base);
  const small = absoluteUrl(a.poster_thumb_url, base);
  // Grid cards use the small poster; the PDP uses the large one.
  const poster = surface === "pdp" ? big || small : small || big;
  return {
    key: `product_video-${video.id}`,
    kind: "video",
    sourceId: video.id,
    alt: a.alt ? String(a.alt) : `${opts.productName || "Product"} video`,
    poster,
    thumb: small || big,
    src: absoluteUrl(a.url, base),
    contentType: a.content_type ?? null
  };
}

/** Wrap a plain image URL (legacy callers, placeholders) as static media. */
export function staticMedia(
  src: string | null | undefined,
  alt: string
): MediaItem | null {
  if (!src) return null;
  return {
    key: `static-${src}`,
    kind: "image",
    sourceId: src,
    alt,
    poster: src,
    thumb: src,
    src,
    contentType: null
  };
}

// ── Lookups ──────────────────────────────────────────────────────────

const refs = (
  resource: JsonApiResource | null | undefined,
  rel: string
): JsonApiRef[] | null => {
  const data = resource?.relationships?.[rel]?.data;
  if (data === undefined || data === null) return null;
  return Array.isArray(data) ? data : [data];
};

function indexIncluded(
  included: JsonApiResource[] | null | undefined
): Map<string, JsonApiResource> {
  const map = new Map<string, JsonApiResource>();
  for (const r of included || []) {
    if (r && r.type && r.id !== undefined) map.set(`${r.type}:${r.id}`, r);
  }
  return map;
}

const resolve = (
  map: Map<string, JsonApiResource>,
  list: JsonApiRef[] | null,
  type: string
): JsonApiResource[] =>
  (list || [])
    .map((ref) => map.get(`${type}:${ref.id}`))
    .filter((r): r is JsonApiResource => !!r);

/** Stable sort by `position` (missing positions keep API order, after positioned ones tie). */
function byPosition<T extends JsonApiResource>(list: T[]): T[] {
  return list
    .map((r, i) => ({ r, i }))
    .sort((x, y) => {
      const px = x.r.attributes?.position;
      const py = y.r.attributes?.position;
      const hx = typeof px === "number";
      const hy = typeof py === "number";
      if (hx && hy && px !== py) return px - py;
      if (hx !== hy) return hx ? -1 : 1;
      return x.i - y.i;
    })
    .map(({ r }) => r);
}

/** The product's images in position order. */
export function productImages(
  product: JsonApiResource,
  included: JsonApiResource[] | null | undefined
): JsonApiResource[] {
  return byPosition(
    resolve(indexIncluded(included), refs(product, "images"), "image")
  );
}

/** The product's videos (type product_video) in position order. */
export function productVideos(
  product: JsonApiResource,
  included: JsonApiResource[] | null | undefined
): JsonApiResource[] {
  return byPosition(
    resolve(indexIncluded(included), refs(product, "videos"), "product_video")
  );
}

// ── Which media to show ──────────────────────────────────────────────

/**
 * Grid rule: first playable video, else first animated image, else first
 * image, else null (caller shows its placeholder). Motion beats position.
 */
export function pickGridMedia(
  product: JsonApiResource | null | undefined,
  included: JsonApiResource[] | null | undefined,
  opts: MediaOptions = {}
): MediaItem | null {
  if (!product) return null;
  const o = { productName: product.attributes?.name, ...opts };

  for (const v of productVideos(product, included)) {
    const m = videoToMedia(v, o, "grid");
    // A video with no poster at all would leave the card blank until it plays.
    if (m && m.poster) return m;
  }
  const images = productImages(product, included);
  for (const img of images) {
    if (isAnimatedImage(img)) {
      const m = imageToMedia(img, o, undefined, "grid");
      if (m) return m;
    }
  }
  for (const img of images) {
    const m = imageToMedia(img, o, undefined, "grid");
    if (m) return m;
  }
  return null;
}

export interface GalleryOptions extends MediaOptions {
  /**
   * Image ids of the selected variant. When non-empty and at least one matches,
   * only those images are shown (product-level videos always stay).
   */
  variantImageIds?: string[] | null;
}

/** PDP rule: videos first in position order, then images in position order. */
export function buildGallery(
  product: JsonApiResource | null | undefined,
  included: JsonApiResource[] | null | undefined,
  opts: GalleryOptions = {}
): MediaItem[] {
  if (!product) return [];
  const o = { productName: product.attributes?.name, ...opts };

  const videos = productVideos(product, included)
    .map((v) => videoToMedia(v, o, "pdp"))
    .filter((m): m is MediaItem => !!m);

  let images = productImages(product, included);
  // Older payloads without an images relationship: fall back to every included image.
  if (refs(product, "images") === null) {
    images = byPosition((included || []).filter((r) => r.type === "image"));
  }
  const wanted = opts.variantImageIds?.filter(Boolean) || [];
  if (wanted.length) {
    const subset = images.filter((img) => wanted.includes(img.id));
    if (subset.length) images = subset;
  }

  const imageItems = images
    .map((img, i) => imageToMedia(img, o, i, "pdp"))
    .filter((m): m is MediaItem => !!m);

  return [...videos, ...imageItems];
}

// ── Playback decision ────────────────────────────────────────────────

export interface PlaybackInput {
  kind: MediaKind;
  surface: "grid" | "pdp";
  /** Intersecting the viewport (with margin). */
  visible: boolean;
  /** PDP only: this is the selected slide. Grid cards are always active. */
  active?: boolean;
  reducedMotion: boolean;
  saveData: boolean;
}

export interface PlaybackDecision {
  /** Swap the GIF in / autoplay the video now. */
  animate: boolean;
  /** Render a video element with native controls so the user can opt in. */
  showControls: boolean;
}

/**
 * Static images never animate. Motion needs: visible, active
 * (PDP selected slide), no reduced-motion preference, no save-data. The PDP's
 * selected video always has native controls: with motion off they are the way
 * in, and with motion on they are the way to pause it (WCAG 2.2.2) and the way
 * in when the browser refuses autoplay (iOS Low Power Mode). A GIF just stays
 * on its poster.
 */
export function playbackDecision(input: PlaybackInput): PlaybackDecision {
  const active = input.surface === "grid" ? true : !!input.active;
  if (input.kind === "image") return { animate: false, showControls: false };
  const motionAllowed = !input.reducedMotion && !input.saveData;
  const animate = input.visible && active && motionAllowed;
  const showControls =
    input.kind === "video" && input.surface === "pdp" && active;
  return { animate, showControls };
}

// ── Prices / properties (FeaturedShelf, Hero) ───────────────────────

/** compare_at_price is shown only when it parses and exceeds price. */
export function hasMsrp(
  price: string | number | null | undefined,
  compareAt: string | number | null | undefined
): boolean {
  const p = parseFloat(String(price ?? ""));
  const c = parseFloat(String(compareAt ?? ""));
  return Number.isFinite(p) && Number.isFinite(c) && c > p;
}

/** Value of a product_property by name (e.g. "preorder"), or null. */
export function productPropertyValue(
  product: JsonApiResource,
  included: JsonApiResource[] | null | undefined,
  name: string
): string | null {
  const map = indexIncluded(included);
  for (const p of resolve(
    map,
    refs(product, "product_properties"),
    "product_property"
  )) {
    if (p.attributes?.name === name) return p.attributes?.value ?? null;
  }
  return null;
}

export const isPreorder = (
  product: JsonApiResource,
  included: JsonApiResource[] | null | undefined
): boolean =>
  String(productPropertyValue(product, included, "preorder") || "")
    .trim()
    .toLowerCase() === "true";
