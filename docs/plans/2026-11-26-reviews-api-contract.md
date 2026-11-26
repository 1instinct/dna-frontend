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

---

# M4 email flow

The "How's your order?" email links to the storefront page `/review/[token]`. The token is the customer's proof of purchase, so guest checkouts can review without an account. dna-admin stores only its SHA256. Each email (the request, then one reminder) issues a new token, and only the latest link works.

## Email links

- Star: `{SITE_URL}/review/{token}?item={line_item_id}&rating={1-5}`. Preselect that item and rating.
- Page: `{SITE_URL}/review/{token}`.
- Opt-out: `{SITE_URL}/review/{token}?opt_out=1`. Call `POST …/opt_out` (below) and show a confirmation. Don't open the composer.
- The email lists only items that haven't been reviewed yet. The page lists every item.

## Link lifecycle

| status | `GET` | review with `X-Review-Token` |
|---|---|---|
| `sent`, `reminded` (before `expires_at`) | 200 | yes |
| `completed` (before `expires_at`) | 200; every item has `existing_review` | yes (edits) |
| unknown token, `expired`, past `expires_at`, `opted_out`, `cancelled` | 404 | 404 `invalid_token` |

- `expires_at` is `send_after` plus `request_expiry_days` (60 by default).
- A request becomes `completed` once every item on the order has a review. There is no server-side "skip": a request with skipped items stays `sent` or `reminded` until it expires.
- **Decision:** a completed link keeps working until it expires. The customer can come back from the email to see and edit what they sent.

## GET `/api/v1/review_requests/:token`

```json
{
  "order_number": "R123456789",
  "display_name": "Maya R.",
  "items": [
    { "line_item_id": 53, "product_id": 1, "slug": "rib-knit-wrap-top", "name": "Rib-Knit Wrap Top",
      "image_url": "https://…", "variant_label": "Rose · M",
      "questions": [ { "key": "fit", "label": "Fit", "kind": "bipolar", "low_label": "Runs small", "high_label": "Runs large" } ],
      "existing_review": null }
  ],
  "store_review": { "enabled": true, "existing_review": null },
  "points": { "per_review": 50, "photo_bonus": 50 },
  "has_account": false,
  "limits": { "max_photos": 5, "max_photo_mb": 10, "title_max": 120, "body_max": 5000,
              "photo_types": ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"] }
}
```

- No auth beyond `X-Spree-Token`.
- The first successful GET sets the request's `opened_at`. Later GETs don't change it.
- `items` holds the order's shipped products, one entry per product. `existing_review` uses the "own review" shape (M2) or is `null`.
- `display_name` is the default name for new reviews, for example "Maya R.".
- `store_review.enabled` mirrors the store-reviews setting. `existing_review` is this order's store review, if there is one. Store reviews are written in M5 (`/api/v1/store_reviews`), which will take the same header.
- `has_account` is `true` when the order belongs to an account. Points go to that account. With `false`, show "Create an account to collect points" rather than a points total. Points are only paid to accounts.
- **404** `{ "error": "not found" }` for any link that isn't usable (see the table above).
- **503** `{ "code": "not_enabled" }` while reviews are switched off.

## POST `/api/v1/review_requests/:token/opt_out`

**200** `{ "status": "opted_out" }`. This works for any request the token belongs to, whatever its status, and calling it again is fine. **404** for an unknown token.

Opting out covers the email address, not just this order. Other requests for that address get no further emails: each is cancelled when its next email would go out. Future orders to the address are never scheduled.

## `X-Review-Token` on POST / PATCH `/api/v1/reviews`

Send `X-Review-Token: <token>` instead of `Authorization: Bearer`. The fields and responses are the same as in M2, with these differences:

- **Scope:** only that order's items. Another product, or a `line_item_id` from another order, gets **403** `not_eligible`. PATCH reaches only reviews from that order or request. Any other id gets **404**.
- **Source:** the review is stamped `source: "email"`.
- **Owner:** the review belongs to the order's account, or to no account for a guest checkout.
  - If a Bearer is sent along, the review still goes on the token's order. A signed-in user who isn't the buyer is never attached to it.
  - A Bearer that doesn't resolve to a user is still **401**.
- **Completion:** after a successful submit, the request is marked `completed` once every item has a review.
- **Invalid link:** an unknown, expired, opted-out or cancelled token returns **404** `{ "error": "This review link isn't valid any more", "code": "invalid_token" }`. Show the expired-link state.
- **Rate limit:** 20 submissions an hour per link, counting every attempt. After that, **429**.
- **DELETE:** still needs a Bearer. It returns **401** with only the token.

## Scheduling (for reference)

- **Delay:** the email is due `request_delay_days` (7) after the last shipment ships, or `international_request_delay_days` (10) when the ship-address country isn't the store's home country.
- **Reminder:** one, `reminder_delay_days` (7) after the first email, and only when nothing has been reviewed yet.
- **Dispatch:** `rake reviews:dispatch` sends both, hourly. It doesn't send while reviews are switched off.
