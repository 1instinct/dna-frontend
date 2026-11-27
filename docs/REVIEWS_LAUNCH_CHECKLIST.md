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
  - [ ] Leave **Store reviews**, **Questions** and **AI summary** off. Those milestones (M5–M7) aren't built yet.
- [ ] **Users › (account) › Roles**: give wholesale buyers the `wholesale` role. Their orders and reviews then count as wholesale, which retail product pages never show.

## 3. Storefront: environment

| Variable | Value | Why |
|---|---|---|
| `NEXT_PUBLIC_REVIEWS_ENABLED` | `true` | Shows stars, the reviews section, the review form, Account › Reviews and the `/review/<token>` page. Off means none of it renders and no review calls are made. |
| `NEXT_PUBLIC_SPREE_API_URL` | (existing) | Same admin API as now. |
| `NEXT_PUBLIC_SHORT_TITLE` | `Beeper` | Beeper only, optional. The store name in review copy ("Response from Beeper"). |

- [ ] dna-frontend's Docker image moved to Node 22. Check the first build, especially the `sharp` install.

## 4. Turn it on, in this order

1. [ ] Deploy the admin with section 1 done, and fill in the section 2 store details and questions.
2. [ ] Deploy the storefront with `NEXT_PUBLIC_REVIEWS_ENABLED=true`. Product pages show "No reviews yet" until reviews come in.
3. [ ] Tick **Reviews on** in Review settings.
4. [ ] Optional, to start with reviews already coming in: `bundle exec rake reviews:backfill[30]`. This emails customers whose orders shipped in the last 30 days, 200 an hour.
5. [ ] Watch **Reviews › Reviews** (the moderation queue) and **Reviews › Review emails** (the sent → opened → completed funnel).

## 5. Check it works

- [ ] Preview the emails in development: `/rails/mailers/review_request_mailer`.
- [ ] Place a test order, ship it in admin, then run `rake reviews:dispatch`.
  - The email goes out once the delay has passed. To test sooner, set the delay to 0 temporarily.
- [ ] Tap a star in the email. `/review/<token>` should open with that rating picked. Submit it, then check:
  - the review appears on the product page;
  - the customer's points went up;
  - the request shows as completed in Review emails.

## Later milestones will add

- M5 store reviews: turn on **Store reviews**.
- M6 Q&A: turn on **Questions**.
- M7 AI summaries: needs `ANTHROPIC_API_KEY` and `INTERNAL_CRON_SECRET` on the storefront, and **AI summary** turned on.
- M8 Google review feed: submit the feed URL in Merchant Center once you have 50+ reviews.
