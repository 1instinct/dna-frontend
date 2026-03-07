# Beeper Storefront: Spree Data Plan & Glassmorphic Synthwave Overhaul

**Date**: 2026-02-27
**Status**: Approved

---

## Context

Beeper is launching the Beeper Delta-8 — a BLE MIDI controller with 8x FSR trigger pads, 2x capacitive-touch sliders, and an AMOLED heads-up display. Pre-ordering now, ships Fall 2026, two colorways (Black / White).

The existing Next.js 13 storefront (Beeper-Frontend) connects to a Spree 4.2 backend. It needs:

1. A complete Spree data plan seeded via Admin API scripts
2. A frontend overhaul to match BeeperNative's glassmorphic synthwave aesthetic
3. Two browse modes: physical products (Shop) vs digital products (Marketplace)
4. A dynamic homepage driven by Spree API data

### Technical Constraints

- Next.js 13.1.1 — Pages Router — **do not upgrade**
- `@spree/storefront-api-v2-sdk` 4.5.1003 (local tarball) — **do not upgrade**
- React 18.2.0 — **do not upgrade**
- Tailwind CSS 3.4.0 — extend, don't replace
- Framer Motion available for animations
- Radix UI for headless components
- Existing fonts: IBM Plex Mono, Anybody

---

## Part 1: Spree 4.2.5 Data Plan

### Taxonomies & Taxons

Three top-level taxonomies. The first two drive the dual browse modes; the third supports homepage curation and promotions.

```
Taxonomy: Shop
├── Devices
├── Accessories
└── Apparel

Taxonomy: Marketplace
├── Sample Packs
├── Synths
└── Visualizers

Taxonomy: Collections
├── Featured
├── New Arrivals
├── Pre-Order
└── Bundles
```

### Option Types & Option Values

```
Option Type: color
├── Black
└── White

Option Type: size
├── S
├── M
├── L
├── XL
└── XXL
```

Assignment: `color` → Beeper Delta-8. `size` → Beeper T-Shirt.

### Product Properties

| Property Key    | Display Name   | Used By      | Example Value          |
| --------------- | -------------- | ------------ | ---------------------- |
| `shipping_type` | Shipping Type  | All products | `physical` / `digital` |
| `preorder`      | Pre-Order      | Devices      | `true`                 |
| `ships_date`    | Ships          | Devices      | `Fall 2026`            |
| `connectivity`  | Connectivity   | Devices      | `BLE MIDI`             |
| `compatibility` | Compatibility  | Digital, App | `iOS 16+`              |
| `format`        | Format         | Sample Packs | `WAV / MIDI`           |
| `file_count`    | Files Included | Sample Packs | `64 samples`           |
| `polyphony`     | Polyphony      | Synths       | `8 voices`             |

### Products & Variants

#### Physical Products

| Product              | Slug                   | Option Type | Variants (SKUs)  | Price   | Taxons                                                          |
| -------------------- | ---------------------- | ----------- | ---------------- | ------- | --------------------------------------------------------------- |
| Beeper Delta-8       | `beeper-delta-8`       | `color`     | Black, White     | $199.99 | Shop > Devices, Collections > Featured, Collections > Pre-Order |
| Beeper Carrying Case | `beeper-carrying-case` | —           | 1 master variant | $29.99  | Shop > Accessories                                              |
| USB-C Cable          | `usb-c-cable`          | —           | 1 master variant | $14.99  | Shop > Accessories                                              |
| Beeper T-Shirt       | `beeper-tshirt`        | `size`      | S, M, L, XL, XXL | $34.99  | Shop > Apparel                                                  |

#### Digital Products

