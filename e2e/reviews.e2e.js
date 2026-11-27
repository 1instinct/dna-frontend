/**
 * Product reviews end-to-end checks (M2.6, plus the M4.5 email page
 * `/review/[token]`, M5 store reviews and M6 product Q&A), with the
 * dna-admin API mocked by Playwright `page.route()`. Plain Node + the `playwright` package (the
 * `@playwright/test` runner isn't a dependency of this repo).
 *
 * Run:
 *   yarn test:e2e
 *     Starts `next dev` on E2E_PORT (default 3100) with reviews switched on
 *     and NEXT_PUBLIC_SPREE_API_URL pointed at a dead local port, so
 *     server-side fetches fail fast and every browser call to the API is
 *     answered by the mocks below. Stops the server when done.
 *
 *   E2E_BASE_URL=http://localhost:3100 yarn test:e2e
 *     Reuses a server you started yourself. Start it with the same env:
 *       NEXT_PUBLIC_REVIEWS_ENABLED=true NEXT_PUBLIC_IS_MAINT_MODE=false \
 *       NEXT_PUBLIC_SPREE_API_URL=http://127.0.0.1:9 \
 *       NEXT_PUBLIC_SPREE_ACCESS_TOKEN=e2e npx next dev -p 3100
 *     (Set E2E_API_URL if you used a different NEXT_PUBLIC_SPREE_API_URL.)
 *
 * Needs `require("playwright")` to resolve (a global install on NODE_PATH or
 * `npm i -g playwright`) and its Chromium (`npx playwright install chromium`).
 * Other env: E2E_HEADED=1 to watch, E2E_ONLY=<substring> to run some checks.
 */
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const zlib = require("zlib");
const assert = require("assert");

