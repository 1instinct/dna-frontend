# Beeper Platform Evolution — Design Doc

**Date**: 2026-03-08
**Status**: Approved
**Scope**: LogoBlob animation, scroll/perf fixes, simplified onboarding, creator marketplace profiles, admin strategy

---

## Phase 1: Fix What's Broken

### 1a. LogoBlob Animation

**Problem**: 16s morph cycle feels sluggish. Only 4 shapes with gentle curves. Magenta glow too muted (0.25-0.3 opacity). feTurbulence SVG filter is GPU-expensive.

**Changes**:

- Speed: 16s → **7s** cycle
- Shapes: 4 → **8 unique SVG blob paths** — wilder asymmetry, spiky tendrils, deep concavities, amoeba-like forms
- Shape sequencing: randomize morph target each cycle instead of sequential loop
- Border glow: brighten to **0.6-0.7 opacity**, add **neon-cyan accent** layered with existing magenta
- Remove `feTurbulence` + `feDisplacementMap` SVG filter entirely — replace with CSS `filter: blur(3px)` on stroke for similar hazy edge at fraction of GPU cost

### 1b. Scroll Jank

**Problem**: Page scrolling gets stuck, feels like nested scroll containers.

**Root cause**: `overflow-x: hidden` on html/body + `overflow-x: clip` on `#__next` creates implicit scroll containment. Combined with heavy SVG filters and fixed video background, the compositor gets confused about scroll layers.

**Fix**:

- Remove `overflow-x: clip` from `#__next` in `globals.css` → replace with `overflow-x: hidden`
- Add `will-change: transform` to fixed video background div in `DynamicHome.tsx`
- Remove feTurbulence SVG filter from LogoBlob (covered in 1a)
- Add `contain: layout style paint` to heavy animation containers

### 1c. Homepage Performance

**Problem**: DynamicHome fetches product data client-side via `useProductFeed` on every mount. Every route change back to `/` re-fetches, causing slow loads.

**Fix**:

- Add `getStaticProps` to `pages/home.tsx` with **ISR revalidation (60s)**
- Fetch "latest products" feed server-side, pass as props
- `DynamicHome` uses pre-fetched data as `initialData` for React Query hook (instant render, background revalidation)
- Set `staleTime: 5 * 60 * 1000` on product feed queries to avoid refetching on route changes

**Files**: `pages/home.tsx`, `components/Home/DynamicHome.tsx`, `hooks/useProductFeed/useProductFeed.ts`

---

## Phase 2: Simplified Onboarding

### 2a. New Signup Flow (single screen)

**Current**: 6-step wizard (Welcome → PersonalInfo → DOB → Address → Income → Account). Spree ignores everything except email/password/password_confirmation.

**New**: Single screen with:

- Email input
- Password input (with strength indicator)
- Password confirmation
- Terms acceptance (single combined checkbox)
- "Create Account" button

No wizard. No steps. No TipBot on signup. Clean auth form.

After successful account creation → auto-login → redirect to `/account/profile` with welcome state.

### 2b. Post-Login Profile Form (`/account/profile`)

Guided but **non-blocking** profile page. Users can skip and return later.

**Basic Info** (encouraged, optional):

- Display name / username (becomes vanity URL slug)
- Avatar upload
- First name, Last name
- Bio (short text)

**Shipping** (optional until checkout):

- Address (Google Places autocomplete)
- Unit number

**Creator Section** (collapsed, "Become a Creator" toggle):

- Artist/brand name
- Genre tags (multi-select: predefined + custom)
- Social links
- Public profile toggle

**Removed entirely**: DOB, yearly income — never used by Spree, pure friction.

### 2c. Data Flow

- Basic profile fields → Spree `account.update()` API (first_name, last_name already supported)
- Username/slug → requires `spree_creator_profiles` extension (Phase 3)
- Avatar → upload to asset storage (S3/CDN), save URL to profile
- Creator fields → `spree_creator_profiles` extension (Phase 3)

**Interim** (before Phase 3): Store basic fields via Spree's existing `account.update()`. Creator section disabled in UI until backend supports it.

### 2d. Vanity URL Routing

Rename `pages/[productSlug].tsx` → `pages/[slug].tsx` as a resolver:

```
getServerSideProps:
  1. Try fetch product by slug → render ProductDetails
  2. Try fetch creator profile by username → render CreatorProfile
  3. 404
```

Reserved slugs (cart, checkout, login, signup, account, browse, about, terms, privacy, etc.) keep dedicated page files — Next.js file-based routing gives them priority over the catch-all `[slug].tsx`.

---

## Phase 3: Creator Profiles + Admin Strategy

### 3a. Spree Extension: `spree_creator_profiles`

Rails engine gem extending Spree's user model. Built in beeper-admin first.

**Schema** (`creator_profiles` table):

| Column             | Type     | Notes                                     |
| ------------------ | -------- | ----------------------------------------- |
| id                 | bigint   | PK                                        |
| user_id            | bigint   | FK → spree_users, unique                  |
| username           | string   | Unique, indexed, vanity URL slug          |
| display_name       | string   | Public-facing name                        |
| avatar_url         | string   | S3/CDN path                               |
| bio                | text     | Short bio                                 |
| genre_tags         | jsonb    | Array of genre strings                    |
| social_links       | jsonb    | `{ instagram, twitter, soundcloud, ... }` |
| is_public          | boolean  | Default false                             |
| is_creator         | boolean  | Default false                             |
| creator_type       | string   | producer, dj, visualist, multi            |
| sample_packs_count | integer  | Counter cache                             |
| presets_count      | integer  | Counter cache                             |
| visualizers_count  | integer  | Counter cache                             |
| created_at         | datetime |                                           |
| updated_at         | datetime |                                           |

**Digital content tables** (schema now, implementation as needed):

- `creator_sample_packs` — id, creator_profile_id, title, description, file_url, price, preview_url, download_count
- `creator_presets` — id, creator_profile_id, title, description, file_url, price, compatible_devices (jsonb)
- `creator_visualizers` — id, creator_profile_id, title, description, file_url, preview_url, price

Digital content links to Spree products via `spree_product_id` column — purchases use existing cart/checkout flow.

**API endpoints** (mounted under `/api/v1/creator_profiles`):

- `GET /api/v1/creator_profiles/:username` — public profile (no auth)
- `GET /api/v1/creator_profiles` — browse creators (filterable by genre, type)
- `PUT /api/v1/creator_profile` — update own profile (auth required)
- `POST /api/v1/creator_profile/avatar` — upload avatar (auth required)

### 3b. Admin Strategy

**Approach**: Build in beeper-admin → extract gem → offer upstream to dna-admin.

**Rationale**:

- Beeper has specific marketplace needs (creator types, genre tags, digital content)
- Building in beeper-admin allows fast iteration without coordination overhead
- Once stable, extract as `spree_creator_profiles` gem
- dna-admin adds it as optional dependency — "on-demand addon" pattern

**Addon architecture** for future Spree mods:

- Each addon is a self-contained Rails engine gem
- Own migrations, models, API endpoints, admin UI components
- Installed via Gemfile: `gem 'spree_creator_profiles'`
- Registered via initializer
- Pattern reusable for: loyalty points, subscriptions, live commerce, etc.

### 3c. Public Creator Profile Page

`pages/[slug].tsx` renders `<CreatorProfile>` when slug matches a username:

- Hero banner: avatar, display name, bio, genre tags
- Tabs: **Sample Packs** | **Presets** | **Visualizers** | **Products**
- Each tab: grid of purchasable items (links into existing product/checkout)
- Social links row
- "Follow" button (future, stubbed)

Uses `getServerSideProps` for profile data, client-side React Query for content tabs.

---

## Phasing Summary

| Phase | Scope                                        | Dependencies         | Deploys To              |
| ----- | -------------------------------------------- | -------------------- | ----------------------- |
| 1     | LogoBlob, scroll, homepage perf              | None                 | Heroku + K8s            |
| 2     | Simplified signup, profile page, vanity URLs | Phase 1 (optional)   | Heroku + K8s            |
| 3     | Spree extension, admin, public profiles      | Phase 2 profile page | beeper-admin + frontend |

Phase 1 and 2 are frontend-only (except Phase 2's interim profile uses existing Spree API). Phase 3 requires backend work in beeper-admin.
