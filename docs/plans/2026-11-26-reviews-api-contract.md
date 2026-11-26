# Reviews API Contract (M1 read path)

> Mirrored in `dna-admin/docs/plans/` and `dna-frontend/docs/plans/`. Served by dna-admin, consumed through `lib/api/dnaFetch.ts`.
> Plain JSON, no `response_code` envelope. Errors are `{ "error": "message", "fields": { … } }`, like the profile endpoints.

## Auth and scope

- Every request sends `X-Spree-Token` (the storefront key), as all dna-frontend calls do.
- `scope` = `retail` (default) · `all` · `wholesale`.
  - `all` and `wholesale` require `Authorization: Bearer <user token>` for a user with the `wholesale` or `admin` role. Otherwise the response is **403** `{ "error": "Wholesale reviews are only available to wholesale accounts" }`.
  - The `X-Spree-Token` key never counts as a wholesale viewer, whoever owns it.
- An unknown `scope` value is treated as `retail`.
- `:product_id` accepts a slug or a numeric id. It returns **404** for products the public can't see (not yet available, discontinued or deleted).
- An invalid Bearer token returns **401**.

## GET `/api/v1/products/:product_id/review_summary?scope=retail`

```json
{
  "scope": "retail",
  "average": 4.6,
  "ratings_count": 128,
  "reviews_count": 84,
  "photos_count": 24,
  "histogram": { "1": 3, "2": 4, "3": 8, "4": 21, "5": 92 },
  "attributes": [
    { "key": "fit", "label": "Fit", "kind": "bipolar", "low_label": "Runs small", "high_label": "Runs large",
      "average": 2.4, "count": 31 },
    { "key": "quality", "label": "Quality", "kind": "scale", "low_label": null, "high_label": null,
      "average": 4.7, "count": 60 }
  ],
  "ai_summary": null,
  "latest_photos": [
    { "id": 501, "review_id": 77, "thumb_url": "https://…", "card_url": "https://…", "full_url": "https://…",
      "alt": "Customer photo of Rib-Knit Wrap Top" }
  ]
}
```

- `ratings_count` counts every published rating, star-only ones included. `reviews_count` counts the ones with text.
- `attributes` lists the active questions for this product, in admin order, and only those with `count > 0`. For a `bipolar` attribute, an average of 3 means "true to size".
- `ai_summary` is `null` until M7. After that it has this shape:
  `{ "headline", "summary", "pros": [{ "label", "mentions" }], "cons": [...], "fit_consensus": "runs_small"|"true_to_size"|"runs_large"|null, "review_count", "generated_at", "source_scope": "retail" }`.
  - It is always built from retail reviews.
  - With `scope=all` the same retail summary comes back, so label it "from retail reviews".
  - With `scope=wholesale` it is `null`.
- `latest_photos` holds at most 12 photos from published reviews in the scope, newest first.
- A product with no reviews still returns 200 with zeros, an empty histogram (all five keys at 0), `attributes: []` and `latest_photos: []`.

## GET `/api/v1/products/:product_id/reviews`

Query params:

| param | values | default |
|---|---|---|
| `scope` | `retail` · `all` · `wholesale` | `retail` |
| `sort` | `helpful` · `recent` · `rating_desc` · `rating_asc` | `helpful` |
| `rating[]` | 1–5, repeatable | all |
| `with_photos` | `1` | off |
| `written` | `1` for reviews with text only | off |
| `page` | ≥ 1 | 1 |
| `per_page` | 1–50 | 10 |

Ordering:
- `helpful`: helpful count desc, then published_at desc.
- `recent`: published_at desc.
- `rating_desc` / `rating_asc`: rating, then published_at desc.

```json
{
  "data": [
    {
      "id": 77,
      "rating": 5,
      "title": "Softest thing I own",
      "body": "The rib has real weight…",
      "display_name": "Maya R.",
      "variant_label": "Rose · M",
      "verified_purchase": true,
      "incentivized": true,
      "channel": "retail",
      "attribute_ratings": { "fit": 2 },
      "photos": [
        { "id": 501, "thumb_url": "https://…", "card_url": "https://…", "full_url": "https://…",
          "alt": "Customer photo of Rib-Knit Wrap Top" }
      ],
      "helpful_count": 24,
      "unhelpful_count": 1,
      "reply": { "body": "Thank you…", "replied_at": "2026-11-20T10:00:00Z" },
      "published_at": "2026-11-18T09:12:00Z",
      "edited": false
    }
  ],
  "meta": { "page": 1, "per_page": 10, "total_count": 84, "total_pages": 9, "scope": "retail" }
}
```

- Only published reviews appear. `title`, `body`, `variant_label` and `reply` may be `null`.
- `channel` is always `"retail"` in the retail scope. Show a "Wholesale buyer" badge when it is `"wholesale"`.
- Photo URLs are absolute and point at dna-admin's ActiveStorage representations.

## Storefront v2 product attributes

`GET /api/v2/storefront/products` and `/products/:slug` gain four attributes on `ProductSerializer` (every viewer, wholesale accounts included, gets this serializer):

| attribute | meaning |
|---|---|
| `avg_rating` | retail average, `"4.6"` (string, decimal) |
| `reviews_count` | retail ratings count (integer) |
| `all_avg_rating` | all-channel average |
| `all_reviews_count` | all-channel ratings count |

Use the `all_*` pair in wholesale mode. Hide the stars when the count is 0.