const PORT = Number(process.env.E2E_PORT || 3100);
const BASE_URL = (
  process.env.E2E_BASE_URL || `http://localhost:${PORT}`
).replace(/\/+$/, "");
const API_URL = (process.env.E2E_API_URL || "http://127.0.0.1:9").replace(
  /\/+$/,
  ""
);
const ROOT = path.resolve(__dirname, "..");
const SLUG = "rib-knit-wrap-top";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const svg = (a, b, label = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="750" fill="url(#g)"/><text x="300" y="390" font-family="monospace" font-size="40" fill="rgba(255,255,255,.8)" text-anchor="middle">${label}</text></svg>`;
const COLORS = [
  ["#e9b3ad", "#c77f86"],
  ["#d8c2b4", "#a58b7d"],
  ["#3b3335", "#796a6d"],
  ["#f0c9c4", "#d18c95"],
  ["#cdb7e0", "#9d7fb8"],
  ["#e8d5c9", "#bfa392"]
];

const PRODUCTS = [
  {
    id: 11,
    slug: SLUG,
    name: "Rib-Knit Wrap Top",
    price: "88.0",
    avg: "4.6",
    count: 128
  },
  {
    id: 12,
    slug: "linen-wide-leg-trouser",
    name: "Linen Wide-Leg Trouser",
    price: "112.0",
    avg: "4.3",
    count: 57
  },
  {
    id: 13,
    slug: "satin-slip-skirt",
    name: "Satin Slip Skirt",
    price: "94.0",
    avg: "4.8",
    count: 21
  }
];

const imageUrl = (n) => `${API_URL}/img/p${n}.svg`;
const photoUrl = (n) => `${API_URL}/photos/${n}.svg`;

const productResource = (p) => ({
  id: String(p.id),
  type: "product",
  attributes: {
    name: p.name,
    slug: p.slug,
    description: "Fine-rib stretch knit with a tie wrap and long sleeves.",
    price: p.price,
    currency: "USD",
    display_price: `$${p.price}`,
    in_stock: true,
    available: true,
    purchasable: true,
    avg_rating: p.avg,
    reviews_count: p.count,
    all_avg_rating: p.avg,
    all_reviews_count: p.count
  },
  relationships: {
    default_variant: { data: { id: `v${p.id}`, type: "variant" } },
    variants: { data: [{ id: `v${p.id}`, type: "variant" }] },
    images: { data: [{ id: `i${p.id}`, type: "image" }] }
  }
});
const imageResource = (p, i) => ({
  id: `i${p.id}`,
  type: "image",
  attributes: {
    position: 1,
    alt: null,
    styles: [100, 240, 350, 600, 600, 1200].map((w) => ({
      url: `/img/p${i}.svg`,
      width: String(w),
      height: String(Math.round(w * 1.25))
    }))
  }
});
const variantResource = (p) => ({
  id: `v${p.id}`,
  type: "variant",
  attributes: { sku: `SKU-${p.id}`, price: p.price },
  relationships: { option_values: { data: [] } }
});

const reviewPhoto = (id, reviewId, c) => ({
  id,
  review_id: reviewId,
  thumb_url: photoUrl(c),
  card_url: photoUrl(c),
  full_url: photoUrl(c),
  alt: "Customer photo of Rib-Knit Wrap Top"
});

const REVIEWS = [
  [
    77,
    5,
    "Softest thing I own",
    "The rib has real weight but it's not hot. The wrap sits right at my waist and the tie doesn't slip.",
    "Maya R.",
    "Rose · M",
    2,
    [0, 1],
    24
  ],
  [
    78,
    2,
    "Lovely fabric, sizing was off",
    "I'm usually a solid S and this pulled across the shoulders. The color is beautiful in person.",
    "Jordan T.",
    "Black · S",
    1,
    [],
    19
  ],
  [
    80,
    4,
    "Great top, a little pilling",
    "After about six washes there's light pilling under the arms. Still wearing it constantly.",
    "Sam W.",
    "Rose · L",
    3,
    [2],
    15
  ],
  [
    81,
    1,
    "Not for me",
    "The neckline sat much lower on me than in the photos. Returned it.",
    "Lee H.",
    "Black · M",
    3,
    [],
    7
  ],
  [
    83,
    3,
    "Nice, but thinner than expected",
    "Comfortable and the color is great. More of a spring piece for me.",
    "Chris D.",
    "Rose · S",
    3,
    [],
    5
  ]
].map(([id, rating, title, body, name, variant, fit, photos, helpful], i) => ({
  id,
  rating,
  title,
  body,
  display_name: name,
  variant_label: variant,
  verified_purchase: true,
  incentivized: i % 2 === 0,
  channel: "retail",
  attribute_ratings: { fit },
  photos: photos.map((c, k) => reviewPhoto(500 + id * 10 + k, id, c)),
  helpful_count: helpful,
  unhelpful_count: 1,
  reply: null,
  published_at: `2026-11-${String(20 - i).padStart(2, "0")}T09:12:00Z`,
  edited: false
}));

const summary = (slug) => {
  const product = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
  return {
    scope: "retail",
    average: Number(product.avg),
    ratings_count: product.count,
    reviews_count: 84,
    photos_count: 3,
    histogram: { 1: 3, 2: 4, 3: 8, 4: 21, 5: 92 },
    attributes: [
      {
        key: "fit",
        label: "Fit",
        kind: "bipolar",
        low_label: "Runs small",
        high_label: "Runs large",
        average: 2.4,
        count: 31
      },
      {
        key: "quality",
        label: "Quality",
        kind: "scale",
        low_label: null,
        high_label: null,
        average: 4.7,
        count: 60
      }
    ],
    ai_summary: null,
    latest_photos: [0, 1, 2].map((c, i) => reviewPhoto(900 + i, 77, c))
  };
};

const QUESTIONS = [
  {
    key: "fit",
    label: "Fit",
    kind: "bipolar",
    low_label: "Runs small",
    high_label: "Runs large"
  },
  {
    key: "quality",
    label: "Quality",
    kind: "scale",
    low_label: null,
    high_label: null
  }
];

const LIMITS = {
  max_photos: 5,
  max_photo_mb: 10,
  title_max: 120,
  body_max: 5000,
  photo_types: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"
  ]
};

const ownReview = (overrides = {}) => ({
  id: 901,
  rating: 4,
  title: "Fits well through the waist",
  body: "Soft rib, sits right at the waist. Sleeves are a touch long on me.",
  display_name: "Maya R.",
  variant_label: "Rose · M",
  verified_purchase: true,
  incentivized: true,
  channel: "retail",
  attribute_ratings: { fit: 3, quality: 4 },
  photos: [],
  helpful_count: 0,
  unhelpful_count: 0,
  reply: null,
  published_at: "2026-11-24T10:00:00Z",
  edited: false,
  status: "published",
  status_message: "Your review is live.",
  product: {
    id: 12,
    slug: "linen-wide-leg-trouser",
    name: "Linen Wide-Leg Trouser",
    image_url: imageUrl(1)
  },
  points: { awarded: 50, pending: 0 },
  ...overrides
});

const REVIEWABLES = [
  {
    line_item_id: 53,
    order_number: "R123456",
    product_id: 11,
    slug: SLUG,
    name: "Rib-Knit Wrap Top",
    image_url: imageUrl(0),
    variant_label: "Rose · M",
    purchased_at: "2026-11-12T10:00:00Z",
    existing_review: null,
    questions: QUESTIONS
  },
  {
    line_item_id: 54,
    order_number: "R123456",
    product_id: 12,
    slug: "linen-wide-leg-trouser",
    name: "Linen Wide-Leg Trouser",
    image_url: imageUrl(1),
    variant_label: "Oat · 28",
    purchased_at: "2026-11-12T10:00:00Z",
    existing_review: { id: 901, rating: 4, status: "published" },
    questions: QUESTIONS
  },
  {
    line_item_id: 55,
    order_number: "R123456",
    product_id: 13,
    slug: "satin-slip-skirt",
    name: "Satin Slip Skirt",
    image_url: imageUrl(2),
    variant_label: "Black · S",
    purchased_at: "2026-11-12T10:00:00Z",
    existing_review: null,
    questions: []
  }
];

/* M4 email flow: GET /review_requests/:token (contract "M4 email flow"). */
const REVIEW_TOKEN = "e2e-review-token-3f9a";
const REVIEW_REQUEST = {
  order_number: "R123456",
  display_name: "Maya R.",
  items: REVIEWABLES.map((item) => ({
    line_item_id: item.line_item_id,
    product_id: item.product_id,
    slug: item.slug,
    name: item.name,
    image_url: item.image_url,
    variant_label: item.variant_label,
    questions: item.questions,
    existing_review: item.existing_review ? ownReview() : null
  })),
  store_review: { enabled: true, existing_review: null },
  points: { per_review: 50, photo_bonus: 50 },
  has_account: false,
  limits: LIMITS
};

const MY_REVIEWS = [
  ownReview(),
  ownReview({
    id: 902,
    rating: 2,
    title: "Runs small in the hips",
    body: "Pretty color, but I needed a size up. Exchanging.",
    status: "pending",
    status_message: "Thanks! We're checking it before it goes live.",
    published_at: null,
    product: {
      id: 14,
      slug: "cropped-boucle-jacket",
      name: "Cropped Boucle Jacket",
      image_url: imageUrl(3)
    },
    points: { awarded: 0, pending: 100 },
    photos: [reviewPhoto(950, 902, 3)]
  }),
  ownReview({
    id: 903,
    rating: 5,
    title: null,
    body: null,
    status: "rejected",
    status_message: "This review isn't shown on the site.",
    published_at: null,
    product: {
      id: 15,
      slug: "merino-crew",
      name: "Merino Crew",
      image_url: imageUrl(4)
    },
    points: { awarded: 0, pending: 0 }
  })
];

const ORDER = {
  data: {
    id: "1",
    type: "order",
    attributes: {
      number: "R123456",
      item_count: 3,
      state: "complete",
      created_at: "2026-11-12T10:00:00Z",
      completed_at: "2026-11-12T10:05:00Z",
      email: "maya@example.test",
      display_item_total: "$294.00",
      display_ship_total: "$0.00",
      display_tax_total: "$0.00",
      display_total: "$294.00"
    },
    relationships: {
      line_items: {
        data: [53, 54, 55].map((id) => ({ id: String(id), type: "line_item" }))
      },
      shipping_address: { data: { id: "a1", type: "address" } },
      billing_address: { data: { id: "a1", type: "address" } }
    }
  },
  included: [
    ...REVIEWABLES.map((r, i) => ({
      id: String(r.line_item_id),
      type: "line_item",
      attributes: {
        name: r.name,
        slug: r.slug,
        quantity: 1,
        display_total: `$${PRODUCTS[i].price}`
      },
      relationships: {
        variant: { data: { id: `v${r.product_id}`, type: "variant" } }
      }
    })),
    ...PRODUCTS.map((p) => ({
      id: `v${p.id}`,
      type: "variant",
      attributes: { sku: `SKU-${p.id}` }
    })),
    {
      id: "a1",
      type: "address",
      attributes: {
        firstname: "Maya",
        lastname: "R.",
        address1: "1 Main St",
        city: "Brooklyn",
        state_name: "NY",
        zipcode: "11201",
        phone: "555-0100"
      }
    }
  ]
};

const USER = {
  data: {
    id: "7",
    type: "user",
    attributes: {
      email: "maya@example.test",
      first_name: "Maya",
      is_wholesale: false
    }
  }
};

const TOKEN = {
  access_token: "e2e-user-token",
  token_type: "Bearer",
  expires_in: 7200,
  refresh_token: "e2e-refresh",
  created_at: Math.round(Date.now() / 1000)
};

/* M5 store reviews (contract "M5 store reviews"). */
const STORE_SUMMARY = {
  scope: "retail",
  average: 4.8,
  ratings_count: 1203,
  reviews_count: 640,
  histogram: { 1: 21, 2: 18, 3: 40, 4: 160, 5: 964 },
  attributes: [
    {
      key: "delivery",
      label: "Delivery",
      kind: "scale",
      low_label: null,
      high_label: null,
      average: 4.7,
      count: 512
    },
    {
      key: "packaging",
      label: "Packaging",
      kind: "scale",
      low_label: null,
      high_label: null,
      average: 4.9,
      count: 498
    }
  ],
  ai_summary: null
};

const STORE_QUESTIONS = [
  {
    key: "delivery",
    label: "Delivery",
    kind: "scale",
    low_label: null,
    high_label: null
  }
];

// 12 reviews so the list (10 per page) has a second page; every star level.
const STORE_REVIEWS = Array.from({ length: 12 }, (_, i) => {
  const rating = [5, 4, 2, 5, 1, 3, 5, 4, 5, 4, 5, 5][i];
  return {
    id: 300 + i,
    rating,
    title: i === 2 ? "Slow to arrive" : i % 3 === 0 ? "Great service" : null,
    body:
      i === 2
        ? "Took nearly two weeks and no tracking updates."
        : i === 5
        ? null
        : `Store review number ${i + 1}. Easy checkout and quick replies.`,
    display_name: `Store Reviewer ${i + 1}`,
    variant_label: null,
    verified_purchase: true,
    incentivized: false,
    channel: "retail",
    attribute_ratings: { delivery: Math.max(1, rating - 1) },
    photos: [],
    helpful_count: 12 - i,
    unhelpful_count: 0,
    reply: null,
    published_at: `2026-11-${String(25 - i).padStart(2, "0")}T12:00:00Z`,
    edited: false
  };
});

const ownStoreReview = (overrides = {}) => ({
  ...STORE_REVIEWS[0],
  id: 12,
  display_name: "Maya R.",
  status: "pending",
  status_message: "Thanks! We're checking it before it goes live.",
  published_at: null,
  product: null,
  points: { awarded: 0, pending: 0 },
  ...overrides
});

/* M6 product questions (contract "M6 questions"): answered ones only. */
const PRODUCT_QUESTIONS = [
  {
    id: 31,
    body: "Is the fabric see-through in the white?",
    display_name: "Jo K.",
    asked_at: "2026-11-10T09:00:00Z",
    answers: [
      {
        id: 41,
        body: "It's fully opaque, even in the white.",
        display_name: "DNA",
        official: true,
        verified_buyer: false,
        answered_at: "2026-11-11T12:00:00Z"
      },
      {
        id: 42,
        body: "I have the white one and it's not see-through at all.",
        display_name: "Sam W.",
        official: false,
        verified_buyer: true,
        answered_at: "2026-11-12T08:00:00Z"
      }
    ]
  },
  {
    id: 32,
    body: "Does the tie come off?",
    display_name: "Ana P.",
    asked_at: "2026-11-08T09:00:00Z",
    answers: [
      {
        id: 43,
        body: "The tie is sewn in at the side seam.",
        display_name: "DNA",
        official: true,
        verified_buyer: false,
        answered_at: "2026-11-09T12:00:00Z"
      }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* A small PNG for the photo upload                                    */
/* ------------------------------------------------------------------ */

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buffer) => {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const pngChunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

/** A width×height RGB PNG with a diagonal gradient. */
const makePng = (width, height) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // RGB
  const rows = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const offset = y * (width * 3 + 1);
    rows[offset] = 0;
    for (let x = 0; x < width; x++) {
      const t = (x / width + y / height) / 2;
      rows[offset + 1 + x * 3] = Math.round(235 - 60 * t);
      rows[offset + 2 + x * 3] = Math.round(180 - 70 * t);
      rows[offset + 3 + x * 3] = Math.round(175 - 40 * t);
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", zlib.deflateSync(rows)),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
};

/* ------------------------------------------------------------------ */
/* Mock API                                                            */
/* ------------------------------------------------------------------ */

/**
 * Answers every request to API_URL. Returns a log of the calls (method, path,
 * headers, content type) and lets a test override routes with `state`.
 */
const installMocks = async (page, state = {}) => {
  const calls = [];
  const json = (route, status, body) =>
    route.fulfill({
      status,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: body === undefined ? "" : JSON.stringify(body)
    });

  // Anything outside the app and the mocked API (analytics, CMS, fonts) is cut off.
  await page.route(
    (url) =>
      !url.href.startsWith(BASE_URL) &&
      !url.href.startsWith(API_URL) &&
      !url.protocol.startsWith("blob") &&
      !url.protocol.startsWith("data"),
    (route) => route.abort()
  );

  await page.route(`${API_URL}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const p = url.pathname;
    const method = request.method();
    const headers = request.headers();
    const call = {
      method,
      path: p,
      search: url.search,
      headers,
      contentType: headers["content-type"] || "",
      // JSON bodies (store reviews, questions); multipart is read via recordReviewPosts.
      body: /json/.test(headers["content-type"] || "")
        ? JSON.parse(request.postData() || "null")
        : undefined
    };
    calls.push(call);
    if (method === "OPTIONS") {
      return route.fulfill({
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS"
        }
      });
    }
    const signedIn = !!headers.authorization;
    let m;

    if (
      (m = p.match(/^\/img\/p(\d+)\.svg$/)) ||
      (m = p.match(/^\/photos\/(\d+)\.svg$/))
    ) {
      const c = COLORS[Number(m[1]) % COLORS.length];
      return route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: svg(c[0], c[1], p.startsWith("/photos") ? "photo" : "")
      });
    }

    // Reviews (M1 read path)
    if ((m = p.match(/^\/api\/v1\/products\/([^/]+)\/review_summary$/))) {
      return json(route, 200, summary(decodeURIComponent(m[1])));
    }
    if ((m = p.match(/^\/api\/v1\/products\/([^/]+)\/reviews$/))) {
      const ratings = url.searchParams.getAll("rating[]").map(Number);
      let rows = REVIEWS.slice();
      if (ratings.length) rows = rows.filter((r) => ratings.includes(r.rating));
      if (url.searchParams.get("with_photos") === "1")
        rows = rows.filter((r) => r.photos.length);
      const perPage = Number(url.searchParams.get("per_page") || 10);
      const pageNo = Number(url.searchParams.get("page") || 1);
      return json(route, 200, {
        data: rows.slice((pageNo - 1) * perPage, pageNo * perPage),
        meta: {
          page: pageNo,
          per_page: perPage,
          total_count: rows.length,
          total_pages: Math.max(1, Math.ceil(rows.length / perPage)),
          scope: "retail"
        }
      });
    }

    // Email flow (M4): the token is the credential, no Bearer.
    const reviewToken = headers["x-review-token"];
    if ((m = p.match(/^\/api\/v1\/review_requests\/([^/]+)\/opt_out$/))) {
      if (decodeURIComponent(m[1]) !== REVIEW_TOKEN)
        return json(route, 404, { error: "not found" });
      return json(route, 200, { status: "opted_out" });
    }
    if ((m = p.match(/^\/api\/v1\/review_requests\/([^/]+)$/))) {
      if (decodeURIComponent(m[1]) !== REVIEW_TOKEN)
        return json(route, 404, { error: "not found" });
      return json(route, 200, state.reviewRequest || REVIEW_REQUEST);
    }
    if (
      reviewToken &&
      reviewToken !== REVIEW_TOKEN &&
      /^\/api\/v1\/reviews/.test(p)
    ) {
      return json(route, 404, {
        error: "This review link isn't valid any more",
        code: "invalid_token"
      });
    }

    // Store reviews (M5). Every endpoint answers 503 while switched off.
    if (p.startsWith("/api/v1/store_reviews")) {
      if (state.storeDisabled)
        return json(route, 503, { error: "Not enabled", code: "not_enabled" });
      if (reviewToken && reviewToken !== REVIEW_TOKEN)
        return json(route, 404, {
          error: "This review link isn't valid any more",
          code: "invalid_token"
        });
      if (p === "/api/v1/store_reviews/summary")
        return json(route, 200, STORE_SUMMARY);
      if (p === "/api/v1/store_reviews/form") {
        if (!signedIn) return json(route, 401, { error: "Sign in" });
        return json(route, 200, {
          eligible: true,
          reason: null,
          display_name: "Maya R.",
          questions: STORE_QUESTIONS,
          existing_review: state.storeExisting || null,
          limits: { title_max: 120, body_max: 5000 }
        });
      }
      if (p === "/api/v1/store_reviews" && method === "GET") {
        const ratings = url.searchParams.getAll("rating[]").map(Number);
        let rows = STORE_REVIEWS.slice();
        if (ratings.length)
          rows = rows.filter((r) => ratings.includes(r.rating));
        if (url.searchParams.get("written") === "1")
          rows = rows.filter((r) => r.body || r.title);
        const perPage = Number(url.searchParams.get("per_page") || 10);
        const pageNo = Number(url.searchParams.get("page") || 1);
        return json(route, 200, {
          data: rows.slice((pageNo - 1) * perPage, pageNo * perPage),
          meta: {
            page: pageNo,
            per_page: perPage,
            total_count: rows.length,
            total_pages: Math.max(1, Math.ceil(rows.length / perPage))
          }
        });
      }
      if (p === "/api/v1/store_reviews" && method === "POST") {
        if (!signedIn && !reviewToken)
          return json(route, 401, { error: "Sign in" });
        if (state.storeConflict)
          return json(route, 409, {
            error: "Already reviewed",
            code: "already_reviewed",
            review_id: 12
          });
        return json(route, 201, {
          review: ownStoreReview({ rating: call.body && call.body.rating })
        });
      }
      if ((m = p.match(/^\/api\/v1\/store_reviews\/(\d+)$/))) {
        if (!signedIn && !reviewToken)
          return json(route, 401, { error: "Sign in" });
        return json(route, 200, {
          review: ownStoreReview({
            id: Number(m[1]),
            rating: call.body && call.body.rating
          })
        });
      }
    }

    // Product questions (M6)
    if ((m = p.match(/^\/api\/v1\/products\/([^/]+)\/questions$/))) {
      if (state.questionsDisabled)
        return json(route, 503, { error: "Not enabled", code: "not_enabled" });
      if (method === "POST") {
        if (!signedIn) return json(route, 401, { error: "Sign in" });
        if (state.askLimited)
          return json(route, 429, { error: "Too many questions" });
        const text = ((call.body && call.body.body) || "").trim();
        if (text.length < 10 || text.length > 500)
          return json(route, 422, {
            error: "Invalid",
            fields: { body: ["is too short (minimum is 10 characters)"] }
          });
        return json(route, 201, {
          id: 51,
          status: "pending",
          message: "Thanks! We'll email you when it's answered."
        });
      }
      const perPage = Number(url.searchParams.get("per_page") || 5);
      const pageNo = Number(url.searchParams.get("page") || 1);
      const rows = state.questions || PRODUCT_QUESTIONS;
      return json(route, 200, {
        data: rows.slice((pageNo - 1) * perPage, pageNo * perPage),
        meta: {
          page: pageNo,
          per_page: perPage,
          total_count: rows.length,
          total_pages: Math.max(1, Math.ceil(rows.length / perPage))
        }
      });
    }

    // Write path (M2)
    if ((m = p.match(/^\/api\/v1\/products\/([^/]+)\/review_form$/))) {
      if (!signedIn) return json(route, 401, { error: "Sign in" });
      const slug = decodeURIComponent(m[1]);
      const reviewable = REVIEWABLES.find(
        (r) => r.slug === slug || String(r.product_id) === slug
      );
      if (state.reviewForm) return json(route, 200, state.reviewForm(slug));
      const existing =
        reviewable && reviewable.existing_review ? MY_REVIEWS[0] : null;
      return json(route, 200, {
        eligible: !!reviewable,
        reason: reviewable ? null : "not_purchased",
        line_item_id: reviewable ? reviewable.line_item_id : null,
        variant_label: reviewable ? reviewable.variant_label : null,
        existing_review: existing,
        questions: reviewable ? reviewable.questions : [],
        display_name: "Maya R.",
        points: { per_review: 50, photo_bonus: 50 },
        limits: LIMITS
      });
    }
    if (p === "/api/v1/account/reviewables") {
      if (!signedIn) return json(route, 401, { error: "Sign in" });
      return json(route, 200, {
        data: REVIEWABLES,
        points: { per_review: 50, photo_bonus: 50 }
      });
    }
    if (p === "/api/v1/account/reviews") {
      if (!signedIn) return json(route, 401, { error: "Sign in" });
      return json(route, 200, {
        data: MY_REVIEWS,
        meta: {
          page: 1,
          per_page: 10,
          total_count: MY_REVIEWS.length,
          total_pages: 1
        }
      });
    }
    if (p === "/api/v1/reviews" && method === "POST") {
      if (!signedIn && !reviewToken)
        return json(route, 401, { error: "Sign in" });
      if (state.onCreate) return state.onCreate(route, call);
      return json(route, 201, {
        review: ownReview({
          id: 990,
          rating: 4,
          title: null,
          body: null,
          status: "pending",
          status_message: "Thanks! We're checking it before it goes live.",
          published_at: null,
          product: {
            id: 11,
            slug: SLUG,
            name: "Rib-Knit Wrap Top",
            image_url: imageUrl(0)
          },
          points: { awarded: 0, pending: 50 }
        })
      });
    }
    if ((m = p.match(/^\/api\/v1\/reviews\/(\d+)$/))) {
      if (!signedIn && !(reviewToken && method === "PATCH"))
        return json(route, 401, { error: "Sign in" });
      if (method === "DELETE")
        return route.fulfill({
          status: 204,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      return json(route, 200, {
        review: ownReview({
          id: Number(m[1]),
          status: "pending",
          status_message: "Thanks! We're checking it before it goes live."
        })
      });
    }
    if ((m = p.match(/^\/api\/v1\/reviews\/(\d+)\/votes$/))) {
      const review = REVIEWS.find((r) => r.id === Number(m[1]));
      const helpful = JSON.parse(request.postData() || "{}").helpful;
      if (state.voteDelayMs)
        await new Promise((r) => setTimeout(r, state.voteDelayMs));
      return json(route, 200, {
        helpful_count: review.helpful_count + (helpful ? 1 : 0),
        unhelpful_count: review.unhelpful_count + (helpful ? 0 : 1),
        your_vote: helpful
      });
    }
    if (p === "/api/v1/reports") {
      if (!signedIn) return json(route, 401, { error: "Sign in" });
      return json(route, 201, { id: 1 });
    }

    // Spree storefront v2
    if ((m = p.match(/^\/api\/v2\/storefront\/products\/([^/]+)$/))) {
      const slug = decodeURIComponent(m[1]);
      const i = PRODUCTS.findIndex(
        (x) => x.slug === slug || String(x.id) === slug
      );
      if (i < 0) return json(route, 404, { error: "Not found" });
      return json(route, 200, {
        data: productResource(PRODUCTS[i], i),
        included: [imageResource(PRODUCTS[i], i), variantResource(PRODUCTS[i])]
      });
    }
    if (p === "/api/v2/storefront/products") {
      return json(route, 200, {
        data: PRODUCTS.map(productResource),
        included: [
          ...PRODUCTS.map(imageResource),
          ...PRODUCTS.map(variantResource)
        ],
        meta: {
          count: PRODUCTS.length,
          total_count: PRODUCTS.length,
          total_pages: 1
        },
        links: {}
      });
    }
    if (p === "/api/v2/storefront/account") {
      return signedIn
        ? json(route, 200, USER)
        : json(route, 403, { error: "unauthorized" });
    }
    if ((m = p.match(/^\/api\/v2\/storefront\/account\/orders\/([^/]+)$/))) {
      return json(route, 200, ORDER);
    }
    return json(route, 200, { data: [], included: [], meta: {} });
  });
  return calls;
};

