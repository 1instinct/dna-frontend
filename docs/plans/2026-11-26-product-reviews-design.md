# Product Reviews Design

> Mirrored in `dna-admin/docs/plans/` and `dna-frontend/docs/plans/`. Edit both together.
> Companion: `2026-11-26-product-reviews-plan.md` (implementation plan).

## Goal

Give DNA a review system in the class of Junip / Trustpilot that we own end to end:

1. **Easy for customers** — one tap from a post-purchase email, no login, star-only allowed, photos from the phone camera roll, done in under a minute.
2. **Native to dna-admin + dna-frontend** — reviews live in Postgres next to products and orders; ratings ride along on the existing product payloads; moderation sits in Spree admin.
3. **Flexible** — product reviews, store reviews, Q&A, configurable per-category attributes (e.g. fit), AI summaries, and a phase 2 "Ask AI" assistant, all behind settings.

## Decisions

| Question | Decision | Why |
|---|---|---|
| Build or buy | **Build native** | Junip and Judge.me are effectively Shopify-only. Vendors that support custom platforms gate their API behind ~$299–$499+/mo tiers (REVIEWS.io Plus, Yotpo Premium, Junip Premium) and render JS widgets that need extra work for SEO. A native build reuses ActiveStorage/S3, `spree_loyalty_points`, `ContentReport`, `Profiles::ContentFilter`, and Mailgun. The `spree_reviews` gem now needs Spree ≥ 4.5 and has no API, photos or request emails, so it is a reference only. |
| Who can review products | **Verified buyers only** | A shipped order containing the product (any variant). Email-token flow proves purchase without login, so guest checkouts can review too. |
| Incentives | **Loyalty points, sentiment-blind** | e.g. 50 pts per published review, +50 with a photo. Same reward for 1★ and 5★. Flag `incentivized=true`, label it on the card, and send it to Google's feed as `is_incentivized_review`. |
| v1 scope | Product reviews + photos, request emails, store reviews, Q&A, AI summary | |
| Phase 2 | **Ask AI** (shoppers ask questions answered from reviews, Q&A and product data), AI moderation assist, video reviews, verified-buyer answer requests | |
| AI runtime | **Next.js server routes using `@anthropic-ai/sdk`** | dna-admin is pinned to Ruby 2.7.2 and the `anthropic` gem requires Ruby ≥ 3.2. dna-frontend already runs a Node server (Next.js API routes) and Phase 2 needs streaming to the browser anyway. |
| Account deletion | **Anonymize** | Rating, title, body and attribute ratings stay. `user_id` → null, `display_name` → "Former customer", photos purged (they may show the person). Stats are unchanged. |
| Request timing | **7 days after ship, 10 for international** | Spree 4.2 has no delivered state, so we count from `shipped_at`. International means the ship-address country differs from the store's default country. One reminder 7 days after the first email. |
| Points | **50 per published review, +50 with a photo** | Same for every rating and both channels. |
| Retail vs wholesale | **Separate by channel** | Every review is stamped `retail` or `wholesale` from its order. Retail PDPs and everything public (cards, JSON-LD, Google feed, AI summary) use retail reviews only. Wholesale PDPs show all reviews, with a "Wholesale only" filter. |

## Compliance guardrails (bake into code, not policy docs)

From the FTC Consumer Reviews and Testimonials rule (16 CFR 465, in force Oct 2024) and Google's review policies:

- **Moderation is sentiment-blind.** Auto-publish and hold rules never read `rating`. Rejections need a reason from a fixed list (spam, off-topic, PII, profanity/abuse, not about the product, duplicate) that applies to every star level.
- **Rewards are sentiment-blind**, and copy never asks for a positive review ("Tell us what you think", never "Tell us what you loved").
- **No review suppression.** Low-star reviews show in the list, summary, histogram, JSON-LD and Google feed.
- **Default sort is "Most helpful"** (helpful votes, then recency), never rating-descending.
- **Staff reviews:** staff accounts can't submit product reviews (block `spree_role` admin) or, if we ever allow it, they are labelled.
- **Channel separation is not suppression.** Retail and wholesale are different buyer populations, and the split is by who bought, never by rating. Retail stats and retail lists contain every retail review, at every star level.
- **AI summaries** are labelled "AI summary of N reviews", must represent negatives proportionally, and can be hidden per product by admins (hiding is logged).