| Product              | Slug                   | Variants         | Price | Taxons                                             |
| -------------------- | ---------------------- | ---------------- | ----- | -------------------------------------------------- |
| Beeper iOS App       | `beeper-ios-app`       | 1 master variant | $4.99 | Marketplace > Synths                               |
| Starter Sample Pack  | `starter-sample-pack`  | 1 master variant | $9.99 | Marketplace > Sample Packs, Collections > Featured |
| Analog Dreams Synth  | `analog-dreams-synth`  | 1 master variant | $6.99 | Marketplace > Synths                               |
| Neon Grid Visualizer | `neon-grid-visualizer` | 1 master variant | $3.99 | Marketplace > Visualizers                          |

All prices are placeholders — to be updated before launch.

### Promotions

| Name                  | Rule                         | Action                   |
| --------------------- | ---------------------------- | ------------------------ |
| Pre-Order 10% Off     | Cart contains Beeper Delta-8 | 10% line item discount   |
| Bundle: Device + Case | Cart has both Delta-8 + Case | $10 off order total      |
| Launch Free Shipping  | Order total > $150           | Free shipping adjustment |

### Seed Script

A Node.js script (`scripts/seed-spree.ts`) will use the Spree Admin API (V2, `/api/v2/platform/`) to create all of the above in order:

1. Taxonomies & taxons
2. Option types & option values
3. Properties
4. Products (with taxon assignments, property values)
5. Variants (with option value assignments, pricing, SKU codes)
6. Promotions (with rules and actions)

The script will be idempotent — check for existing records by slug/name before creating.

---

## Part 2: Frontend Overhaul — Glassmorphic Synthwave

### Aesthetic Direction

Dark mode only. Mirrors the BeeperNative app's vaporwave/synthwave aesthetic: deep dark backgrounds, glass panels with blur, neon accent glows, monospace typography, LED-style indicators.

### Color Tokens

Extend Tailwind config with new color groups:

```
neon-cyan:      #00FFFF     — primary accent, links, CTAs, Shop mode
neon-magenta:   #FF00FF     — secondary accent, Marketplace mode
neon-pink:      #FF1493     — hot accents, sale badges
neon-lime:      #39FF14     — success states, in-stock indicators
neon-amber:     #FF6600     — warnings, pre-order badges

bg-deep:        #0A0020     — page gradient top
bg-void:        #000000     — page gradient bottom

glass-bg:       rgba(255, 255, 255, 0.05)   — panel fill
glass-border:   rgba(255, 255, 255, 0.10)   — panel stroke
glass-highlight: rgba(255, 255, 255, 0.15)  — hover state
```

### Typography

- **Headings / Accents**: PressStart2P (pixel/retro, matches native app) — add via Google Fonts
- **Body / UI**: IBM Plex Mono (already loaded) — monospace reinforces the tech aesthetic
- **Fallback body**: Anybody (already loaded) for longer prose sections

### Glass Panel Pattern

Reusable CSS utility class applied to all cards, panels, modals:

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

### Neon Glow Text Pattern

```css
.neon-text-cyan {
  color: #00ffff;
  text-shadow: 0 0 7px #00ffff, 0 0 20px #00ffff, 0 0 42px #0077ff;
}
```

Variants for magenta, pink, lime, amber.

### Page Backgrounds

Replace all flat `#000` backgrounds with a radial/linear gradient:

```css
background: linear-gradient(180deg, #0a0020 0%, #000000 100%);
```

Optional: faint scanline overlay at 2% opacity for CRT effect.

---

### LogoBlob — Match BeeperNative Style

Update `components/LogoBlob/` and `components/Logo/AnimatedLogo.tsx` to match the native app:

| Aspect         | Current Frontend                   | Target (Native)                                                 |
| -------------- | ---------------------------------- | --------------------------------------------------------------- |
| Blob fill      | Animated peach/mint/lavender cycle | Solid purple `#7c3aed`                                          |
| Blob stroke    | Hot pink (matches)                 | Hot pink `#ff008a`                                              |
| Blob animation | 2800ms SVG filter turbulence       | 16000ms path interpolation morph between 4 shapes               |
| Glow           | Single Gaussian blur               | 10 graduated blur/shadow layers (radius 70→30, opacity 0.3→0.7) |
| Breathing      | None                               | Scale 0.38→0.42, opacity 0.45→0.6 on 4s loop                    |
| Letter fill    | Solid gold `#E9C86F`               | Yellow→orange gradient `#fffb00`→`#ffb300`                      |
| Letter details | Minimal strokes                    | Full interior detail paths + circles                            |
| Letter timing  | Fixed 2000ms, 100-200ms stagger    | Variable 3600-4600ms, 0-900ms stagger per letter                |
| Tagline        | Optional, not shown                | "Play With Music" — IBM Plex Medium, white, uppercase, 12px     |

Implementation: Replace SVG filter-based animation with `react-spring` path interpolation. Add CSS `box-shadow` stack for graduated glow layers. Use SVG `<linearGradient>` for letter fills.

---

### Homepage (`/home`)

Sections top to bottom, all data-driven from Spree API:

0. **LogoBlob Hero** — Updated morphing blob with floating "BEEPER" letters at top of page, centered, with purple glow radiating outward on the dark gradient background. "Play With Music" tagline below.

1. **Hero Section**

   - Full-width gradient background with radial neon glow behind product image
   - Beeper Delta-8 hero image (centered, floating)
   - "BEEPER Delta-8" in PressStart2P with magenta neon glow
   - "PRE-ORDER NOW — SHIPS FALL '26" subtitle
   - Glass CTA button with neon cyan border + pulse animation
   - Data: Product from `Collections > Featured` taxon, filtered to `beeper-delta-8`

2. **Featured Products Strip**

   - Horizontal scroll of 4-6 glass product cards
   - Each card: image, name, price, neon accent on hover
   - Data: Products from `Collections > Featured` taxon

3. **Shop / Marketplace Split**

   - Two large glass panels side by side (stack on mobile)
   - Left: "SHOP" with cyan neon accent, device/accessory imagery
   - Right: "MARKETPLACE" with magenta neon accent, waveform/synth imagery
   - Each links to `/browse?mode=shop` or `/browse?mode=marketplace`
   - Hover: glow intensifies, subtle scale

4. **Device Specs Grid**

   - 4 glass pills in a 2x2 grid (4-col on desktop)
   - "8x FSR PADS" / "2x CAP-TOUCH SLIDERS" / "AMOLED HUD" / "BLE MIDI"
   - Each with an icon and PressStart2P label
   - Data: Static or from product properties

5. **Newsletter CTA**
   - Glass panel, full-width
   - Email input with neon focus ring
   - Submit button with neon glow
   - Integrates with existing Mailchimp/GoHighLevel setup

### Browse Page (`/browse`)

Single page component with a `mode` query param that switches between two presentations:

#### Shared Elements

- **Mode toggle**: Two glass tab buttons at top — "SHOP" (cyan) / "MARKETPLACE" (magenta). Active tab has neon fill + glow, inactive is dim.
- **Search**: Glass input with neon focus ring
- **Sort dropdown**: Glass select via Radix UI
- **URL state**: `?mode=shop|marketplace&category=devices&sort=newest&q=...`

#### Shop Mode (`?mode=shop`)

- Filter chips: Devices, Accessories, Apparel (from Shop taxonomy taxons)
- Product grid: 2 cols mobile, 3 tablet, 4 desktop
- Glass card per product:
  - Product image on dark bg
  - Name (IBM Plex Mono)
  - Price (neon cyan)
  - Color swatches if applicable
  - "PRE-ORDER" neon amber badge if `preorder` property is true
  - Hover: translateY(-4px), border glow intensifies

#### Marketplace Mode (`?mode=marketplace`)