/**
 * Records what the app hands to `fetch` for review writes, so tests can read
 * the multipart fields (file bodies aren't always visible to the network layer).
 */
const recordReviewPosts = (context) =>
  context.addInitScript(() => {
    window.__reviewPosts = [];
    const original = window.fetch;
    window.fetch = function (input, init) {
      try {
        const url = typeof input === "string" ? input : input.url;
        if (
          /\/api\/v1\/reviews(\/\d+)?$/.test(url) &&
          init &&
          init.body instanceof FormData
        ) {
          const entries = [];
          init.body.forEach((value, key) => {
            entries.push(
              typeof value === "string"
                ? [key, value]
                : [
                    key,
                    {
                      file: true,
                      name: value.name,
                      type: value.type,
                      size: value.size
                    }
                  ]
            );
            if (typeof value !== "string")
              (window.__reviewFiles = window.__reviewFiles || []).push(value);
          });
          window.__reviewPosts.push({ url, method: init.method, entries });
        }
      } catch (e) {
        // recording must never break the app
      }
      return original.apply(this, arguments);
    };
  });

const signIn = async (context) => {
  await context.addCookies([
    {
      name: "storefront_token",
      value: encodeURIComponent(JSON.stringify(TOKEN)),
      url: BASE_URL
    }
  ]);
  await context.addInitScript((token) => {
    window.localStorage.setItem("token", JSON.stringify(token));
  }, TOKEN);
};