## Architecture

```
 Customer ──► dna-frontend (Next.js 13, Tailwind/shadcn)
                │  PDP · ProductCard · /review/[token] · /account/reviews · /reviews
                │  pages/api/internal/reviews/summarize   (Claude, cron-triggered)
                │  pages/api/products/[slug]/ask          (Claude streaming, phase 2)
                ▼
            dna-admin (Rails 6.1 / Spree 4.2.5)
                │  /api/v1/reviews…, /questions…, /store_reviews…, /review_requests/:token
                │  v2 storefront product serializer + avg_rating, reviews_count
                │  Spree admin: Reviews · Questions · Store reviews · Requests · Settings
                │  Shipment#after_ship → ReviewRequest(send_after = shipped_at + N days)
                │  rake reviews:dispatch (hourly: Heroku Scheduler / k8s CronJob)
                │      ├─ sends due request + reminder emails (Mailgun, inline)
                │      └─ POSTs frontend /api/internal/reviews/summarize
                ▼
            Postgres · S3 (ActiveStorage photos) · Mailgun · Google Merchant Center (XML feed)
```

Why a cron rake, not delayed jobs: dna-admin has no persistent job queue (ActiveJob is `:async`, in-memory). A delayed `perform_later` would be lost on dyno restart. The rake is idempotent (state lives on `ReviewRequest`), matching the repo's "send mail inline" convention.

## Data model (dna-admin)

All tables `spree_`-prefixed, models under `Spree::`.

### `Spree::Review`
| column | type | notes |
|---|---|---|
| `reviewable_type`, `reviewable_id` | polymorphic | `Spree::Product` or `Spree::Store` (store reviews) |
| `variant_id` | fk, null | variant actually purchased ("Purchased: Rose / M") |
| `user_id` | fk, null | null for guest-token reviews and after account anonymization |
| `order_id`, `line_item_id` | fk, null | proof of purchase |
| `review_request_id` | fk, null | email-flow attribution |
| `rating` | int 1–5 | required |
| `title` | string(120) | optional |
| `body` | text (≤ 5000) | optional → star-only rating |
| `attribute_ratings` | jsonb `{}` | e.g. `{"fit": 2, "quality": 5}` keyed by `ReviewAttribute#key` |
| `status` | string | `pending` · `published` · `rejected` · `hidden` |
| `moderation_reason`, `moderated_by_id`, `moderated_at` | | |
| `verified_purchase` | bool | always true in v1, kept for imports |
| `incentivized` | bool | points offer was active |
| `points_awarded_at` | datetime | idempotent award |
| `source` | string | `email` · `web` · `account` · `app` · `import` |
| `channel` | string, indexed | `retail` · `wholesale`, stamped from the order at submit by `Reviews::Channel` (see below); admins can correct it |
| `display_name` | string | "Maya R." (first name + last initial), editable in form |
| `locale` | string | |
| `helpful_count`, `unhelpful_count`, `reports_count` | int | counters |
| `reply_body`, `reply_author_id`, `replied_at` | | public merchant reply |
| `published_at` | datetime | |
| `ip_hash` | string | rate limiting / abuse |

`has_many_attached :photos` (≤ 5, jpeg/png/webp/heic, ≤ 10 MB each, named variants `thumb 160`, `card 480`, `full 1600`), with `active_storage_validations` like `AppFeedback`. Unique index on `(user_id, reviewable_type, reviewable_id)` where `user_id IS NOT NULL`, and `(order_id, reviewable_type, reviewable_id)`: one review per product per order or user, editable afterwards.

### `Spree::ReviewVote`
`review_id`, `user_id` (null), `voter_key` (SHA256 of user id or anonymous cookie), `helpful` bool. Unique `(review_id, voter_key)`.

