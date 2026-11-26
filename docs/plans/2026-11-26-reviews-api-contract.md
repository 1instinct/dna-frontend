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

---

# M2 write path

These endpoints need a signed-in customer: `Authorization: Bearer <token>`, otherwise **401**. The email-link flow (M4) will also accept `X-Review-Token` on the same endpoints. Errors use `{ "error", "fields"?, "code"? }`, where `code` is one of `not_eligible`, `forbidden`, `not_enabled` or `invalid`.

## "Own review" shape

This is the public review shape (see M1) plus these fields:

```json
{
  "...public review fields...": "",
  "status": "published",
  "status_message": "Your review is live.",
  "product": { "id": 1, "slug": "rib-knit-wrap-top", "name": "Rib-Knit Wrap Top", "image_url": "https://…" },
  "points": { "awarded": 100, "pending": 0 }
}
```

- `status` is `published`, `pending`, `rejected` or `hidden`.
- `status_message` is written for the customer, and never names a moderation reason:
  - `published`: "Your review is live."
  - `pending`: "Thanks! We're checking it before it goes live."
  - `rejected` or `hidden`: "This review isn't shown on the site."
- `points.awarded` is what was already paid for this review. `points.pending` is what it will earn once published: 50, plus 50 with photos (from settings), or 0 when nothing more is due.
- `published_at` is `null` until the review is published.

## GET `/api/v1/products/:product_id/review_form`

Use this before opening the composer from the product page.

```json
{
  "eligible": true,
  "reason": null,
  "line_item_id": 53,
  "variant_label": "Rose · M",
  "existing_review": null,
  "questions": [
    { "key": "fit", "label": "Fit", "kind": "bipolar", "low_label": "Runs small", "high_label": "Runs large" }
  ],
  "display_name": "Maya R.",
  "points": { "per_review": 50, "photo_bonus": 50 },
  "limits": { "max_photos": 5, "max_photo_mb": 10, "title_max": 120, "body_max": 5000,
              "photo_types": ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"] }
}
```

- `existing_review` is the own-review shape when the customer has already reviewed the product.
- When the customer can't review, the response is still **200**, with `eligible: false` and `reason` set to `"not_purchased"`, `"not_shipped"` or `"staff"`. Show no "Write a review" button in that case.

## GET `/api/v1/account/reviewables`

Products the customer has received, newest purchase first, one entry per product:

```json
{ "data": [ { "line_item_id": 53, "order_number": "R123", "product_id": 1, "slug": "rib-knit-wrap-top",
              "name": "Rib-Knit Wrap Top", "image_url": "https://…", "variant_label": "Rose · M",
              "purchased_at": "2026-11-12T…Z",
              "existing_review": { "id": 77, "rating": 5, "status": "published" },
              "questions": [ { "key": "fit", "label": "Fit", "kind": "bipolar", "low_label": "Runs small", "high_label": "Runs large" } ] } ],
  "points": { "per_review": 50, "photo_bonus": 50 } }
```

`existing_review` is `null` when the product hasn't been reviewed yet.

## GET `/api/v1/account/reviews?page=&per_page=`

`{ "data": [own review], "meta": { page, per_page, total_count, total_pages } }`, newest first, any status.

## POST `/api/v1/reviews` (multipart/form-data, or JSON without photos)

| field | |
|---|---|
| `product_id` | slug or id, required |
| `line_item_id` | optional; which purchase this review is for |
| `rating` | 1–5, required |
| `title`, `body`, `display_name` | optional |
| `attribute_ratings[fit]` | 1–5 per question key |
| `photos[]` | files, up to 5 |

- Responses:
  - **201** `{ "review": own review }` for a new review.
  - **200** when the customer already reviewed the product. Posting again edits that review.
  - **403** `code: not_eligible` (not bought, or not shipped yet) or `code: forbidden` (staff account).
  - **422** `{ error, fields }`, for example `fields.photos`, `fields.rating`, or `fields.attribute_ratings` for an unknown question.
  - **429** after 10 reviews in an hour.
  - **503** `code: not_enabled` while reviews are switched off in admin.
- An edit goes back through moderation. A previously rejected or hidden review always waits for a person.

## PATCH `/api/v1/reviews/:id`

Takes the same fields as POST, minus `product_id` and `line_item_id`, plus `remove_photo_ids[]` (attachment ids from `photos[].id`). Photos sent in `photos[]` are added to the existing ones, and the total must stay at 5 or fewer.
- Only the review's own customer can edit it. Any other id returns **404**.
- Success returns **200** `{ "review": own review }`.

## DELETE `/api/v1/reviews/:id`

**204**. Removes the customer's own review and its photos, and updates the stats. Points already earned stay.

## POST `/api/v1/reviews/:id/votes` `{ "helpful": true | false }`

- Signed in: the vote is counted per account. Anonymous: send an `X-Visitor-Id` header, a random id the storefront keeps in localStorage; without it the response is **422**.
- Response: **200** `{ "helpful_count": 25, "unhelpful_count": 1, "your_vote": true }`.
- The review must be published, otherwise **404**. Customers can't vote on their own review (**422**).
- Rate limit: 60 votes an hour per account; **429** after that.

## POST `/api/v1/reports` (existing endpoint)

Body: `{ "target": { "type": "review", "id": 77 }, "reason": "spam", "details": "…" }`. Bearer required.
- `reason` is one of `spam harassment hate sexual violence impersonation self_harm other`.
- Response: **201** `{ id }`. **404** for an unknown or unpublished review. **422** for reporting your own review.
- Three open reports send a review back to moderation (`pending`). It reappears only if an admin publishes it again.