/* ------------------------------------------------------------------ */
/* Dev server                                                          */
/* ------------------------------------------------------------------ */

const ping = (url) =>
  new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on("error", () => resolve(0));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(0);
    });
  });

const startServer = async () => {
  if (process.env.E2E_BASE_URL) return null;
  const nextBin = path.join(ROOT, "node_modules", ".bin", "next");
  const child = spawn(nextBin, ["dev", "-p", String(PORT)], {
    cwd: ROOT,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      NEXT_PUBLIC_REVIEWS_ENABLED: "true",
      NEXT_PUBLIC_IS_MAINT_MODE: "false",
      NEXT_PUBLIC_SPREE_API_URL: API_URL,
      NEXT_PUBLIC_SPREE_ACCESS_TOKEN: "e2e",
      NEXT_TELEMETRY_DISABLED: "1"
    }
  });
  let output = "";
  child.stdout.on("data", (d) => (output += d));
  child.stderr.on("data", (d) => (output += d));
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(`next dev exited:\n${output.slice(-2000)}`);
    if ((await ping(`${BASE_URL}/api/__e2e_ping__`)) > 0) return child;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(
    `next dev did not start on ${BASE_URL}:\n${output.slice(-2000)}`
  );
};

const stopServer = (child) => {
  if (!child) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch (e) {
    // already gone
  }
};

/* ------------------------------------------------------------------ */
/* Checks                                                              */
/* ------------------------------------------------------------------ */

const PHONE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
};
const DESKTOP = {
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1
};

const PAGE_TIMEOUT = 180000;

/** Opens a page with mocks; the app scrolls inside <main>, so scroll that to load the lazy list. */
const open = async (
  browser,
  urlPath,
  { device = DESKTOP, signedIn = false, state = {} } = {}
) => {
  const context = await browser.newContext(device);
  if (signedIn) await signIn(context);
  await recordReviewPosts(context);
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const calls = await installMocks(page, state);
  await page.goto(BASE_URL + urlPath, {
    waitUntil: "domcontentloaded",
    timeout: PAGE_TIMEOUT
  });
  return { context, page, calls, errors };
};

const scrollToReviews = async (page) => {
  await page.locator("#reviews").waitFor({ timeout: PAGE_TIMEOUT });
  await page
    .locator("#reviews")
    .evaluate((el) => el.scrollIntoView({ block: "start" }));
  await page.locator("#reviews article").first().waitFor();
};

const openComposer = async (page) => {
  const button = page.getByRole("button", { name: /write a review/i }).first();
  await button.waitFor({ timeout: 60000 });
  await button.click();
  const dialog = page.getByRole("dialog", { name: /write a review/i });
  await dialog.waitFor();
  await dialog
    .getByRole("heading", { name: "How would you rate it?" })
    .waitFor();
  return dialog;
};