### `Spree::ReviewRequest`
`order_id` (unique), `user_id`, `email`, `token_digest` (SHA256; raw token only in the email), `status` (`scheduled` · `sent` · `reminded` · `completed` · `opted_out` · `expired` · `cancelled`), `send_after`, `sent_at`, `reminded_at`, `opened_at`, `completed_at`, `expires_at`.

### `Spree::ReviewStat` (denormalized, one row per reviewable per scope)
`reviewable_type/id` + `scope` (unique), where `scope` is `retail`, `wholesale` or `all`, `average` decimal(3,2), `ratings_count` (all), `reviews_count` (with text), `histogram` jsonb `{"1":n,…,"5":n}`, `attribute_averages` jsonb, `photos_count`, `ai_summary` jsonb `{headline, summary, pros:[{label,mentions}], cons:[…]}`, `ai_summary_review_count`, `ai_summary_generated_at`, `ai_summary_hidden` bool.
Recomputed in `after_commit` of Review publish/unpublish/channel change: three cheap SQL aggregates, one per scope. The **retail** scope is copied onto `spree_products.avg_rating` / `spree_products.reviews_count` so listings can sort and filter with ransack ("Top rated", "4★ & up"). The `all` scope is copied onto `spree_products.all_avg_rating` / `all_reviews_count` for wholesale listings. The AI summary lives on the retail row only.

### Retail vs wholesale channel

