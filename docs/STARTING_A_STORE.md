# Starting a new store from DNA

DNA (`1instinct/dna-admin` + `1instinct/dna-frontend`) is the shared boilerplate. Each store (Beeper, …)
is its own pair of repos that **tracks DNA as `upstream`**, so fixes and features made in DNA can be
merged in later. Beeper works this way today.

Don't use GitHub's "Use this template" for this: a template copy starts with fresh history and no link
back to DNA, so later DNA changes can't be merged, only copied by hand.

## 1. Create the store's repos with DNA's history

Do this once per repo (`dna-admin` → `<store>-admin`, `dna-frontend` → `<store>-frontend`):

```bash
# Create an empty repo on GitHub first (no README, no license), e.g. Acme/Acme-Admin.
git clone https://github.com/1instinct/dna-admin.git acme-admin
cd acme-admin
git remote rename origin upstream          # DNA
git remote add origin https://github.com/Acme/Acme-Admin.git
git push -u origin master                  # dna-frontend's default branch is main
```

## 2. Make it yours

Change these in the store's repo, not in DNA:

| Where | What |
|---|---|
| dna-admin `.env` / k8s secret (`secret.yml.example`) | `SITE_URL` (storefront), `ADMIN_URL` (this admin's public URL, used for email images), `SITE_TITLE`, `ALLOWED_ORIGINS`, Mailgun, AWS bucket |
| Admin › Configurations › Stores | Store name, URL, mail-from, **Mailer logo**, address, support email, Instagram/Facebook/X. All emails read these. |
| Admin › Appearance | Admin theme colors and logo |
| Admin › Reviews › Review settings | Turn reviews on, delays, points |
| dna-frontend `.env` | `NEXT_PUBLIC_SPREE_API_URL`, `NEXT_PUBLIC_SITE_TITLE`, `NEXT_PUBLIC_REVIEWS_ENABLED`, tracking IDs |
| dna-frontend `tailwind.config.ts`, `styles/globals.css` | Brand colors and fonts (`brand`, `secondary`, `font-title`, `font-body`). Review UI uses these tokens. |
| dna-frontend `components/shared/Logo`, `public/` | Logo and favicons |
| dna-admin `config/email_theme.yml`, `public/email/` | Email colors, fonts, background tiles (light and dark) and a default logo. Set `color_scheme: "dark"` for an always-dark brand. |

Keep store-only changes in their own commits, with clear messages. That keeps later merges from DNA easy.

## 3. Take DNA updates

```bash
git fetch upstream
git switch -c sync/dna-$(date +%Y%m%d)
git merge upstream/master                  # or a DNA feature branch
# resolve conflicts: keep the store's branding/config, take DNA's features and fixes
bin/rails db:migrate && bin/rails test     # admin
yarn install && yarn tsc --noEmit          # frontend
git push -u origin HEAD                    # open a PR into the store's main branch
```

If a store's storefront has drifted far from DNA (a full merge conflicts in most components), bring in a
DNA feature by copying its folders (for reviews: `components/Reviews`, `hooks/useReviews`,
`lib/reviews.ts`, `lib/api/dnaFetch.ts`, `types/reviews.ts`, `pages/review`, `pages/account/reviews.tsx`)
and wiring it into the store's pages. Do the full merge later.

## 4. Give fixes back

A fix that every store needs belongs in DNA: open the PR against `1instinct/dna-*`, then merge DNA into
the store as in step 3. Don't fix the same thing separately in each store.