- Filter chips: Sample Packs, Synths, Visualizers (from Marketplace taxonomy taxons)
- Product grid: wider/landscape cards, 1-2 cols mobile, 2-3 desktop
- Glass card per product:
  - Artwork/waveform thumbnail
  - Name + type badge (neon-tinted)
  - Price badge
  - Format/file count metadata line
  - Hover: glow + scale

### Product Detail (`/[productSlug]`)

- **Hero**: Large product image with radial neon glow backdrop
- **Info Panel** (glass panel):
  - Product name in PressStart2P
  - Price in neon cyan, large
  - Pre-order badge (neon amber) if applicable
  - Variant selector: color swatches or size pills with neon active state
  - "ADD TO CART" glass button with neon border, hover pulse
  - Quantity selector
- **Specs Table** (glass panel):
  - Product properties rendered as monospace key-value rows
  - Shipping type, connectivity, compatibility, etc.
- **Related Products**: Horizontal scroll of glass cards from same taxon

### Cart, Checkout, Auth Pages

- Apply glass panel treatment to all containers
- Neon focus rings on all inputs
- Neon accent buttons replacing current coral/pink brand buttons
- Dark gradient backgrounds
- Keep existing logic and Stripe integration unchanged

### Navigation

- **Header**: Glass panel with backdrop blur, logo, nav links, cart icon with neon badge count
- **Mobile menu**: Dark glass overlay with neon-accented links
- **Footer**: Glass panel, neon accent dividers

---

## New Files

| File                           | Purpose                                          |
| ------------------------------ | ------------------------------------------------ |
| `scripts/seed-spree.ts`        | Idempotent Spree Admin API seed script           |
| `scripts/seed-spree.config.ts` | Seed data definitions (products, taxons, etc.)   |
| `styles/synthwave.css`         | Glass panel, neon glow, scanline utility classes |

## Modified Files

| File                                      | Changes                                   |
| ----------------------------------------- | ----------------------------------------- |
| `tailwind.config.ts`                      | Add neon/glass/bg color tokens            |
| `styles/globals.css`                      | Dark gradient body bg, neon CSS variables |
| `styles/fonts.css`                        | Add PressStart2P font-face                |
| `pages/home.tsx`                          | Redesigned homepage sections              |
| `pages/browse.tsx`                        | Dual-mode browse with mode toggle         |
| `pages/[productSlug].tsx`                 | Glassmorphic product detail               |
| `pages/cart.tsx`                          | Glass treatment                           |
| `pages/checkout.tsx`                      | Glass treatment                           |
| `components/Home/*`                       | Redesigned homepage components            |
| `components/Browse/Browse.tsx`            | Mode-aware filtering, glass cards         |
| `components/ProductCard/ProductCard.tsx`  | Glass card with neon accents              |
| `components/ProductList/ProductList.tsx`  | Dual card layouts                         |
| `components/ProductDetails/*`             | Neon variant selectors, glass panels      |
| `components/LogoBlob/LogoBlob.tsx`        | Match native: purple blob, graduated glow |
| `components/LogoBlob/LogoBlob.styles.tsx` | Updated glow/shadow styling               |
| `components/Logo/AnimatedLogo.tsx`        | Gradient letters, detail strokes, timing  |
| `components/Header/Header.tsx`            | Glass nav bar                             |
| `components/Cart/Cart.tsx`                | Glass treatment                           |
| `components/Checkout/Checkout.tsx`        | Glass treatment                           |
| `components/ui/*`                         | Neon-themed Radix primitives              |

---

## Implementation Order

1. **Spree seed script** — get data into the backend first
2. **Tailwind tokens + global styles** — foundation for all UI work
3. **Glass panel + neon utilities** — reusable CSS
4. **Homepage redesign** — hero, featured, split entry
5. **Browse page dual-mode** — shop + marketplace with taxonomy filtering
6. **Product detail** — glass treatment, variant selectors
7. **Cart/checkout/auth** — apply glass theme
8. **Header/footer/navigation** — glass nav bar
