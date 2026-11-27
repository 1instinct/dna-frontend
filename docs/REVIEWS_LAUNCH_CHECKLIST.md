# Reviews launch checklist

Everything ships switched off. Work down this list once per store (DNA, Beeper, …). Kept in all
four repos: `dna-admin`, `dna-frontend`, `Beeper-Admin`, `Beeper-Frontend` (`docs/`).

## 1. Admin app: deploy and environment

| Variable | Example | Why |
|---|---|---|
| `ADMIN_URL` | `https://admin.beeper.buzz` | This admin's public address (with https). Email images, the store logo, the email background and review photo URLs use it. Without it, emails go out with no images. |
| `SITE_URL` | `https://beeper.buzz` | The storefront. Review email links go to `$SITE_URL/review/<token>`. |
| `ALLOWED_ORIGINS` | `https://beeper.buzz,https://www.beeper.buzz` | CORS for storefronts that call the admin from the browser. Beeper proxies `/api/v1` through its own domain, so it only needs this for other clients. |
| `MAILGUN_HOST` / `_PORT` / `_USER` / `_PASS` | (existing) | Review emails send through the existing mail setup. |
| `MODERATION_EMAIL` | `moderation@beeper.buzz` | Optional. Gets an email when a customer reports a review. |
| `INTERNAL_CRON_SECRET` | a long random string (`openssl rand -hex 32`) | AI summaries (M7). The hourly task sends it when it asks the storefront to write summaries. It must match the storefront's value. |

Then:

- [ ] Run migrations (`bundle exec rails db:migrate`). On Heroku the release phase does it.
- [ ] Schedule the email task **hourly**: `bundle exec rake reviews:dispatch`.
  - Heroku: Scheduler add-on, "Every hour".
  - Kubernetes: apply `k8-cronjob-reviews.yml`.
  - It's safe to run twice. It sends nothing while reviews are off in admin.

## 2. Admin settings (in the admin UI)

- [ ] **Configurations › Stores › (your store)**: fill in the following. Every email reads them.
  - Name and mail-from address.
  - **Mailer logo**: a PNG on a transparent background. Beeper's emails put it on a dark badge, DNA's on a white one.
  - Address, customer support email, and Instagram/Facebook/X handles. These go in the email footer.
- [ ] **Reviews › Review questions**: add the questions you want, then assign them to categories (none = every product). Examples:
  - Fit: two-ended, "Runs small" ↔ "Runs large", for clothing.
  - Quality: 1–5 scale.
  - Sound: 1–5 scale, for Beeper devices.
- [ ] **Reviews › Review settings**:
  - [ ] **Reviews on**: tick it. This is the master switch.
  - [ ] Auto-publish: on (default). Reviews with links, contact details or blocked words still wait for a person.
  - [ ] Photos need approval: on (default) or off.
  - [ ] Email timing: 7 days after shipping, 10 for international, a reminder 7 days later, links valid 60 days (defaults).
  - [ ] Points: 50 per review, +50 with a photo (defaults). Points are the same whatever the rating.
  - [ ] **Store reviews** (M5): tick it to add the "How was shopping with us?" step to review emails, the `/reviews` page and the footer badge.
  - [ ] **Questions** (M6): tick it to add the Questions tab on product pages. Answer questions in **Reviews › Questions**. The customer is emailed when you answer.
  - [ ] **AI summary** (M7): tick it once section 3's AI variables are set. Summaries start appearing within an hour on products with 5+ written reviews (the "Minimum reviews" setting).
- [ ] **Reviews › Review questions**: for store reviews, add questions with "Applies to: Store", for example Delivery and Packaging.
- [ ] **Users**: create a service user for AI summaries (for example `ai-summaries@yourstore`) with the **admin** role. Press **Generate API key** on its user page and put the key in the storefront's `DNA_ADMIN_SERVICE_TOKEN`. Treat it like a password.
- [ ] **Users › (account) › Roles**: give wholesale buyers the `wholesale` role. Their orders and reviews then count as wholesale, which retail product pages never show.

## 3. Storefront: environment

| Variable | Value | Why |
|---|---|---|
| `NEXT_PUBLIC_REVIEWS_ENABLED` | `true` | Shows stars, the reviews section, the review form, Account › Reviews and the `/review/<token>` page. Off means none of it renders and no review calls are made. |
| `NEXT_PUBLIC_SPREE_API_URL` | (existing) | Same admin API as now. |
| `NEXT_PUBLIC_SHORT_TITLE` | `Beeper` | Beeper only, optional. The store name in review copy ("Response from Beeper"). |
| `ANTHROPIC_API_KEY` | `sk-ant-…` | AI summaries (M7). Server-only. Never prefix it with `NEXT_PUBLIC_`. |
| `INTERNAL_CRON_SECRET` | same value as the admin's | Protects `/api/internal/reviews/summarize`. |
| `DNA_ADMIN_SERVICE_TOKEN` | the service user's API key | Lets the summarizer read reviews from the admin and save summaries. Server-only. |
| `SPREE_API_URL` | `https://admin.beeper.buzz` | Beeper only, recommended. The admin's direct address for server-side calls, including the summarizer. If it isn't set, `NEXT_PUBLIC_SPREE_API_URL` is used. |

- [ ] dna-frontend's Docker image moved to Node 22. Check the first build, especially the `sharp` install.

## 4. Turn it on, in this order

1. [ ] Deploy the admin with section 1 done, and fill in the section 2 store details and questions.
2. [ ] Deploy the storefront with `NEXT_PUBLIC_REVIEWS_ENABLED=true`. Product pages show "No reviews yet" until reviews come in.
3. [ ] Tick **Reviews on** in Review settings.
4. [ ] Optional, to start with reviews already coming in: `bundle exec rake reviews:backfill[30]`. This emails customers whose orders shipped in the last 30 days, 200 an hour.
5. [ ] Watch **Reviews › Reviews** (the moderation queue) and **Reviews › Review emails** (the sent → opened → completed funnel).
6. [ ] Turn on **Store reviews** and **Questions** whenever you like. They don't depend on each other.
7. [ ] After about two weeks of reviews, set the AI variables and turn on **AI summary**. To try it on one product, go to **Products › (product) › Reviews › Regenerate**.
8. [ ] Once there are **50+ written retail reviews**, submit the feed in Google Merchant Center (**Growth › Manage programs › Product ratings**). The feed URL is `$ADMIN_URL/feeds/google/product_reviews.xml`.

## 5. Check it works

- [ ] Preview the emails in development: `/rails/mailers/review_request_mailer`.
- [ ] Place a test order, ship it in admin, then run `rake reviews:dispatch`.
  - The email goes out once the delay has passed. To test sooner, set the delay to 0 temporarily.
- [ ] Tap a star in the email. `/review/<token>` should open with that rating picked. Submit it, then check:
  - the review appears on the product page;
  - the customer's points went up;
  - the request shows as completed in Review emails.

- [ ] **Store reviews**: finish an email-link review. The store step should appear after the products, and the review should show on `/reviews` once published.
- [ ] **Questions**: ask a question on a product page, answer it in **Reviews › Questions**, then check the email arrives and the question shows on the product page.
- [ ] **AI summary**: press **Regenerate** on a product with 5+ written reviews. Within a minute or two, the summary card should appear on the product page.
- [ ] **Google feed**: open `$ADMIN_URL/feeds/google/product_reviews.xml`. It should list your written retail reviews.

## Coming in phase 2

- **Ask AI** on product pages, using the same `ANTHROPIC_API_KEY`.
