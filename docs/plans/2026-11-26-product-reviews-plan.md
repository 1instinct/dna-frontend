# Product Reviews Implementation Plan

> Mirrored in `dna-admin/docs/plans/` and `dna-frontend/docs/plans/`. Design: `2026-11-26-product-reviews-design.md`.
> Repos are tagged **[A]** dna-admin and **[F]** dna-frontend. Each milestone can ship on its own behind `ReviewSetting.enabled` / `NEXT_PUBLIC_REVIEWS_ENABLED`.

## Conventions

- **[A]** Minitest + FactoryBot (`test/`). Write each test first, watch it fail, then implement. Run `bin/rails test test/<path>`. Do not upgrade Ruby, Rails or Spree.
- **[A]** Admin CRUD follows the product-videos pattern (`app/models/spree/product_video.rb`, `app/controllers/spree/admin/product_videos_controller.rb`, `app/views/spree/admin/product_videos/*`). The queue follows `app_feedbacks` and `content_reports`.
- **[A]** API controllers live in `app/controllers/spree/api/v1/`, use the `Profiles::ApiResponses` envelope, and get swagger-blocks docs registered in `ApidocsController`.
- **[F]** Tailwind + `components/ui` primitives only (no Emotion/MUI). Hooks go in `hooks/<useX>/index.ts`, re-exported from `hooks/index.ts`, with keys in `hooks/queryKeys.ts`. Quality gate: `yarn pre-commit` (prettier, `tsc --noEmit`, eslint).
- **[F]** There is no test runner today. Add Playwright e2e (M2.6) with `page.route` API mocks for the critical flows.
- Commit per task, using the repo's `[Feature]: … Changes:` format.

---

## M0: Foundations

**M0.1 [A] Schema + models**
- Migrations: `spree_reviews`, `spree_review_votes`, `spree_review_requests`, `spree_review_stats`, `spree_review_attributes` (+ `spree_review_attributes_taxons`), `spree_product_questions`, `spree_product_answers`, `spree_review_settings`; add `avg_rating decimal(3,2) default 0` and `reviews_count int default 0` to `spree_products` (indexed).
- Models: `Spree::Review`, `ReviewVote`, `ReviewRequest`, `ReviewStat`, `ReviewAttribute`, `ProductQuestion`, `ProductAnswer`, `ReviewSetting` (`.instance` singleton, like `AdminTheme`).
- `app/models/spree/product_reviews_decorator.rb`: `has_many :reviews, as: :reviewable`, `has_one :review_stat, as: :reviewable`, `has_many :questions`. Same idea for `Spree::Store`.
- Tests (`test/models/spree/review_test.rb` etc.): rating range; body length; ≤ 5 photos and content types; uniqueness per user/order; status transitions; `display_name` default from the bill address ("Maya R.").
- Factories in `test/factories/reviews.rb`.

**M0.2 [A] Eligibility**
- `Reviews::Eligibility.for_user(user)` and `.for_order(order)` return `[{line_item, product, existing_review}]`. They use complete orders whose shipments are `shipped`, deduplicated by product, and exclude admins.
- Tests cover: guest order via token, unshipped order (none), a product purchased twice (one entry), and an existing review (marked).

**M0.3 [A] Moderation + stats services**
- `Reviews::Submit` (create/update):
  - permits only the allowed fields
  - runs `Profiles::ContentFilter.allowed?` plus a URL/email/phone regex
  - applies the pipeline from the design and sets `incentivized`
  - **never reads `rating` for status**