`Reviews::Channel.for(order)` returns `wholesale` when `order.channel == "wholesale"` (Spree's existing `spree_orders.channel` column, default `"spree"`) **or** the order's user has the `wholesale` Spree role. Otherwise it returns `retail`.

**Dependency:** wholesale ordering isn't wired up end to end today. dna-admin only has `spree_prices.wholesale_price`, and dna-frontend's `wholesale` flag in `pages/_app.tsx` is hard-coded `false`. Until wholesale checkout stamps `order.channel = "wholesale"` or wholesale accounts get the role, every review is `retail`. Admins can reclassify a review from the queue, which also covers backfilling.

| | Retail PDP | Wholesale PDP |
|---|---|---|
| Default list and stats | Retail reviews only | All reviews (retail + wholesale) |
| Filter | none | "Wholesale only" chip, which switches list, histogram and attribute bars to the `wholesale` scope |
| Badge on card | "Verified buyer" | "Verified buyer" plus "Wholesale buyer" on wholesale reviews |
| AI summary | Retail summary | Retail summary, labelled "from retail reviews"; hidden while "Wholesale only" is on |
| Product cards | `avg_rating` (retail) | `all_avg_rating` |
| JSON-LD, Google feed, store reviews | Retail only | n/a |

**Access:** the API returns wholesale reviews only when the request asks for `channel=all` or `channel=wholesale` **and** carries a Bearer token for a user with the `wholesale` or `admin` role; otherwise it returns 403. Wholesale reviews can mention trade pricing or minimum order quantities, so the hiding is enforced on the server, not just in the UI.

### `Spree::ReviewAttribute` (flexible per-category questions)
`key`, `label`, `kind` (`scale` 1–5, or `bipolar` with `low_label`/`high_label`, e.g. "Runs small" ↔ "Runs large"), `position`, `active`, `has_and_belongs_to_many :taxons` (none = all products). The form shows the attributes matching the product's taxons, and the PDP shows aggregated bars.

### `Spree::ProductQuestion` / `Spree::ProductAnswer`
Question: `product_id`, `user_id`, `body`, `display_name`, `status`, `answers_count`, `published_at`.
Answer: `question_id`, `user_id`, `body`, `official` bool (staff), `verified_buyer` bool, `status`, `helpful_count`.
**Only answered questions appear publicly**, so the PDP never shows a wall of unanswered questions. The asker is emailed when it's answered.

### `Spree::ReviewSetting` (singleton, like `AdminTheme`)
`enabled`, `store_reviews_enabled`, `questions_enabled`, `auto_publish` (default true), `photos_require_approval` (default true), `request_delay_days` (7), `international_request_delay_days` (10), `reminder_delay_days` (7), `request_expiry_days` (60), `points_per_review` (50), `points_photo_bonus` (50), `ai_summary_enabled`, `ai_summary_min_reviews` (5).

### Reused, extended
- `Spree::ContentReport`: add `review`, `question`, `answer` to `TARGET_TYPES`; increment `reports_count`; 3+ reports move a review back to `pending`.
- `Profiles::ContentFilter` + `config/moderation/blocked_terms.yml`: text screening.
- `Profiles::RateLimit` pattern: 10 reviews/hour/user, 60 votes/hour/voter, 5 questions/hour/user.
- `AccountDeletion`: anonymize reviews and Q&A (null `user_id`, `display_name` → "Former customer", purge review photos). Votes by the user are deleted. Ratings and text stay, so stats don't shift.

## Moderation pipeline

```
submit ──► validations ──► ContentFilter (blocked terms, URLs, emails/phones)
              │                     │ hit
              │                     ▼
              │                pending (reason: auto_flag)
              ▼
     has photos && photos_require_approval? ── yes ─► pending
              │ no
              ▼
     auto_publish? ── no ─► pending
              │ yes
              ▼
          published ──► ReviewStat refresh ──► award points (if eligible, once)
```
`rating` is never an input.

## API (dna-admin)

Custom endpoints follow the house style: `Spree::Api::V1::*` controllers, Bearer token (or `X-Spree-Token`), the `Profiles::ApiResponses` envelope, documented with swagger-blocks in `ApidocsController`.

**Public**
- `GET  /api/v1/products/:product_id/reviews?sort=helpful|recent|rating_desc|rating_asc&rating[]=5&with_photos=1&channel=retail|all|wholesale&page=&per_page=` (`product_id` accepts id or slug; `channel` defaults to `retail`, and `all`/`wholesale` need a wholesale or admin Bearer token)
- `GET  /api/v1/products/:product_id/review_summary?channel=` → stats for that scope + attribute averages + AI summary + 12 latest photos
- `POST /api/v1/reviews/:id/votes` `{helpful: true}`
- `POST /api/v1/reports` (existing) `{target_type: "review", target_id}`
- `GET  /api/v1/products/:product_id/questions?page=`
- `GET  /api/v1/store_reviews?…`, `GET /api/v1/store_reviews/summary`

**Authenticated (Bearer) or review token (`X-Review-Token`)**
- `GET  /api/v1/review_requests/:token` → order items `{line_item_id, product_id, slug, name, image, variant_label, existing_review}` + store-review state. Marks `opened_at`.
- `POST /api/v1/reviews` multipart: `product_id`, `line_item_id`, `rating`, `title`, `body`, `attribute_ratings`, `display_name`, `photos[]`
- `PATCH /api/v1/reviews/:id` (own review; edits go back through moderation)
- `POST /api/v1/store_reviews`
- `POST /api/v1/review_requests/:token/opt_out`

**Authenticated (Bearer)**
- `GET  /api/v1/account/reviewables` → purchased-and-shipped products not yet reviewed (this also gives the order page the product slug it currently lacks)
- `GET  /api/v1/account/reviews`
- `POST /api/v1/products/:product_id/questions`

**Service (admin token, used by dna-frontend's AI routes)**
- `GET  /api/v1/admin/review_summaries/stale?limit=10`
- `GET  /api/v1/admin/products/:product_id/reviews_for_summary`
- `PUT  /api/v1/admin/review_summaries/:product_id`

**Storefront v2**
- `product_serializer_decorator.rb`: add `avg_rating`, `reviews_count` (retail), `all_avg_rating`, `all_reviews_count`. ProductCard and PDP get stars with zero extra requests.

**Feeds**
- `GET /feeds/google/product_reviews.xml` (Rails builder, Google Product Review Feed **schema v2.4**): every published **retail** review with text, including `is_verified_purchase`, `is_incentivized_review` and `collection_method` (`post_fulfillment` for email, `unsolicited` for web). Product identifiers: SKU and brand (plus GTIN/MPN if we add them). Register in Merchant Center once we have **≥ 50 reviews**.

## Review request email flow

1. `Spree::Shipment` decorator, `after_ship`: `ReviewRequests::Schedule.call(order)` creates a `ReviewRequest` (idempotent on `order_id`) with `send_after = shipped_at + delay`, where delay is `international_request_delay_days` (10) when `order.ship_address.country_id != order.store.default_country_id` (falling back to `Spree::Config[:default_country_id]`), otherwise `request_delay_days` (7). Multi-shipment orders schedule from the **last** shipment to ship. Skips orders with no email. Wholesale orders get requests too, and their reviews are stamped `wholesale`.
2. `rake reviews:dispatch` (hourly):
   - `scheduled` and due → `ReviewRequestMailer.request(req).deliver_now` → `sent`
   - `sent`, reminder due, nothing reviewed → one reminder → `reminded`
   - past `expires_at` → `expired`
   - then POST `#{SITE_URL}/api/internal/reviews/summarize` (shared secret) to refresh stale AI summaries
3. The email lists each item with **five tappable stars**. Each star links to `#{SITE_URL}/review/#{token}?item=#{line_item_id}&rating=#{n}`, so the first tap already records intent. There is also an opt-out link.
4. `/review/[token]` (public page, no login):
   - Step 1 is preselected from the query string. The customer adds optional details and photos, then submits.
   - Next item: "2 of 3", with Skip.
   - Store review step: "How was ordering from DNA?" with delivery and packaging attributes.
   - Done: points earned (or "Create an account to collect 100 points"), links to keep shopping.
5. Launch backfill: `rake reviews:backfill[30]` schedules requests for orders shipped in the last 30 days, which bootstraps toward the 50-review Google threshold.

## Frontend (dna-frontend)

Stack reality check: the app is **Tailwind + shadcn/ui (Radix)**. Emotion/MUI were removed (see commits `bb2906b`, `fc65618`, `f11f2f2`), and `LLM-CONTEXT.md` is stale and should be updated as part of this work. Use `components/ui/*`, `cn()`, brand tokens (`brand #EB8B8B`, `secondary #E6CDC0`), `font-title` (IBM Plex Mono, uppercase, wide tracking) and `font-body` (Anybody ExtraLight).

### Surfaces
| Surface | Where | What |
|---|---|---|
| Star summary | `RetailProductDetails.tsx` under the `<h2>` title (and Wholesale) | `★★★★½ 4.6 · 128 reviews`, scrolls to `#reviews`. Hidden when 0 ratings. If the shopper is eligible: "Write a review". |
| Reviews section | between the two-column block and "Similar / Recommended" | Tabs `Reviews (128)` / `Questions (14)`. Overview (big average, histogram bars that act as filters, attribute bars), AI summary card, photo strip, toolbar (sort, "With photos", "Verified", star chips), review cards, "Show more". Takes a `channel` prop: `retail` from `RetailProductDetails`, `all` from `WholesaleProductDetails`, where the toolbar also shows a "Wholesale only" chip. |
| Product card stars | `components/ProductCard/ProductCard.tsx` footer | `★ 4.6 (128)` in `text-gray` 12px mono; omitted at 0. Reads `all_avg_rating` when the app is in wholesale mode. |
| Composer | `components/Reviews/ReviewComposer` in a shadcn `Sheet` (right on desktop, bottom on mobile) | Steps: Rating → Details (attributes, title, body, display name) → Photos → Done. Local draft autosave. |
| Email landing | `pages/review/[token].tsx` | Composer in page mode, multi-item progress, store-review step. |
| Order detail CTA | `pages/account/orders/[orderNumber].tsx` line items | "Write a review" / "Edit your review" / ★ shown, driven by `/account/reviewables`. |
| Account | `pages/account/reviews.tsx` | Tabs "To review" / "My reviews", plus an `AccountPageLayout` nav item. |
| Store reviews | `pages/reviews.tsx`, footer badge, homepage `Testimonials` source option | Trustpilot-style page with distribution and filters. `Testimonials` can read `source: "store_reviews"` instead of CMS rows. |

### Components (`components/Reviews/`)
`RatingSummary`, `ReviewsSection`, `ReviewsOverview` (histogram + attribute bars), `AiSummaryCard`, `ReviewMediaStrip` + `MediaLightbox` (dialog + embla carousel), `ReviewsToolbar`, `ReviewCard`, `ReviewComposer/{StepRating,StepDetails,StepPhotos,StepDone}`, `PhotoUploader`, `Questions/{QuestionsList,AskQuestionForm}`, `StoreReviews/{StoreRatingBadge,StoreReviewList}`.

New primitives in `components/ui/`: `textarea.tsx` (shadcn), `rating-input.tsx` (see a11y below).

### Data
- `lib/api/dnaFetch.ts`: one small wrapper (base URL, `X-Spree-Token`, optional Bearer, `X-Review-Token`, envelope unwrap, typed errors), so the new hooks don't copy header boilerplate like `useFavorites` does.
- `hooks/useReviews/` with `useReviewSummary`, `useProductReviews` (`useInfiniteQuery`), `useCreateReview`, `useUpdateReview`, `useVoteReview`, `useReportReview`, `useReviewables`, `useMyReviews`, `useReviewRequest(token)`; `hooks/useQuestions/`; `hooks/useStoreReviews/`. Keys go in `QueryKeys`: `REVIEW_SUMMARY`, `PRODUCT_REVIEWS`, `REVIEWABLES`, `MY_REVIEWS`, `REVIEW_REQUEST`, `QUESTIONS`, `STORE_REVIEWS`.
- `types/reviews.ts`: hand-written types matching the swagger docs.

### Customer UX details
- **Star-only reviews are valid.** They count in the average and histogram. The list shows written reviews ("Showing 84 written reviews · 128 ratings"), and the email's first tap alone is a complete review.
- Star labels: 1 "Hated it", 2 "Didn't like it", 3 "It's OK", 4 "Liked it", 5 "Loved it".
- Placeholder prompts are neutral and specific: "How's the fit, fabric, color in person?"
- **Photos:** pick from the camera roll (`accept="image/*"`, `multiple`), resize on the client with canvas to ≤ 1600 px JPEG before upload, show previews with remove buttons, up to 5.
- Variant shown on the card: "Purchased: Rose · M". Fit attribute bar on the PDP: "Runs small ←●→ Runs large".
- Optimistic helpful votes, one per voter. "Report" opens a reason picker.
- Edit or delete your own review from the account page.

### Accessibility
- `RatingInput` is a `role="radiogroup"` with five `role="radio"` items, arrow-key navigation, 44 px targets and visible labels. The existing `Rating` (`role="img"` wrapping `<button>`s) stays display-only.
- The histogram filter buttons are real `<button aria-pressed>` elements.
- Composer focus moves to each step heading. Submit status is announced via `aria-live`.
- Photos get optional alt text, defaulting to "Customer photo of {product}".

### SEO
- The PDP is currently client-rendered (`getServerSideProps` exists in `RetailProductDetails.tsx` but isn't exported by `pages/[productSlug].tsx`). Export a page-level `getServerSideProps` that fetches the product, review summary and first 5 reviews, and hydrates React Query via `initialData`.
- Render JSON-LD `Product` with `aggregateRating` (only when `ratings_count ≥ 1`) and `review[]` for the server-rendered reviews, since Google requires that marked-up reviews be visible.
- Fix the invalid Organization JSON-LD in `pages/_document.tsx` (missing outer braces) while here.

## AI

All Claude calls run server-side in dna-frontend with `@anthropic-ai/sdk`, model `claude-opus-5-5`. `ANTHROPIC_API_KEY` goes in server env only (never `NEXT_PUBLIC_`). Enable the SDK's server-side refusal fallback (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`).

**Infra prerequisite:** dna-frontend's Docker image is `node:18-bullseye`. Node 18 has been end-of-life since April 2025. Bump to `node:22`, and confirm the SDK's supported Node range, before adding the SDK.

### v1: AI review summary
- `pages/api/internal/reviews/summarize.ts`, protected by `INTERNAL_CRON_SECRET`, triggered by `reviews:dispatch`. It processes up to 10 stale products per call (stale means ≥ `ai_summary_min_reviews` published reviews and ≥ 3 new since the last summary, or > 30 days old).
- Input: all published reviews with text. If there are more than about 400, take a rating-stratified sample that preserves the histogram's proportions. Also pass the histogram itself, so the model knows the true distribution.
- Output via structured outputs (`output_config.format` JSON schema): `{headline (≤ 8 words), summary (≤ 60 words), pros: [{label, mentions}], cons: [{label, mentions}], fit: {consensus: "runs_small"|"true_to_size"|"runs_large"|null}}`. `effort: "low"` because this is summarization.
- Prompt rules: only claims supported by the reviews; represent criticism in proportion to how often it appears; no superlatives that the data doesn't support; no health, safety or performance claims; mention counts.
- Writes back with `PUT /api/v1/admin/review_summaries/:product_id`. Admins can preview, regenerate or hide it from the product's Reviews tab.

### Phase 2: Ask AI
- `pages/api/products/[slug]/ask.ts`, streaming over SSE to an "Ask about this product" box in the Questions tab.
- Context (system prompt, `cache_control` on the stable per-product block): product description, properties and sizes; published reviews (top 200 by helpfulness and recency); answered Q&A; shipping and returns policy (static pages).
- Rules: answer only from context; cite reviews by id (rendered as "Based on 6 reviews" with links); say when the answer isn't there and offer **"Ask the community"**, which posts it as a real `ProductQuestion`.
- Per-IP and per-user rate limits. Log questions so merchandisers can see the information gaps.
- Also in phase 2: an AI moderation assist (classify `pending` items for spam/PII/off-topic and suggest a rejection reason; a human still decides) and drafted official answers for staff.

## Admin (dna-admin)

- Sidebar: a new **Reviews** block in `app/views/spree/admin/shared/_main_menu.html.erb` with **Reviews · Questions · Store reviews · Requests · Settings**.
- **Reviews queue** (model it on `app_feedbacks` + `content_reports`):
  - filters: status (default `pending`), rating, channel (retail · wholesale), verified, has photos, reported, product, date
  - change a review's channel (retail ↔ wholesale), logged
  - bulk publish / reject (with reason) / hide
  - rows: stars, excerpt, product, customer, photo thumbnails, flags (auto-flag hit, report count)
- **Review detail:** full text, photos (remove individually), public reply, status with reason, links to order and customer.
- **Product tab "Reviews"** in `_product_tabs.html.erb` (pattern: product videos): stats, histogram, AI summary preview with Regenerate/Hide, and that product's reviews.
- **Questions:** queue plus an answer form (answers are `official`). Answering emails the asker.
- **Requests:** table plus funnel (scheduled → sent → opened → completed %).
- **Settings:** `ReviewSetting` form and `ReviewAttribute` CRUD with taxon assignment.

## Rollout

1. Ship dark: `ReviewSetting.enabled = false`, and the frontend reads `NEXT_PUBLIC_REVIEWS_ENABLED`.
2. Internal QA on staging with seeded reviews (`db/seeds` factory data, staging only).
3. Enable request emails first, plus backfill of the last 30 days. Show PDP sections once a product has ≥ 1 rating.
4. Store reviews page and footer badge once there are ≥ 25 store reviews.
5. Google feed once there are ≥ 50 reviews. Phase 2 after we have a few hundred reviews.

**Success metrics:** request → review conversion (target ≥ 8%), % of reviews with photos, % of PDP views with ≥ 1 review, PDP add-to-cart rate for products with vs without reviews.

## Resolved (26 Nov 2026)

1. Account deletion: **anonymize**.
2. Request delay: **7 days** after `shipped_at`, **10 for international** orders.
3. Points: **50 per review, +50 with a photo**.
4. Wholesale PDPs show **all reviews** with a **"Wholesale only"** filter. Retail never shows wholesale reviews.

## Open questions

1. How should a wholesale order be identified: `order.channel = "wholesale"` set at checkout, a `wholesale` Spree role on the account, or both? Neither is set anywhere today (see "Retail vs wholesale channel").
2. Do we want a native-app surface? The API is client-agnostic, so the same endpoints work.