const CHECKS = [
  {
    name: "PDP shows the rating summary and the review list",
    run: async (browser) => {
      const { context, page, errors } = await open(browser, `/${SLUG}`);
      await page
        .getByRole("link", { name: /Rated 4\.6 out of 5, 128 reviews/ })
        .waitFor({ timeout: PAGE_TIMEOUT });
      await scrollToReviews(page);
      assert.match(
        await page.locator("#reviews h2").first().innerText(),
        /REVIEWS \(128\)|Reviews \(128\)/i
      );
      assert.ok(
        (await page.locator("#reviews article").count()) >= 3,
        "renders review cards"
      );
      // Signed out: no write button, but votes and report are there.
      assert.strictEqual(
        await page.getByRole("button", { name: /write a review/i }).count(),
        0
      );
      await page.getByRole("button", { name: /^Yes · 24$/ }).waitFor();
      assert.deepStrictEqual(errors, []);
      await context.close();
    }
  },
  {
    name: "histogram bar filters the list",
    run: async (browser) => {
      const { context, page, calls } = await open(browser, `/${SLUG}`);
      await scrollToReviews(page);
      const bar = page.getByRole("button", {
        name: /Show only 2-star reviews/
      });
      await bar.click();
      await page.waitForFunction(
        () => document.querySelectorAll("#reviews article").length === 1
      );
      assert.strictEqual(await bar.getAttribute("aria-pressed"), "true");
      assert.ok(
        calls.some(
          (c) =>
            c.path.endsWith("/reviews") && c.search.includes("rating%5B%5D=2")
        ),
        "requests rating[]=2"
      );
      assert.match(
        await page.locator("#reviews article").innerText(),
        /Lovely fabric, sizing was off/
      );
      await context.close();
    }
  },
  {
    name: "composer: star-only submit sends multipart with the rating",
    run: async (browser) => {
      const { context, page, calls, errors } = await open(browser, `/${SLUG}`, {
        signedIn: true,
        device: PHONE
      });
      const dialog = await openComposer(page);
      await dialog.getByRole("radio", { name: /4 stars, Liked it/ }).click();
      await dialog.getByRole("button", { name: "Submit rating" }).click();
      await dialog.getByRole("heading", { name: /Thanks, Maya/ }).waitFor();
      await dialog
        .getByText("Thanks! We're checking it before it goes live.", {
          exact: true
        })
        .waitFor();
      await dialog.getByText("+50 points once it's live").waitFor();
      const post = calls.find(
        (c) => c.method === "POST" && c.path === "/api/v1/reviews"
      );
      assert.ok(post, "POST /reviews sent");
      assert.match(post.contentType, /^multipart\/form-data; boundary=/);
      assert.ok(post.headers.authorization, "sends the Bearer token");
      const [recorded] = await page.evaluate(() => window.__reviewPosts);
      const fields = Object.fromEntries(recorded.entries);
      assert.strictEqual(fields.rating, "4");
      assert.strictEqual(fields.product_id, SLUG);
      assert.strictEqual(fields.line_item_id, "53");
      assert.ok(
        !("title" in fields) && !("body" in fields),
        "no empty text fields"
      );
      // "Review next item" moves on to the next reviewable without a review.
      await dialog.getByRole("button", { name: "Review next item" }).click();
      await dialog.getByText("Satin Slip Skirt").waitFor();
      await dialog
        .getByRole("heading", { name: "How would you rate it?" })
        .waitFor();
      assert.deepStrictEqual(errors, []);
      await context.close();
    }
  },
  {
    name: "composer: photo shows a preview and is uploaded as a resized JPEG",
    run: async (browser) => {
      const { context, page, calls } = await open(browser, `/${SLUG}`, {
        signedIn: true
      });
      const dialog = await openComposer(page);
      await dialog.getByRole("radio", { name: /5 stars, Loved it/ }).click();
      await dialog.getByRole("button", { name: "Add details" }).click();
      await dialog.getByRole("heading", { name: "Tell us more" }).waitFor();
      await dialog.getByRole("radio", { name: "3 of 5, True to size" }).click();
      await dialog.getByLabel("Title").fill("Soft and true to size");
      await dialog
        .getByLabel("Your review")
        .fill("Wore it all week. The rib holds its shape.");
      // The draft autosaves to localStorage.
      await page.waitForFunction(
        (slug) => !!localStorage.getItem(`dna_review_draft_${slug}`),
        SLUG
      );
      await dialog.getByRole("button", { name: "Add photos" }).click();
      await dialog.getByRole("heading", { name: "Add photos" }).waitFor();
      await dialog.locator('input[type="file"]').setInputFiles({
        name: "wrap-top.png",
        mimeType: "image/png",
        buffer: makePng(2400, 1600)
      });
      const preview = dialog.locator('img[alt^="New photo"]');
      await preview.waitFor();
      assert.match(await preview.getAttribute("src"), /^blob:/);
      await dialog.getByRole("button", { name: "Submit review" }).click();
      await dialog.getByRole("heading", { name: /Thanks/ }).waitFor();
      const post = calls.find(
        (c) => c.method === "POST" && c.path === "/api/v1/reviews"
      );
      assert.match(post.contentType, /^multipart\/form-data/);
      const [recorded] = await page.evaluate(() => window.__reviewPosts);
      const fields = Object.fromEntries(
        recorded.entries.filter(([k]) => k !== "photos[]")
      );
      assert.strictEqual(fields.rating, "5");
      assert.strictEqual(fields.title, "Soft and true to size");
      assert.strictEqual(fields["attribute_ratings[fit]"], "3");
      const photos = recorded.entries
        .filter(([k]) => k === "photos[]")
        .map(([, v]) => v);
      assert.strictEqual(photos.length, 1);
      assert.strictEqual(photos[0].type, "image/jpeg");
      assert.match(photos[0].name, /wrap-top\.jpg$/);
      const size = await page.evaluate(async () => {
        const bitmap = await createImageBitmap(window.__reviewFiles[0]);
        return [bitmap.width, bitmap.height];
      });
      assert.deepStrictEqual(
        size,
        [1600, 1067],
        "resized to 1600px on the long edge"
      );
      assert.strictEqual(
        await page.evaluate(
          (slug) => localStorage.getItem(`dna_review_draft_${slug}`),
          SLUG
        ),
        null,
        "draft cleared"
      );
      await context.close();
    }
  },
  {
    name: "helpful vote updates the count optimistically",
    run: async (browser) => {
      const { context, page, calls } = await open(browser, `/${SLUG}`, {
        state: { voteDelayMs: 1500 }
      });
      await scrollToReviews(page);
      const yes = page.getByRole("button", { name: /^Yes · 24$/ });
      assert.strictEqual(await yes.getAttribute("aria-pressed"), "false");
      await yes.click();
      // Before the (delayed) response arrives:
      const updated = page.getByRole("button", { name: /^Yes · 25$/ });
      await updated.waitFor({ timeout: 1000 });
      assert.strictEqual(await updated.getAttribute("aria-pressed"), "true");
      await page.waitForTimeout(1800);
      assert.strictEqual(await updated.getAttribute("aria-pressed"), "true");
      const vote = calls.find(
        (c) => c.method === "POST" && /\/reviews\/77\/votes$/.test(c.path)
      );
      assert.ok(vote, "POST /reviews/77/votes sent");
      assert.ok(vote.headers["x-visitor-id"], "sends X-Visitor-Id");
      const visitorId = await page.evaluate(() =>
        localStorage.getItem("dna_visitor_id")
      );
      assert.strictEqual(vote.headers["x-visitor-id"], visitorId);
      // Switching to "No" moves the vote.
      await page.getByRole("button", { name: /^No$/ }).first().click();
      await page
        .getByRole("button", { name: /^Yes · 24$/ })
        .waitFor({ timeout: 1000 });
      await context.close();
    }
  },
  {
    name: "order page shows Write a review for an eligible item",
    run: async (browser) => {
      const { context, page, errors } = await open(
        browser,
        "/account/orders/R123456",
        { signedIn: true }
      );
      await page
        .getByRole("heading", { name: "Order Details" })
        .waitFor({ timeout: PAGE_TIMEOUT });
      await page
        .getByRole("button", { name: "Write a review of Rib-Knit Wrap Top" })
        .waitFor();
      await page
        .getByRole("button", {
          name: "Edit your review of Linen Wide-Leg Trouser"
        })
        .waitFor();
      await page
        .getByRole("img", { name: "You rated it 4 out of 5" })
        .waitFor();
      await page
        .getByRole("button", { name: "Write a review of Rib-Knit Wrap Top" })
        .click();
      const dialog = page.getByRole("dialog", { name: /write a review/i });
      await dialog
        .getByRole("heading", { name: "How would you rate it?" })
        .waitFor();
      assert.deepStrictEqual(errors, []);
      await context.close();
    }
  },
  {
    name: "account reviews page lists items to review and own reviews",
    run: async (browser) => {
      const { context, page } = await open(browser, "/account/reviews", {
        signedIn: true
      });
      await page
        .getByRole("tab", { name: /To review \(2\)/ })
        .waitFor({ timeout: PAGE_TIMEOUT });
      await page
        .getByRole("button", { name: "Write a review of Satin Slip Skirt" })
        .waitFor();
      await page.getByRole("tab", { name: /My reviews/ }).click();
      await page.getByText("Checking", { exact: true }).waitFor();
      await page
        .getByRole("button", { name: "Delete your review of Merino Crew" })
        .click();
      await page.getByText(/Delete this review\?/).waitFor();
      await page.getByRole("button", { name: "Keep it" }).click();
      await page
        .getByRole("button", { name: "Delete your review of Merino Crew" })
        .waitFor();
      await context.close();
    }
  },
  {
    name: "email link: the tapped star is preselected and submits with X-Review-Token",
    run: async (browser) => {
      const { context, page, calls, errors } = await open(
        browser,
        `/review/${REVIEW_TOKEN}?item=55&rating=4`,
        { device: PHONE }
      );
      await page
        .getByRole("heading", { name: "How would you rate it?" })
        .waitFor({ timeout: PAGE_TIMEOUT });
      // _document also has a site-wide "noodp"; crawlers apply both.
      assert.ok(
        (
          await page
            .locator('meta[name="robots"]')
            .evaluateAll((els) => els.map((el) => el.content))
        ).includes("noindex"),
        "robots noindex"
      );
      assert.strictEqual(await page.title(), "Review your order");
      await page.getByText(/^Item 3 of 3/).waitFor();
      await page.getByText("Satin Slip Skirt").first().waitFor();
      assert.strictEqual(
        await page
          .getByRole("radio", { name: /4 stars/ })
          .getAttribute("aria-checked"),
        "true"
      );
      // The star intent is dropped from the URL so a refresh can't replay it.
      await page.waitForFunction(() => location.search === "");
      assert.strictEqual(
        new URL(page.url()).pathname,
        `/review/${REVIEW_TOKEN}`
      );
      await page.getByRole("button", { name: "Submit rating" }).click();
      await page.getByRole("heading", { name: /Thanks, Maya/ }).waitFor();
      // The next unreviewed item wraps around to the first one.
      await page.getByText("Next up · Item 1 of 3").waitFor();
      const get = calls.find((c) =>
        c.path.startsWith("/api/v1/review_requests/")
      );
      assert.ok(!get.headers.authorization, "GET sends no Bearer");
      const posts = calls.filter(
        (c) => c.method === "POST" && c.path === "/api/v1/reviews"
      );
      assert.strictEqual(posts.length, 1, "one POST /reviews");
      assert.strictEqual(posts[0].headers["x-review-token"], REVIEW_TOKEN);
      assert.ok(!posts[0].headers.authorization, "no Bearer with the token");
      assert.match(posts[0].contentType, /^multipart\/form-data; boundary=/);
      const [recorded] = await page.evaluate(() => window.__reviewPosts);
      const fields = Object.fromEntries(recorded.entries);
      assert.strictEqual(fields.rating, "4");
      assert.strictEqual(fields.line_item_id, "55");
      assert.strictEqual(fields.product_id, "satin-slip-skirt");
      // "Review next item" opens the first item with focus on its heading.
      await page.getByRole("button", { name: "Review next item" }).click();
      await page.getByText(/^Item 1 of 3/).waitFor();
      await page
        .getByRole("heading", { name: "How would you rate it?" })
        .waitFor();
      await page.waitForFunction(
        () => document.activeElement?.textContent === "How would you rate it?"
      );
      assert.strictEqual(
        await page.getByRole("radio", { checked: true }).count(),
        0,
        "no rating carried over"
      );
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      assert.ok(overflow <= 0, `no horizontal overflow (${overflow}px)`);
      assert.deepStrictEqual(errors, []);
      await context.close();
    }
  },
  {
    name: "email link: Skip moves to the next unreviewed item, then All done",
    run: async (browser) => {
      const { context, page, calls } = await open(
        browser,
        `/review/${REVIEW_TOKEN}`,
        { device: PHONE }
      );
      await page.getByText(/^Item 1 of 3/).waitFor({ timeout: PAGE_TIMEOUT });
      await page.getByText("Rib-Knit Wrap Top").first().waitFor();
      await page.getByRole("button", { name: "Skip this item" }).click();
      // Item 2 already has a review, so Skip lands on item 3.
      await page.getByText(/^Item 3 of 3/).waitFor();
      await page.waitForFunction(
        () => document.activeElement?.textContent === "How would you rate it?"
      );
      await page.getByRole("button", { name: "Skip this item" }).click();
      // M5: the store question comes after the items; it's skippable too.
      await page
        .getByRole("heading", { name: "How was shopping with us?" })
        .waitFor();
      await page.getByRole("button", { name: "Skip", exact: true }).click();
      const done = page.getByRole("heading", { name: "All done" });
      await done.waitFor();
      await page.waitForFunction(
        () => document.activeElement?.textContent === "All done"
      );
      // Guest order: an account invitation, never a rating-dependent promise.
      const signup = page.getByRole("link", {
        name: "Create an account with this email to collect points next time"
      });
      assert.strictEqual(await signup.getAttribute("href"), "/signup");
      await page
        .getByRole("button", { name: "Review Rib-Knit Wrap Top" })
        .waitFor();
      await page
        .getByRole("button", {
          name: "Edit your review of Linen Wide-Leg Trouser"
        })
        .waitFor();
      assert.strictEqual(
        await page
          .getByRole("link", { name: "Satin Slip Skirt" })
          .getAttribute("href"),
        "/satin-slip-skirt"
      );
      assert.strictEqual(
        calls.filter(
          (c) =>
            c.path === "/api/v1/reviews" || c.path === "/api/v1/store_reviews"
        ).length,
        0,
        "skipping sends nothing"
      );
      await context.close();
    }
  },
  {
    name: "email link: an item with a review shows Edit and saves with PATCH",
    run: async (browser) => {
      const { context, page, calls } = await open(
        browser,
        `/review/${REVIEW_TOKEN}?item=54&rating=1`
      );
      // Item 54 already has a review: the star is ignored, item 1 opens.
      await page.getByText(/^Item 1 of 3/).waitFor({ timeout: PAGE_TIMEOUT });
      await page.waitForFunction(() => location.search === "");
      const list = page.getByRole("region", { name: "In this order" });
      await list.getByText("Reviewed").waitFor();
      await list
        .getByRole("button", {
          name: "Edit your review of Linen Wide-Leg Trouser"
        })
        .click();
      await page.getByText(/^Item 2 of 3/).waitFor();
      await page.getByRole("heading", { name: "Edit your review" }).waitFor();
      assert.strictEqual(
        await page
          .getByRole("radio", { name: /4 stars/ })
          .getAttribute("aria-checked"),
        "true"
      );
      await page.getByRole("radio", { name: /3 stars/ }).click();
      await page.getByRole("button", { name: "Save rating" }).click();
      await page.getByRole("heading", { name: /Thanks/ }).waitFor();
      const patch = calls.find(
        (c) => c.method === "PATCH" && c.path === "/api/v1/reviews/901"
      );
      assert.ok(patch, "PATCH /reviews/901 sent");
      assert.strictEqual(patch.headers["x-review-token"], REVIEW_TOKEN);
      const recorded = await page.evaluate(() => window.__reviewPosts);
      assert.strictEqual(Object.fromEntries(recorded[0].entries).rating, "3");
      await context.close();
    }
  },
  {
    name: "email link: a dead link shows the expired page",
    run: async (browser) => {
      const { context, page, calls } = await open(
        browser,
        "/review/no-longer-valid?item=53&rating=5",
        { device: PHONE }
      );
      await page
        .getByRole("heading", { name: "This review link has expired" })
        .waitFor({ timeout: PAGE_TIMEOUT });
      assert.strictEqual(
        await page
          .getByRole("link", { name: "Sign in to review" })
          .getAttribute("href"),
        "/account/reviews"
      );
      await page.getByRole("link", { name: "Keep shopping" }).waitFor();
      assert.strictEqual(
        calls.filter((c) => c.path.startsWith("/api/v1/review_requests/"))
          .length,
        1,
        "a 404 isn't retried"
      );
      await context.close();

      // A link that dies mid-flow (invalid_token on submit) ends up there too.
      const second = await open(browser, `/review/${REVIEW_TOKEN}?rating=5`, {
        state: {
          onCreate: (route) =>
            route.fulfill({
              status: 404,
              contentType: "application/json",
              headers: { "Access-Control-Allow-Origin": "*" },
              body: JSON.stringify({
                error: "This review link isn't valid any more",
                code: "invalid_token"
              })
            })
        }
      });
      await second.page
        .getByRole("radio", { name: /5 stars/ })
        .click({ timeout: PAGE_TIMEOUT });
      await second.page.getByRole("button", { name: "Submit rating" }).click();
      await second.page
        .getByRole("heading", { name: "This review link has expired" })
        .waitFor();
      await second.context.close();
    }
  },
  {
    name: "email opt-out asks first and POSTs once on Confirm",
    run: async (browser) => {
      const { context, page, calls, errors } = await open(
        browser,
        `/review/${REVIEW_TOKEN}?opt_out=1`,
        { device: PHONE }
      );
      await page
        .getByRole("heading", { name: "Stop review emails to this address?" })
        .waitFor({ timeout: PAGE_TIMEOUT });
      await page.waitForTimeout(1000);
      assert.strictEqual(
        calls.filter((c) => c.path.startsWith("/api/v1/review_requests/"))
          .length,
        0,
        "opening the link calls nothing (mail scanners open links)"
      );
      assert.strictEqual(
        await page
          .getByRole("heading", { name: "How would you rate it?" })
          .count(),
        0,
        "no composer"
      );
      const confirm = page.getByRole("button", { name: "Confirm" });
      await confirm.dblclick();
      await page
        .getByText("You won't get review emails from us anymore.")
        .waitFor();
      const posts = calls.filter(
        (c) =>
          c.method === "POST" &&
          c.path === `/api/v1/review_requests/${REVIEW_TOKEN}/opt_out`
      );
      assert.strictEqual(posts.length, 1, "exactly one opt-out POST");
      assert.ok(!posts[0].headers.authorization, "no Bearer");
      assert.deepStrictEqual(errors, []);
      await context.close();

      // "Keep them" goes on to the review page without opting out.
      const kept = await open(browser, `/review/${REVIEW_TOKEN}?opt_out=1`);
      await kept.page
        .getByRole("button", { name: "Keep them" })
        .click({ timeout: PAGE_TIMEOUT });
      await kept.page
        .getByRole("heading", { name: "How would you rate it?" })
        .waitFor();
      assert.strictEqual(
        kept.calls.filter((c) => c.path.endsWith("/opt_out")).length,
        0
      );
      await kept.context.close();
    }
  },

  /* M5 store reviews ------------------------------------------------- */
  {
    name: "store reviews page renders the summary, histogram filter and list",
    run: async (browser) => {
      const { context, page, calls, errors } = await open(browser, "/reviews", {
        device: PHONE
      });
      await page
        .getByRole("heading", { level: 1, name: /^Reviews of / })
        .waitFor({ timeout: PAGE_TIMEOUT });
      assert.match(await page.title(), /^Customer reviews/);
      const root = page.locator("[data-store-reviews]");
      await root.getByText("4.8", { exact: true }).waitFor();
      await root.getByText("1,203 ratings · 640 written reviews").waitFor();
      // Store attribute bars.
      await root.getByText("Delivery", { exact: true }).first().waitFor();
      await root.getByText("Packaging", { exact: true }).first().waitFor();
      await root.locator("article").first().waitFor();
      assert.strictEqual(await root.locator("article").count(), 10);
      // No variant, photo or points lines on store review cards.
      assert.strictEqual(await root.getByText(/^Purchased:/).count(), 0);
      assert.strictEqual(await root.getByText(/DNA points/).count(), 0);
      // Low ratings are listed too, and star-only reviews say so.
      await root.getByText("Slow to arrive").waitFor();
      await root.getByText("Rated without a written review.").waitFor();
      // Histogram bars are aria-pressed filter buttons.
      const bar = page.getByRole("button", {
        name: /Show only 2-star reviews/
      });
      await bar.click();
      await page.waitForFunction(
        () =>
          document.querySelectorAll("[data-store-reviews] article").length === 1
      );
      assert.strictEqual(await bar.getAttribute("aria-pressed"), "true");
      assert.ok(
        calls.some(
          (c) =>
            c.path === "/api/v1/store_reviews" &&
            c.search.includes("rating%5B%5D=2")
        ),
        "requests rating[]=2"
      );
      await bar.click();
      await page
        .getByRole("button", { name: "Show more reviews" })
        .click({ timeout: 10000 });
      await page.waitForFunction(
        () =>
          document.querySelectorAll("[data-store-reviews] article").length ===
          12
      );
      // Public reads go out without a Bearer and with the default sort.
      const list = calls.find((c) => c.path === "/api/v1/store_reviews");
      assert.ok(list.search.includes("sort=helpful"), "default sort helpful");
      // Self-serving store reviews get no aggregateRating markup.
      const ld = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      assert.ok(
        ld.every((text) => !text.includes("aggregateRating")),
        "no aggregateRating JSON-LD"
      );
      // Signed out: no "Review us".
      assert.strictEqual(
        await page.getByRole("button", { name: "Review us" }).count(),
        0
      );
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      assert.ok(overflow <= 0, `no horizontal overflow (${overflow}px)`);
      assert.deepStrictEqual(errors, []);
      await context.close();

      // 503 not_enabled: a 404-style page and no list.
      const off = await open(browser, "/reviews", {
        state: { storeDisabled: true }
      });
      await off.page
        .getByRole("heading", { name: "Page not found" })
        .waitFor({ timeout: PAGE_TIMEOUT });
      assert.strictEqual(
        off.calls.filter((c) => c.path === "/api/v1/store_reviews").length,
        0,
        "no list request while disabled"
      );
      await off.context.close();
    }
  },
  {
    name: "store reviews: Review us opens the composer and POSTs JSON with a Bearer",
    run: async (browser) => {
      const { context, page, calls, errors } = await open(browser, "/reviews", {
        signedIn: true
      });
      const button = page.getByRole("button", { name: "Review us" });
      await button.waitFor({ timeout: PAGE_TIMEOUT });
      await button.click();
      const dialog = page.getByRole("dialog", { name: /^Review / });
      await dialog
        .getByRole("heading", { name: "How was shopping with us?" })
        .waitFor();
      assert.strictEqual(
        await dialog.getByText(/points/i).count(),
        0,
        "no points copy"
      );
      assert.strictEqual(
        await dialog.locator('input[type="file"]').count(),
        0,
        "no photo step"
      );
      await dialog.getByRole("radio", { name: /5 stars/ }).click();
      await dialog.getByRole("button", { name: "Add details" }).click();
      await dialog.getByRole("heading", { name: "Tell us more" }).waitFor();
      await dialog.getByLabel("Your review").fill("Fast shipping, nice box.");
      await dialog.getByRole("button", { name: "Submit review" }).click();
      await dialog.getByRole("heading", { name: /Thanks, Maya/ }).waitFor();
      await dialog
        .getByText("Thanks! We're checking it before it goes live.", {
          exact: true
        })
        .waitFor();
      const post = calls.find(
        (c) => c.method === "POST" && c.path === "/api/v1/store_reviews"
      );
      assert.ok(post, "POST /store_reviews sent");
      assert.match(post.contentType, /^application\/json/);
      assert.ok(post.headers.authorization, "sends the Bearer token");
      assert.strictEqual(post.body.rating, 5);
      assert.strictEqual(post.body.body, "Fast shipping, nice box.");
      assert.ok(!("photos" in post.body), "no photos");
      assert.deepStrictEqual(errors, []);
      await context.close();
    }
  },
  {
    name: "footer shows the store rating badge linking to /reviews",
    run: async (browser) => {
      const { context, page } = await open(browser, "/privacy");
      await page.locator("footer").waitFor({ timeout: PAGE_TIMEOUT });
      await page
        .locator("footer")
        .evaluate((el) => el.scrollIntoView({ block: "end" }));
      const badge = page.getByRole("link", {
        name: /Rated 4\.8 out of 5 from 1,203 reviews/
      });
      await badge.waitFor();
      assert.strictEqual(await badge.getAttribute("href"), "/reviews");
      // innerText follows the CSS uppercase.
      assert.match(await badge.innerText(), /4\.8\s*·\s*1,203 reviews/i);
      await context.close();

      // Hidden while store reviews are switched off (503).
      const off = await open(browser, "/privacy", {
        state: { storeDisabled: true }
      });
      await off.page.locator("footer").waitFor({ timeout: PAGE_TIMEOUT });
      await off.page
        .locator("footer")
        .evaluate((el) => el.scrollIntoView({ block: "end" }));
      await off.page.waitForResponse((r) =>
        r.url().includes("/api/v1/store_reviews/summary")
      );
      await off.page.waitForTimeout(500);
      assert.strictEqual(
        await off.page.locator("[data-store-rating-badge]").count(),
        0
      );
      await off.context.close();
    }
  },
  {
    name: "email link: store step after the items posts with X-Review-Token (409 → PATCH)",
    run: async (browser) => {
      const { context, page, calls, errors } = await open(
        browser,
        `/review/${REVIEW_TOKEN}`,
        {
          device: PHONE,
          state: {
            storeConflict: true,
            reviewRequest: {
              ...REVIEW_REQUEST,
              items: [REVIEW_REQUEST.items[2]]
            }
          }
        }
      );
      await page
        .getByRole("heading", { name: "How would you rate it?" })
        .waitFor({ timeout: PAGE_TIMEOUT });
      await page.getByRole("radio", { name: /4 stars/ }).click();
      await page.getByRole("button", { name: "Submit rating" }).click();
      // The last item leads straight to the store question.
      const storeHeading = page.getByRole("heading", {
        name: "How was shopping with us?"
      });
      await storeHeading.waitFor();
      await page.waitForFunction(
        () =>
          document.activeElement?.textContent === "How was shopping with us?"
      );
      assert.strictEqual(
        await page
          .locator("[data-store-review-composer]")
          .getByText(/points/i)
          .count(),
        0,
        "no points copy"
      );
      await page.getByRole("radio", { name: /2 stars/ }).click();
      await page.getByRole("button", { name: "Submit rating" }).click();
      await page.getByRole("button", { name: "Continue" }).waitFor();
      const storeCalls = calls.filter((c) =>
        c.path.startsWith("/api/v1/store_reviews")
      );
      assert.deepStrictEqual(
        storeCalls.map((c) => `${c.method} ${c.path}`),
        ["POST /api/v1/store_reviews", "PATCH /api/v1/store_reviews/12"],
        "409 already_reviewed switches to PATCH"
      );
      storeCalls.forEach((c) => {
        assert.strictEqual(c.headers["x-review-token"], REVIEW_TOKEN);
        assert.ok(!c.headers.authorization, "no Bearer with the token");
        assert.match(c.contentType, /^application\/json/);
        assert.strictEqual(c.body.rating, 2);
      });
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByRole("heading", { name: /Thanks/ }).waitFor();
      // The store button (product rows have "Edit" with an aria-label).
      await page
        .locator("button", { hasText: /^Edit your review of / })
        .waitFor();
      assert.deepStrictEqual(errors, []);
      await context.close();
    }
  },
  {
    name: "account reviews page shows the own store review with Edit",
    run: async (browser) => {
      const { context, page } = await open(
        browser,
        "/account/reviews?tab=mine",
        {
          signedIn: true,
          state: {
            storeExisting: ownStoreReview({
              rating: 4,
              title: "Easy returns",
              body: "Swapped a size with no fuss.",
              status: "published",
              status_message: "Your review is live.",
              published_at: "2026-11-20T10:00:00Z"
            })
          }
        }
      );
      const row = page.locator("[data-own-store-review]");
      await row.waitFor({ timeout: PAGE_TIMEOUT });
      await row.getByText("Easy returns").waitFor();
      await row.getByRole("button", { name: /^Edit your review of / }).click();
      const dialog = page.getByRole("dialog", {
        name: /^Edit your review of /
      });
      await dialog
        .getByRole("heading", { name: "How was shopping with us?" })
        .waitFor();
      assert.strictEqual(
        await dialog
          .getByRole("radio", { name: /4 stars/ })
          .getAttribute("aria-checked"),
        "true"
      );
      await context.close();
    }
  },

  /* M6 product questions --------------------------------------------- */
  {
    name: "PDP Questions tab shows answered questions and the ask form",
    run: async (browser) => {
      const { context, page, errors } = await open(browser, `/${SLUG}`);
      const tab = page.getByRole("tab", { name: /Questions \(2\)/ });
      await tab.waitFor({ timeout: PAGE_TIMEOUT });
      await page.getByRole("tab", { name: /Reviews \(128\)/ }).waitFor();
      await tab.click();
      assert.strictEqual(await tab.getAttribute("aria-selected"), "true");
      const question = page.locator("#question-31");
      await question
        .getByText("Is the fabric see-through in the white?")
        .waitFor();
      await question.getByText("Official answer").waitFor();
      await question.getByText("Verified buyer").waitFor();
      // Signed out: a sign-in link that comes back to the tab.
      const signInLink = page.getByRole("link", { name: "Sign in to ask" });
      assert.strictEqual(
        await signInLink.getAttribute("href"),
        `/login?redirect=${encodeURIComponent(`/${SLUG}#questions`)}`
      );
      assert.deepStrictEqual(errors, []);
      await context.close();

      // Signed in, from the answer email's deep link.
      const asker = await open(browser, `/${SLUG}#question-32`, {
        signedIn: true
      });
      const deepTab = asker.page.getByRole("tab", { name: /Questions/ });
      await deepTab.waitFor({ timeout: PAGE_TIMEOUT });
      await asker.page.waitForFunction(
        () => document.activeElement?.id === "question-32"
      );
      assert.strictEqual(await deepTab.getAttribute("aria-selected"), "true");
      const box = asker.page.getByLabel("Your question");
      await box.fill("Short?");
      await asker.page.getByText("6 / 500").waitFor();
      await asker.page.getByRole("button", { name: "Ask question" }).click();
      await asker.page.getByText(/at least 10 characters/).waitFor();
      assert.strictEqual(await box.getAttribute("aria-invalid"), "true");
      await box.fill("Does it shrink in the wash?");
      await asker.page.getByRole("button", { name: "Ask question" }).click();
      await asker.page
        .getByRole("status")
        .getByText("Thanks! We'll email you when it's answered.")
        .waitFor();
      const post = asker.calls.find(
        (c) =>
          c.method === "POST" && c.path === `/api/v1/products/${SLUG}/questions`
      );
      assert.ok(post, "POST /questions sent");
      assert.ok(post.headers.authorization, "sends the Bearer token");
      assert.strictEqual(post.body.body, "Does it shrink in the wash?");
      await asker.context.close();

      // 429 is shown; 503 hides the tab entirely.
      const limited = await open(browser, `/${SLUG}#questions`, {
        signedIn: true,
        state: { askLimited: true }
      });
      await limited.page
        .getByLabel("Your question")
        .fill("Is there a matching skirt?", { timeout: PAGE_TIMEOUT });
      await limited.page.getByRole("button", { name: "Ask question" }).click();
      await limited.page
        .getByRole("alert")
        .getByText(/asked a lot of questions today/)
        .waitFor();
      await limited.context.close();

      const off = await open(browser, `/${SLUG}`, {
        state: { questionsDisabled: true }
      });
      await scrollToReviews(off.page);
      assert.strictEqual(await off.page.getByRole("tab").count(), 0);
      assert.match(
        await off.page.locator("#reviews h2").first().innerText(),
        /Reviews \(128\)/i
      );
      await off.context.close();
    }
  }
];