- `Reviews::Publish` / `Reject(reason)` / `Hide`.
- `Reviews::RefreshStats.call(reviewable)`: SQL aggregate into `ReviewStat`, then copies to `spree_products.avg_rating`/`reviews_count`.
- `Reviews::AwardPoints`: on first publish, if the user is present and `points_awarded_at` is nil, credit via `spree_loyalty_points` (check the gem's credit-transaction API in `1instinct/spree-loyalty-points`, and mirror `order_loyalty_points_decorator.rb`).
- Tests:
  - a 1★ and a 5★ with identical text get identical status (**regression test for sentiment-blind moderation**)
  - blocked term → pending
  - photos + `photos_require_approval` → pending
  - the stats math
  - points awarded once

**M0.4 [F] Primitives + API client**
- `components/ui/textarea.tsx` (shadcn) and `components/ui/rating-input.tsx` (radiogroup, arrows, 44 px targets, labels "Hated it…Loved it").
- `lib/api/dnaFetch.ts`, `types/reviews.ts`, and `QueryKeys` additions.
- Infra: bump `Dockerfile` to `node:22-bullseye`, then smoke-test `yarn build`.
- Update `LLM-CONTEXT.md` and `.github/copilot-instructions.md`: the styling stack is now Tailwind + shadcn.

## M1: Read path (stars everywhere)

**M1.1 [A] Public read API**
- `Api::V1::ProductReviewsController#index` with sort/filter/pagination; `product_id` accepts id or slug.
- `#summary`: stat, attribute averages, AI summary (unless hidden), latest 12 photo URLs (`card` variant).
- Serializers: `ReviewSerializer` (no email or user id; `display_name`, `variant_label`, `verified_purchase`, `incentivized`, photo URLs, reply).
- Routes in `config/routes.rb`; swagger docs.
- Integration tests: unpublished never leak; sort orders; slug lookup; hidden products respected (mirror the `hidden_products_*_test.rb` cases).

**M1.2 [A] Storefront v2 attributes**
- `app/serializers/spree/v2/storefront/product_serializer_decorator.rb`: add `avg_rating` and `reviews_count`.
- Test in the `hidden_products_storefront_test.rb` style.

**M1.3 [F] Stars on cards and PDP header**
- `components/Reviews/RatingSummary.tsx`, used in `RetailProductDetails.tsx` and `WholesaleProductDetails.tsx` under the title.
- `ProductCard.tsx` footer stars from `attributes.avg_rating`.

**M1.4 [F] Reviews section**
- `ReviewsSection`, `ReviewsOverview`, `AiSummaryCard` (renders nothing until data exists), `ReviewMediaStrip`, `MediaLightbox`, `ReviewsToolbar`, `ReviewCard`.
- `useReviewSummary` and `useProductReviews` (infinite).
- Lazy-load the list when `#reviews` nears the viewport.
- Empty state: "No reviews yet. Bought this? Your review helps the next person."

**M1.5 [F] SSR + JSON-LD**
- A page-level `getServerSideProps` in `pages/[productSlug].tsx` (reuse the one already written in `RetailProductDetails.tsx`): fetch product, summary and first 5 reviews, and pass them as React Query `initialData`.
- `components/Reviews/ProductJsonLd.tsx`: `Product` + `AggregateRating` + `Review[]`.
- Fix the Organization JSON-LD in `_document.tsx`.
- Verify with the Rich Results Test on staging.

## M2: Write path (logged-in)

**M2.1 [A] Write API**
- `POST/PATCH /api/v1/reviews` (multipart, Bearer), `GET /api/v1/account/reviewables`, `GET /api/v1/account/reviews`.
- `POST /api/v1/reviews/:id/votes`.
- Rate limits (`Reviews::RateLimit`, copying `Profiles::RateLimit`).
- Tests: a non-buyer gets 403; edits re-enter moderation; photo validation errors return field messages.

**M2.2 [A] Reports**
- Add `review`, `question`, `answer` to `ReportsController::TARGET_TYPES`; snapshot the content; at 3 or more reports, move the item to `pending`.

**M2.3 [F] Composer**
- `ReviewComposer` (Sheet; side `right` ≥ md, `bottom` below), steps Rating → Details → Photos → Done.
- `PhotoUploader`: canvas resize, previews, remove buttons.
- Draft autosave to localStorage key `dna_review_draft_<line_item_id>`.
- `useCreateReview` invalidates `REVIEW_SUMMARY`, `PRODUCT_REVIEWS`, `REVIEWABLES`.

**M2.4 [F] Entry points**
- Order detail line-item CTA (`pages/account/orders/[orderNumber].tsx`).
- `pages/account/reviews.tsx` ("To review" / "My reviews") and an `AccountPageLayout` nav item.
- PDP "Write a review" button when `useReviewables` contains the product.

**M2.5 [F] Votes + report UI** on `ReviewCard`.

**M2.6 [F] Playwright**
- Add `@playwright/test`, `playwright.config.ts` and `e2e/reviews.spec.ts` with mocked API.
- Specs: PDP shows summary and list; histogram filter; composer submits multipart; star-only submit works.
- Add a `test:e2e` script.

## M3: Admin moderation

**M3.1 [A] Menu + Reviews queue**
- A `_main_menu.html.erb` block.
- `Spree::Admin::ReviewsController` (index with filters + bulk, show, update, reply).
- Views modelled on `app_feedbacks`.
- Controller tests in `test/controllers/spree/admin/`.

**M3.2 [A] Product "Reviews" tab**
- `_product_tabs.html.erb` plus `Spree::Admin::ProductReviewsController#index`: stats, histogram, AI summary preview, Regenerate/Hide.

**M3.3 [A] Settings + attributes**
- `Spree::Admin::ReviewSettingsController` (singleton edit) and `ReviewAttributesController` (CRUD, taxon multi-select, `acts_as_list`).

## M4: Review request emails

**M4.1 [A] Scheduling**
- `app/models/spree/shipment_review_request_decorator.rb` (prepend `after_ship`) calls `ReviewRequests::Schedule`.
- Raw token: `SecureRandom.urlsafe_base64(32)`, stored as a SHA256 digest. The raw token is generated at send time (re-issued on reminder) and never persisted.
- Tests: idempotent per order; skipped when disabled or there is no email.

**M4.2 [A] Mailer**
- `ReviewRequestMailer#request` and `#reminder`: HTML + text, product image, five star links per item, opt-out link.
- Subject: "How's your DNA order?"
- Mailer tests check the link format and that the opt-out is present.

**M4.3 [A] Dispatch rake**
- `lib/tasks/reviews.rake`:
  - `reviews:dispatch`: send due requests, remind, expire, then ping the summarize endpoint. Idempotent and safe to run concurrently (`FOR UPDATE SKIP LOCKED`).
  - `reviews:backfill[days]`
- Scheduling: Heroku Scheduler hourly; a k8s `CronJob` manifest `k8-cronjob-reviews.yml`.
- Document both in `HEROKU_DEPLOYMENT.md`.

**M4.4 [A] Token API**
- `GET /api/v1/review_requests/:token` (sets `opened_at`), `POST …/opt_out`.
- `X-Review-Token` auth on `POST /reviews` and `/store_reviews`, scoped to that order's line items.
- `completed_at` is set when every item is reviewed or skipped.

**M4.5 [F] `/review/[token]` page**
- Public; `middleware.ts` only guards `/account`, so no change is needed. Confirm this.
- Composer in page mode, preselects `?item&rating`, progress "n of N", Skip, store-review step, done screen (points or account nudge), invalid/expired-token state.
- Playwright spec.

## M5: Store reviews

**M5.1 [A]** `Spree::Store` reviewable, `/api/v1/store_reviews` (+ summary), admin index (filtered `ReviewsController` or its own tab), store-level attributes (delivery, packaging).

**M5.2 [F]**
- `pages/reviews.tsx` (summary, distribution, list, filters).
- `StoreRatingBadge` in the footer, linking to `/reviews`.
- `Testimonials` gains `source: "store_reviews"` (reads `useStoreReviews`; the CMS source still works).

## M6: Q&A

**M6.1 [A]**
- Public `GET` (answered only) and auth `POST` question endpoints.
- Admin Questions queue with an answer form (`official: true`).
- `QuestionMailer#answered` to the asker.
- Tests cover that unanswered questions never appear publicly.

**M6.2 [F]**
- Questions tab: `QuestionsList` and `AskQuestionForm` (login-gated, with a "We'll email you when it's answered" confirmation).

## M7: AI summary

**M7.1 [A] Service endpoints**
- `Api::V1::Admin::ReviewSummariesController` with `stale`, `reviews_for_summary` and `update`.
- Admin-token auth; a service user's token goes in dna-frontend's `DNA_ADMIN_SERVICE_TOKEN`.

**M7.2 [F] Summarize route**
- Add `@anthropic-ai/sdk`.
- `lib/ai/anthropic.ts`: client plus the refusal-fallback configuration.
- `lib/ai/reviewSummary.ts`: prompt and JSON schema, using `output_config.format`, `effort: "low"`, model `claude-opus-5-5`.
- `pages/api/internal/reviews/summarize.ts`: secret check, batch of 10, stratified sampling, `PUT` back.
- Unit-test the sampler and schema parse with a mocked client.
- Read the claude-api reference for the current TS SDK surface before writing.

**M7.3 [F]** `AiSummaryCard`: headline, summary, pros/cons chips with mention counts, an "AI summary of N reviews" label, and an info popover explaining how it's made.

## M8: Google product review feed

**M8.1 [A]**
- `Feeds::GoogleProductReviewsController` plus a builder view (schema v2.4), cached 1 h.
- Every published review with text, flagged with `is_verified_purchase`, `is_incentivized_review` and `collection_method`.
- `review_url` is `#{SITE_URL}/#{slug}#review-#{id}`.
- Validate the output against the XSD in tests (`test/fixtures/files/product_reviews.xsd`).
- Submit in Merchant Center at ≥ 50 reviews.

## Phase 2 (separate plan when we get there)

- **Ask AI:** `pages/api/products/[slug]/ask.ts` (SSE streaming), cached product context, cited review ids, "Ask the community" fallback that creates a `ProductQuestion`, rate limits, question logging.
- **AI moderation assist:** classify pending items and suggest a reason; a human still decides.
- **More:** video reviews; "Can you help answer?" emails to verified buyers; drafted official answers; review import (CSV) for wholesale/partner reviews.

## Suggested sequencing

| Week | dna-admin | dna-frontend |
|---|---|---|
| 1 | M0.1–M0.3 | M0.4 |
| 2 | M1.1–M1.2, M2.1–M2.2 | M1.3–M1.5 |
| 3 | M3, M4.1–M4.2 | M2.3–M2.6 |
| 4 | M4.3–M4.4, M5.1 | M4.5, M5.2 |
| 5 | M6.1, M7.1, M8 | M6.2, M7.2–M7.3 |

Launch request emails at the end of week 4. That gives reviews about 2 weeks to accumulate before the AI summary (minimum 5 reviews per product) and the Google feed (minimum 50 total) have enough data.