const main = async () => {
  const { chromium } = require("playwright");
  const only = process.env.E2E_ONLY;
  const checks = only ? CHECKS.filter((c) => c.name.includes(only)) : CHECKS;
  let server = null;
  let browser = null;
  let failed = 0;
  try {
    server = await startServer();
    browser = await chromium.launch({ headless: !process.env.E2E_HEADED });
    for (const check of checks) {
      const started = Date.now();
      try {
        await check.run(browser);
        console.log(`  ok   ${check.name} (${Date.now() - started} ms)`);
      } catch (error) {
        failed += 1;
        console.log(
          `  FAIL ${check.name}\n       ${String(
            error && error.stack ? error.stack : error
          )
            .split("\n")
            .slice(0, 6)
            .join("\n       ")}`
        );
      }
    }
  } finally {
    if (browser) await browser.close();
    stopServer(server);
  }
  console.log(`\n${checks.length - failed}/${checks.length} passed`);
  process.exitCode = failed ? 1 : 0;
};

module.exports = {
  installMocks,
  recordReviewPosts,
  signIn,
  makePng,
  startServer,
  stopServer,
  PHONE,
  DESKTOP,
  BASE_URL,
  API_URL,
  SLUG,
  REVIEW_TOKEN,
  REVIEW_REQUEST
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
