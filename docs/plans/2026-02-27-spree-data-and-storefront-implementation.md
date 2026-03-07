# Beeper Storefront: Spree Seed & Glassmorphic Synthwave Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Seed Spree 4.2 with Beeper product data and overhaul the Next.js storefront to a glassmorphic synthwave aesthetic with dual browse modes (Shop / Marketplace).

**Architecture:** Spree Admin API seed script creates all product data. Frontend extends Tailwind with synthwave tokens, adds reusable glass/neon CSS utilities, then rebuilds homepage + browse + product detail pages. Existing Spree SDK, React Query hooks, and Stripe checkout stay untouched.

**Tech Stack:** Next.js 13.1.1 (Pages Router), Tailwind CSS 3.4, Framer Motion, React Query 3, Spree Storefront API SDK, Radix UI, react-spring (existing)

---

## Task 1: Spree Seed Script — Config & Data Definitions

**Files:**

- Create: `scripts/seed-spree-config.ts`

**Step 1: Create the seed data config file**

This file defines all Beeper product data as typed constants. No API calls — just data.

```typescript
// scripts/seed-spree-config.ts

export const SPREE_API_URL =
  process.env.SPREE_ADMIN_API_URL || "https://admin.beeper.buzz";

export const taxonomies = [
  { name: "Shop" },
  { name: "Marketplace" },
  { name: "Collections" }
] as const;

export const taxons: Record<string, string[]> = {
  Shop: ["Devices", "Accessories", "Apparel"],
  Marketplace: ["Sample Packs", "Synths", "Visualizers"],
  Collections: ["Featured", "New Arrivals", "Pre-Order", "Bundles"]
};

export const optionTypes = [
  { name: "color", presentation: "Color", values: ["Black", "White"] },
  { name: "size", presentation: "Size", values: ["S", "M", "L", "XL", "XXL"] }
];

export const properties = [
  { name: "shipping_type", presentation: "Shipping Type" },
  { name: "preorder", presentation: "Pre-Order" },
  { name: "ships_date", presentation: "Ships" },
  { name: "connectivity", presentation: "Connectivity" },
  { name: "compatibility", presentation: "Compatibility" },
  { name: "format", presentation: "Format" },
  { name: "file_count", presentation: "Files Included" },
  { name: "polyphony", presentation: "Polyphony" }
];

export interface ProductDef {
  name: string;
  slug: string;
  description: string;
  price: string;
  sku: string;
  optionType?: string; // name of option type
  taxons: string[]; // "Taxonomy > Taxon" format
  properties: Record<string, string>;
  variants?: { optionValue: string; sku: string }[];
}

export const products: ProductDef[] = [
  // ── Physical Products ──
  {
    name: "Beeper Δ8",
    slug: "beeper-delta-8",
    description:
      "BLE MIDI controller with 8x FSR trigger pads, 2x capacitive-touch sliders, and AMOLED heads-up display. Pre-order now — ships Fall 2026.",
    price: "199.99",
    sku: "BPR-D8",
    optionType: "color",
    taxons: [
      "Shop > Devices",
      "Collections > Featured",
      "Collections > Pre-Order"
    ],
    properties: {
      shipping_type: "physical",
      preorder: "true",
      ships_date: "Fall 2026",
      connectivity: "BLE MIDI"
    },
    variants: [
      { optionValue: "Black", sku: "BPR-D8-BLK" },
      { optionValue: "White", sku: "BPR-D8-WHT" }
    ]
  },
  {
    name: "Beeper Carrying Case",
    slug: "beeper-carrying-case",
    description: "Protective carrying case for Beeper Δ8.",
    price: "29.99",
    sku: "BPR-CASE",
    taxons: ["Shop > Accessories"],
    properties: { shipping_type: "physical" }
  },
  {
    name: "USB-C Cable",
    slug: "usb-c-cable",
    description: "High-quality braided USB-C cable for charging and data.",
    price: "14.99",
    sku: "BPR-USBC",
    taxons: ["Shop > Accessories"],
    properties: { shipping_type: "physical" }
  },
  {
    name: "Beeper T-Shirt",
    slug: "beeper-tshirt",
    description: "Premium cotton t-shirt with Beeper logo.",
    price: "34.99",
    sku: "BPR-TEE",
    optionType: "size",
    taxons: ["Shop > Apparel"],
    properties: { shipping_type: "physical" },
    variants: [
      { optionValue: "S", sku: "BPR-TEE-S" },
      { optionValue: "M", sku: "BPR-TEE-M" },
      { optionValue: "L", sku: "BPR-TEE-L" },
      { optionValue: "XL", sku: "BPR-TEE-XL" },
      { optionValue: "XXL", sku: "BPR-TEE-XXL" }
    ]
  },
  // ── Digital Products ──
  {
    name: "Beeper iOS App",
    slug: "beeper-ios-app",
    description:
      "The Beeper companion app for iOS. Synths, sample pads, visualizers, and BLE MIDI connectivity.",
    price: "4.99",
    sku: "BPR-APP-IOS",
    taxons: ["Marketplace > Synths"],
    properties: { shipping_type: "digital", compatibility: "iOS 16+" }
  },
  {
    name: "Starter Sample Pack",
    slug: "starter-sample-pack",
    description:
      "64 samples — drums, bass, leads, and FX. WAV and MIDI formats.",
    price: "9.99",
    sku: "BPR-SP-STARTER",
    taxons: ["Marketplace > Sample Packs", "Collections > Featured"],
    properties: {
      shipping_type: "digital",
      format: "WAV / MIDI",
      file_count: "64 samples",
      compatibility: "iOS 16+"
    }
  },
  {
    name: "Analog Dreams Synth",
    slug: "analog-dreams-synth",
    description: "Warm analog-modeled synthesizer with 8-voice polyphony.",
    price: "6.99",
    sku: "BPR-SY-ANALOG",
    taxons: ["Marketplace > Synths"],
    properties: {
      shipping_type: "digital",
      polyphony: "8 voices",
      compatibility: "iOS 16+"
    }
  },
  {
    name: "Neon Grid Visualizer",
    slug: "neon-grid-visualizer",
    description:
      "Retro vaporwave visualizer — perspective grid, sunset disc, neon horizon.",
    price: "3.99",
    sku: "BPR-VZ-NEONGRID",
    taxons: ["Marketplace > Visualizers"],
    properties: { shipping_type: "digital", compatibility: "iOS 16+" }
  }
];

export const promotions = [
  {
    name: "Pre-Order 10% Off",
    description: "10% off Beeper Δ8 pre-orders",
    code: "PREORDER10"
  },
  {
    name: "Bundle: Device + Case",
    description: "$10 off when you buy Beeper Δ8 and Carrying Case together",
    code: "BUNDLE10"
  },
  {
    name: "Launch Free Shipping",
    description: "Free shipping on orders over $150",
    code: null // auto-apply
  }
];
```

**Step 2: Commit**

```bash
git add scripts/seed-spree-config.ts
git commit -m "feat: add Spree seed data config with all Beeper products"
```

---

## Task 2: Spree Seed Script — API Client & Runner

**Files:**

- Create: `scripts/seed-spree.ts`

**Step 1: Write the seed script**

Uses `fetch` to call the Spree Platform API V2. Idempotent — checks for existing records before creating.

```typescript
// scripts/seed-spree.ts
//
// Usage:
//   SPREE_ADMIN_API_URL=https://admin.beeper.buzz \
//   SPREE_ADMIN_EMAIL=admin@beeper.buzz \
//   SPREE_ADMIN_PASSWORD=yourpassword \
//   npx tsx scripts/seed-spree.ts

import {
  SPREE_API_URL,
  taxonomies,
  taxons,
  optionTypes,
  properties,
  products,
  promotions,
  type ProductDef
} from "./seed-spree-config";

const API = SPREE_API_URL.replace(/\/+$/, "");
let TOKEN = "";

// ── Auth ──────────────────────────────────────────────────────────

async function authenticate(): Promise<string> {
  const email = process.env.SPREE_ADMIN_EMAIL;
  const password = process.env.SPREE_ADMIN_PASSWORD;
  if (!email || !password)
    throw new Error("Set SPREE_ADMIN_EMAIL and SPREE_ADMIN_PASSWORD");

  const res = await fetch(`${API}/spree_oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "password",
      username: email,
      password: password,
      scope: "admin"
    })
  });
  if (!res.ok)
    throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// ── Helpers ───────────────────────────────────────────────────────

async function apiGet(
  path: string,
  params?: Record<string, string>
): Promise<any> {
  const url = new URL(`${API}/api/v2/platform${path}`);
  if (params)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) return null;
  return res.json();
}

async function apiPost(path: string, body: Record<string, any>): Promise<any> {
  const res = await fetch(`${API}/api/v2/platform${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

// ── Seed Functions ────────────────────────────────────────────────

const idCache: Record<string, string> = {};

async function seedTaxonomies() {
  console.log("\n── Taxonomies ──");
  for (const t of taxonomies) {
    // Check if exists
    const existing = await apiGet("/taxonomies", { "filter[name]": t.name });
    if (existing?.data?.length > 0) {
      const id = existing.data[0].id;
      idCache[`taxonomy:${t.name}`] = id;
      // Store root taxon ID
      const rootTaxonId = existing.data[0].relationships?.root?.data?.id;
      if (rootTaxonId) idCache[`taxon:${t.name}`] = rootTaxonId;
      console.log(`  ✓ ${t.name} (exists, id=${id})`);
      continue;
    }
    const result = await apiPost("/taxonomies", { taxonomy: { name: t.name } });
    const id = result.data.id;
    idCache[`taxonomy:${t.name}`] = id;
    const rootTaxonId = result.data.relationships?.root?.data?.id;
    if (rootTaxonId) idCache[`taxon:${t.name}`] = rootTaxonId;
    console.log(`  + ${t.name} (created, id=${id})`);
  }
}

async function seedTaxons() {
  console.log("\n── Taxons ──");
  for (const [taxonomyName, children] of Object.entries(taxons)) {
    const taxonomyId = idCache[`taxonomy:${taxonomyName}`];
    const parentId = idCache[`taxon:${taxonomyName}`]; // root taxon
    if (!taxonomyId) {
      console.log(`  ✗ Taxonomy "${taxonomyName}" not found`);
      continue;
    }

    for (const name of children) {
      const existing = await apiGet("/taxons", { "filter[name]": name });
      const match = existing?.data?.find(
        (t: any) => t.relationships?.taxonomy?.data?.id === taxonomyId
      );
      if (match) {
        idCache[`taxon:${taxonomyName} > ${name}`] = match.id;
        console.log(`  ✓ ${taxonomyName} > ${name} (exists, id=${match.id})`);
        continue;
      }
      const result = await apiPost("/taxons", {
        taxon: { name, taxonomy_id: taxonomyId, parent_id: parentId }
      });
      idCache[`taxon:${taxonomyName} > ${name}`] = result.data.id;
      console.log(
        `  + ${taxonomyName} > ${name} (created, id=${result.data.id})`
      );
    }
  }
}

async function seedOptionTypes() {
  console.log("\n── Option Types ──");
  for (const ot of optionTypes) {
    const existing = await apiGet("/option_types", { "filter[name]": ot.name });
    if (existing?.data?.length > 0) {
      idCache[`option_type:${ot.name}`] = existing.data[0].id;
      console.log(`  ✓ ${ot.name} (exists, id=${existing.data[0].id})`);
      // Seed option values
      for (const val of ot.values) {
        const existingVals = await apiGet("/option_values", {
          "filter[name]": val.toLowerCase()
        });
        if (existingVals?.data?.length > 0) {
          idCache[`option_value:${ot.name}:${val}`] = existingVals.data[0].id;
          console.log(`    ✓ ${val} (exists)`);
          continue;
        }
        const result = await apiPost("/option_values", {
          option_value: {
            name: val.toLowerCase(),
            presentation: val,
            option_type_id: existing.data[0].id
          }
        });
        idCache[`option_value:${ot.name}:${val}`] = result.data.id;
        console.log(`    + ${val} (created)`);
      }
      continue;
    }
    const result = await apiPost("/option_types", {
      option_type: { name: ot.name, presentation: ot.presentation }
    });
    idCache[`option_type:${ot.name}`] = result.data.id;
    console.log(`  + ${ot.name} (created, id=${result.data.id})`);

    for (const val of ot.values) {
      const valResult = await apiPost("/option_values", {
        option_value: {
          name: val.toLowerCase(),
          presentation: val,
          option_type_id: result.data.id
        }
      });
      idCache[`option_value:${ot.name}:${val}`] = valResult.data.id;
      console.log(`    + ${val} (created)`);
    }
  }
}

async function seedProperties() {
  console.log("\n── Properties ──");
  for (const prop of properties) {
    const existing = await apiGet("/properties", { "filter[name]": prop.name });
    if (existing?.data?.length > 0) {
      idCache[`property:${prop.name}`] = existing.data[0].id;
      console.log(`  ✓ ${prop.name} (exists)`);
      continue;
    }
    const result = await apiPost("/properties", {
      property: { name: prop.name, presentation: prop.presentation }
    });
    idCache[`property:${prop.name}`] = result.data.id;
    console.log(`  + ${prop.name} (created)`);
  }
}

async function seedProducts() {
  console.log("\n── Products ──");
  for (const p of products) {
    // Check if product exists by slug
    const existing = await apiGet("/products", { "filter[slug]": p.slug });
    if (existing?.data?.length > 0) {
      idCache[`product:${p.slug}`] = existing.data[0].id;
      console.log(`  ✓ ${p.name} (exists, id=${existing.data[0].id})`);
      continue;
    }

    // Resolve taxon IDs
    const taxonIds = p.taxons.map((t) => idCache[`taxon:${t}`]).filter(Boolean);

    // Resolve option type IDs
    const optionTypeIds = p.optionType
      ? [idCache[`option_type:${p.optionType}`]].filter(Boolean)
      : [];

    // Build product payload
    const payload: Record<string, any> = {
      name: p.name,
      description: p.description,
      price: p.price,
      sku: p.sku,
      permalink: p.slug,
      available_on: new Date().toISOString(),
      taxon_ids: taxonIds,
      option_type_ids: optionTypeIds
      // Note: product_properties are set separately in Spree 4.2
    };

    const result = await apiPost("/products", { product: payload });
    const productId = result.data.id;
    idCache[`product:${p.slug}`] = productId;
    console.log(`  + ${p.name} (created, id=${productId})`);

    // Set product properties
    for (const [propName, propValue] of Object.entries(p.properties)) {
      const propertyId = idCache[`property:${propName}`];
      if (!propertyId) continue;
      try {
        await apiPost("/product_properties", {
          product_property: {
            product_id: productId,
            property_id: propertyId,
            value: propValue
          }
        });
        console.log(`    + property: ${propName}=${propValue}`);
      } catch (e: any) {
        console.log(`    ✗ property ${propName}: ${e.message}`);
      }
    }

    // Create variants if defined
    if (p.variants && p.optionType) {
      for (const v of p.variants) {
        const optionValueId =
          idCache[`option_value:${p.optionType}:${v.optionValue}`];
        if (!optionValueId) {
          console.log(
            `    ✗ variant ${v.sku}: option value "${v.optionValue}" not found`
          );
          continue;
        }
        try {
          await apiPost("/variants", {
            variant: {
              product_id: productId,
              sku: v.sku,
              price: p.price,
              option_value_ids: [optionValueId],
              track_inventory: false
            }
          });
          console.log(`    + variant: ${v.sku} (${v.optionValue})`);
        } catch (e: any) {
          console.log(`    ✗ variant ${v.sku}: ${e.message}`);
        }
      }
    }
  }
}

async function seedPromotions() {
  console.log("\n── Promotions ──");
  for (const promo of promotions) {
    const existing = await apiGet("/promotions", {
      "filter[name]": promo.name
    });
    if (existing?.data?.length > 0) {
      console.log(`  ✓ ${promo.name} (exists)`);
      continue;
    }
    const payload: Record<string, any> = {
      name: promo.name,
      description: promo.description
    };
    if (promo.code) payload.code = promo.code;
    try {
      await apiPost("/promotions", { promotion: payload });
      console.log(`  + ${promo.name} (created)`);
    } catch (e: any) {
      console.log(`  ✗ ${promo.name}: ${e.message}`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding Spree at ${API}...\n`);
  TOKEN = await authenticate();
  console.log("Authenticated ✓");

  await seedTaxonomies();
  await seedTaxons();
  await seedOptionTypes();
  await seedProperties();
  await seedProducts();
  await seedPromotions();

  console.log("\n✓ Seed complete!\n");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
```

**Step 2: Add tsx dev dependency for running TypeScript scripts**

Run: `cd /Users/smokey/Internal/Beeper/code/Beeper-Frontend && yarn add -D tsx`

**Step 3: Commit**

```bash
git add scripts/seed-spree.ts
git commit -m "feat: add idempotent Spree seed script for Beeper products"
```

**Step 4: Run the seed script**

```bash
SPREE_ADMIN_API_URL=https://admin.beeper.buzz \
SPREE_ADMIN_EMAIL=admin@beeper.buzz \
SPREE_ADMIN_PASSWORD=<password> \
npx tsx scripts/seed-spree.ts
```

Expected: All taxonomies, taxons, option types, properties, products, variants, and promotions created. Re-running should show all "exists" messages.

---

## Task 3: Tailwind Synthwave Tokens

**Files:**

- Modify: `tailwind.config.ts`

**Step 1: Add synthwave color tokens and font**

Add to `theme.extend.colors`:

```typescript
neon: {
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  pink: '#FF1493',
  lime: '#39FF14',
  amber: '#FF6600',
},
glass: {
  bg: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.10)',
  highlight: 'rgba(255, 255, 255, 0.15)',
},
synth: {
  deep: '#0A0020',
  void: '#000000',
  surface: '#0D0D1A',
},
```

Add to `theme.extend.fontFamily`:

```typescript
pixel: ['"Press Start 2P"', 'monospace'],
```

Add to `theme.extend.backgroundImage`:

```typescript
'synth-gradient': 'linear-gradient(180deg, #0A0020 0%, #000000 100%)',
```

Add to `theme.extend.boxShadow`:

```typescript
'neon-cyan': '0 0 7px #00FFFF, 0 0 20px #00FFFF, 0 0 42px #0077FF',
'neon-magenta': '0 0 7px #FF00FF, 0 0 20px #FF00FF, 0 0 42px #7700FF',
'neon-pink': '0 0 7px #FF1493, 0 0 20px #FF1493, 0 0 42px #FF0077',
'neon-lime': '0 0 7px #39FF14, 0 0 20px #39FF14, 0 0 42px #00FF77',
'neon-amber': '0 0 7px #FF6600, 0 0 20px #FF6600, 0 0 42px #FF3300',
'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
```

Add to `theme.extend.keyframes`:

```typescript
'neon-pulse': {
  '0%, 100%': { opacity: '1', boxShadow: '0 0 7px #00FFFF, 0 0 20px #00FFFF' },
  '50%': { opacity: '0.8', boxShadow: '0 0 14px #00FFFF, 0 0 40px #00FFFF, 0 0 60px #0077FF' },
},
```

Add to `theme.extend.animation`:

```typescript
'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
```

**Step 2: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: add synthwave neon/glass/synth tokens to Tailwind config"
```

---

## Task 4: Global Styles — Synthwave Foundation

**Files:**

- Modify: `styles/globals.css`
- Modify: `styles/fonts.css`
- Create: `styles/synthwave.css`

**Step 1: Add PressStart2P to fonts.css**

Append to end of `styles/fonts.css`:

```css
/* Press Start 2P — retro pixel font (Google Fonts) */
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
```

**Step 2: Create synthwave.css utility classes**

```css
/* styles/synthwave.css */

@layer components {
  /* Glass panel — frosted glass container */
  .glass-panel {
    @apply relative rounded-xl border border-glass-border bg-glass-bg shadow-glass;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .glass-panel-hover {
    @apply glass-panel transition-all duration-300;
  }
  .glass-panel-hover:hover {
    @apply border-glass-highlight bg-glass-highlight;
  }

  /* Neon text glow variants */
  .neon-text-cyan {
    color: #00ffff;
    text-shadow: 0 0 7px #00ffff, 0 0 20px #00ffff, 0 0 42px #0077ff;
  }
  .neon-text-magenta {
    color: #ff00ff;
    text-shadow: 0 0 7px #ff00ff, 0 0 20px #ff00ff, 0 0 42px #7700ff;
  }
  .neon-text-pink {
    color: #ff1493;
    text-shadow: 0 0 7px #ff1493, 0 0 20px #ff1493, 0 0 42px #ff0077;
  }
  .neon-text-lime {
    color: #39ff14;
    text-shadow: 0 0 7px #39ff14, 0 0 20px #39ff14, 0 0 42px #00ff77;
  }
  .neon-text-amber {
    color: #ff6600;
    text-shadow: 0 0 7px #ff6600, 0 0 20px #ff6600, 0 0 42px #ff3300;
  }

  /* Neon border glow (for buttons, badges) */
  .neon-border-cyan {
    @apply border border-neon-cyan shadow-neon-cyan;
  }
  .neon-border-magenta {
    @apply border border-neon-magenta shadow-neon-magenta;
  }

  /* Synthwave page background */
  .synth-bg {
    background: linear-gradient(180deg, #0a0020 0%, #000000 100%);
    min-height: 100vh;
  }

  /* Glass input */
  .glass-input {
    @apply rounded-lg border border-glass-border bg-synth-surface px-4 py-3 font-mono-bold text-sm text-white placeholder:text-white/30 transition-all duration-200;
  }
  .glass-input:focus {
    @apply outline-none border-neon-cyan ring-1 ring-neon-cyan/30;
  }

  /* Glass button */
  .glass-button {
    @apply glass-panel px-6 py-3 font-pixel text-xs uppercase tracking-wider text-neon-cyan transition-all duration-200 cursor-pointer;
  }
  .glass-button:hover {
    @apply bg-neon-cyan/10 shadow-neon-cyan;
  }

  /* Pre-order badge */
  .badge-preorder {
    @apply inline-block rounded-full px-3 py-1 font-pixel text-[8px] uppercase tracking-wider neon-text-amber border border-neon-amber/30;
  }

  /* Scanline overlay */
  .scanline-overlay {
    pointer-events: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 0, 255, 0.02) 2px,
      rgba(255, 0, 255, 0.02) 4px
    );
  }
}
```

**Step 3: Import synthwave.css in \_app.tsx**

Add this import after the existing style imports in `pages/_app.tsx`:

```typescript
import "../styles/synthwave.css";
```

**Step 4: Update dark mode CSS variables in globals.css**

Replace the `.dark` block in globals.css with synthwave-appropriate values:

```css
.dark {
  --background: 260 100% 4%; /* #0A0020 */
  --foreground: 0 0% 100%;
  --card: 240 20% 6%; /* dark surface */
  --card-foreground: 0 0% 100%;
  --popover: 240 20% 6%;
  --popover-foreground: 0 0% 100%;
  --primary: 180 100% 50%; /* neon cyan */
  --primary-foreground: 0 0% 0%;
  --secondary: 300 100% 50%; /* neon magenta */
  --secondary-foreground: 0 0% 100%;
  --muted: 240 10% 15%;
  --muted-foreground: 0 0% 60%;
  --accent: 180 100% 50%;
  --accent-foreground: 0 0% 0%;
  --destructive: 0 58% 53%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 10%;
  --input: 0 0% 10%;
  --ring: 180 100% 50%; /* neon cyan */
}
```

**Step 5: Force dark mode in \_app.tsx**

In `pages/_app.tsx`, add the `dark` class to the root div so synthwave theming applies:

Change:

```tsx
<div className="m-0 flex h-screen w-full flex-col overflow-visible bg-background p-0 font-body text-body-md text-foreground">
```

To:

```tsx
<div className="dark m-0 flex h-screen w-full flex-col overflow-visible bg-synth-gradient p-0 font-body text-body-md text-foreground">
```

**Step 6: Commit**

```bash
git add styles/fonts.css styles/synthwave.css styles/globals.css pages/_app.tsx
git commit -m "feat: add synthwave foundation — glass/neon CSS, PressStart2P font, dark mode"
```

---

## Task 5: Homepage Redesign

**Files:**

- Modify: `components/Home/StaticHome.tsx`
- Create: `components/Home/HeroSynthwave.tsx`
- Create: `components/Home/FeaturedStrip.tsx`
- Create: `components/Home/ShopMarketplaceSplit.tsx`
- Create: `components/Home/DeviceSpecs.tsx`

**Step 1: Create HeroSynthwave component**

```tsx
// components/Home/HeroSynthwave.tsx
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export const HeroSynthwave: React.FC = () => {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-6 py-24">
      {/* Radial glow behind product */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-neon-magenta/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <h1 className="font-pixel text-xl neon-text-magenta sm:text-3xl md:text-4xl">
          BEEPER Δ8
        </h1>
        <p className="mt-4 font-mono-bold text-sm uppercase tracking-[0.3em] text-white/60">
          PRE-ORDER NOW — SHIPS FALL &apos;26
        </p>
        <p className="mt-6 max-w-lg font-body text-sm text-white/40 sm:text-base">
          BLE MIDI controller with 8x FSR trigger pads, 2x capacitive-touch
          sliders, and AMOLED heads-up display.
        </p>
        <Link href="/beeper-delta-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-button mt-8 animate-neon-pulse"
          >
            PRE-ORDER $199.99
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
};
```

**Step 2: Create FeaturedStrip component**

```tsx
// components/Home/FeaturedStrip.tsx
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface FeaturedProduct {
  id: string;
  name: string;
  price: string;
  slug: string;
  imageUrl?: string;
}

interface FeaturedStripProps {
  products: FeaturedProduct[];
  title?: string;
}

export const FeaturedStrip: React.FC<FeaturedStripProps> = ({
  products,
  title = "FEATURED"
}) => {
  if (!products?.length) return null;

  return (
    <section className="section-container py-12">
      <h2 className="mb-8 font-pixel text-xs uppercase tracking-[0.2em] text-neon-cyan">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Link href={`/${product.slug}`}>
              <div className="glass-panel-hover group min-w-[220px] cursor-pointer p-4 sm:min-w-[260px]">
                <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-synth-surface">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/10">
                      <span className="font-pixel text-xs">IMG</span>
                    </div>
                  )}
                </div>
                <h3 className="font-mono-bold text-sm text-white">
                  {product.name}
                </h3>
                <p className="mt-1 font-mono-bold text-sm text-neon-cyan">
                  ${product.price}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
```

**Step 3: Create ShopMarketplaceSplit component**

```tsx
// components/Home/ShopMarketplaceSplit.tsx
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export const ShopMarketplaceSplit: React.FC = () => {
  return (
    <section className="section-container py-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link href="/browse?mode=shop">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="glass-panel group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center p-10 transition-all duration-300 hover:border-neon-cyan/30 hover:shadow-neon-cyan"
          >
            <h2 className="font-pixel text-lg neon-text-cyan sm:text-xl">
              SHOP
            </h2>
            <p className="mt-4 text-center font-mono-bold text-xs uppercase tracking-widest text-white/40">
              Devices · Accessories · Apparel
            </p>
          </motion.div>
        </Link>

        <Link href="/browse?mode=marketplace">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="glass-panel group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center p-10 transition-all duration-300 hover:border-neon-magenta/30 hover:shadow-neon-magenta"
          >
            <h2 className="font-pixel text-lg neon-text-magenta sm:text-xl">
              MARKETPLACE
            </h2>
            <p className="mt-4 text-center font-mono-bold text-xs uppercase tracking-widest text-white/40">
              Sample Packs · Synths · Visualizers
            </p>
          </motion.div>
        </Link>
      </div>
    </section>
  );
};
```

**Step 4: Create DeviceSpecs component**

```tsx
// components/Home/DeviceSpecs.tsx
import React from "react";
import { motion } from "framer-motion";

const specs = [
  { label: "8× FSR PADS", icon: "⬡" },
  { label: "2× CAP-TOUCH", icon: "⫼" },
  { label: "AMOLED HUD", icon: "◈" },
  { label: "BLE MIDI", icon: "⟡" }
];

export const DeviceSpecs: React.FC = () => {
  return (
    <section className="section-container py-12">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {specs.map((spec, i) => (
          <motion.div
            key={spec.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass-panel flex flex-col items-center justify-center p-6 text-center"
          >
            <span className="mb-3 text-2xl text-neon-cyan">{spec.icon}</span>
            <span className="font-pixel text-[8px] uppercase tracking-wider text-white/70 sm:text-[10px]">
              {spec.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
```

**Step 5: Rewrite StaticHome to use new components**

Replace `components/Home/StaticHome.tsx` contents with:

```tsx
import React from "react";
import { Layout } from "../Layout";
import { useProducts } from "../../hooks";
import { Loading } from "../Loading";
import { HeroSynthwave } from "./HeroSynthwave";
import { FeaturedStrip } from "./FeaturedStrip";
import { ShopMarketplaceSplit } from "./ShopMarketplaceSplit";
import { DeviceSpecs } from "./DeviceSpecs";
import { Newsletter } from "./Newsletter";

export const StaticHome = () => {
  const { data: productsData, isLoading } = useProducts(1);

  if (isLoading)
    return (
      <Layout>
        <Loading />
      </Layout>
    );

  // Extract featured products for the strip
  const featured = (productsData?.data || []).slice(0, 6).map((p: any) => ({
    id: p.id,
    name: p.attributes?.name || "",
    price: p.attributes?.price || "0.00",
    slug: p.attributes?.slug || "",
    imageUrl: p.attributes?.images?.[0]?.styles?.[2]?.url || null
  }));

  return (
    <Layout>
      <div className="synth-bg">
        <HeroSynthwave />
        <FeaturedStrip products={featured} />
        <ShopMarketplaceSplit />
        <DeviceSpecs />
        <div className="section-container pb-16">
          <Newsletter />
        </div>
      </div>
    </Layout>
  );
};
```

**Step 6: Update Home index to export correctly**

Read `components/Home/index.ts` and ensure it exports StaticHome as the default Home component.

**Step 7: Commit**

```bash
git add components/Home/HeroSynthwave.tsx components/Home/FeaturedStrip.tsx components/Home/ShopMarketplaceSplit.tsx components/Home/DeviceSpecs.tsx components/Home/StaticHome.tsx
git commit -m "feat: redesign homepage with synthwave hero, featured strip, shop/marketplace split"
```

---

## Task 6: Browse Page — Dual Mode

**Files:**

- Modify: `components/Browse/Browse.tsx`

**Step 1: Rewrite Browse component with mode toggle**

The key changes:

1. Add `mode` query param (`shop` | `marketplace`)
2. Mode toggle tabs at top with neon styling
3. Filter chips come from taxonomy taxon names
4. Glass panel styling for all containers
5. Two card layouts — portrait for shop, landscape for marketplace

This is a large component rewrite. The core filtering/sorting logic stays the same, but the UI is rebuilt with synthwave aesthetics and the mode toggle drives which taxonomy's taxons appear as filter chips.

Key structural changes to `Browse.tsx`:

- Add `mode` to URL state (`shop` default)
- Mode toggle: two glass tabs at top — "SHOP" (cyan active) / "MARKETPLACE" (magenta active)
- Category filter chips: filter `availableCategories` by Shop vs Marketplace taxonomy taxons
- Replace all `bg-card`, `border-border` classes with `glass-panel` utilities
- Replace `bg-brand` buttons with `glass-button` or neon-accented variants
- Replace `font-title` with `font-pixel` for headings
- Add `neon-text-cyan` for prices
- Add `.badge-preorder` for pre-order products
- Wrap page in `.synth-bg`

The full component is a rewrite of the existing `Browse.tsx` — the structure stays (filters sidebar, product grid, sort bar) but styling becomes synthwave.

**Step 2: Commit**

```bash
git add components/Browse/Browse.tsx
git commit -m "feat: dual-mode browse page with shop/marketplace toggle, synthwave styling"
```

---

## Task 7: Product Card — Glass Treatment

**Files:**

- Modify: `components/ProductCard/ProductCard.tsx`

**Step 1: Update ProductCard with glass + neon styling**

Key changes:

- Wrap card in `glass-panel-hover`
- Price in `text-neon-cyan`
- Pre-order badge if `taxon_names` includes "Pre-Order"
- Color swatches for color option values
- Hover: `translateY(-4px)` + border glow
- Font changes: name in `font-mono-bold`, price in `font-mono-bold`

**Step 2: Commit**

```bash
git add components/ProductCard/ProductCard.tsx
git commit -m "feat: glassmorphic product card with neon accents and pre-order badge"
```

---

## Task 8: Header — Glass Nav Bar

**Files:**

- Modify: `components/Header/Header.tsx`

**Step 1: Update Header with glass treatment**

Key changes:

- Add `glass-panel` background with `backdrop-blur`
- Make it sticky with `fixed top-0 z-50`
- Logo text in neon (or use existing Logo component)
- Nav links in `text-white/60 hover:text-neon-cyan`
- Cart badge in `bg-neon-cyan text-black`

**Step 2: Commit**

```bash
git add components/Header/Header.tsx
git commit -m "feat: glassmorphic header with neon accents"
```

---

## Task 9: Product Detail — Glass Treatment

**Files:**

- Modify: `components/ProductDetails/RetailProductDetails.tsx`

**Step 1: Apply synthwave styling to product detail**

Key changes:

- Page wrapped in `synth-bg`
- Product image container with radial neon glow behind (`bg-neon-magenta/10 blur-[100px]`)
- Info section in `glass-panel`
- Name in `font-pixel`
- Price in `neon-text-cyan` large
- Variant selectors: color circles with neon border on active, size pills with neon active state
- Add to cart button as `glass-button` with cyan glow
- Properties table in `glass-panel` with monospace rows

**Step 2: Commit**

```bash
git add components/ProductDetails/RetailProductDetails.tsx
git commit -m "feat: synthwave product detail page with glass panels and neon accents"
```

---

## Task 10: Cart & Checkout — Glass Treatment

**Files:**

- Modify: `components/Cart/Cart.tsx`
- Modify: `components/Checkout/Checkout.tsx`

**Step 1: Apply glass treatment to Cart**

- Wrap cart container in `synth-bg`
- Line items in `glass-panel`
- Quantity controls with `glass-button` style
- Totals in `neon-text-cyan`
- Checkout button as `glass-button`

**Step 2: Apply glass treatment to Checkout**

- Form sections in `glass-panel`
- Inputs use `glass-input`
- Buttons use `glass-button`
- Step indicators with neon active state

**Step 3: Commit**

```bash
git add components/Cart/Cart.tsx components/Checkout/Checkout.tsx
git commit -m "feat: glassmorphic cart and checkout pages"
```

---

## Task 11: LogoBlob — Match BeeperNative

**Files:**

- Modify: `components/LogoBlob/LogoBlob.tsx`
- Modify: `components/LogoBlob/LogoBlob.styles.tsx`
- Modify: `components/Logo/AnimatedLogo.tsx`

**Step 1: Update blob to purple with graduated glow**

Key changes to `LogoBlob.tsx`:

- Blob fill: solid `#7c3aed` (purple) instead of animated peach/mint/lavender
- Blob stroke: keep `#ff008a` (hot pink)
- Animation: slow to 16000ms morph cycle (react-spring path interpolation between 4 blob shapes)
- Add breathing: scale oscillates 0.95→1.05 over 4s
- Add graduated glow: `box-shadow` stack with 5-10 layers of purple/magenta at decreasing opacity

Key changes to `AnimatedLogo.tsx`:

- Letter fill: SVG `<linearGradient>` from `#fffb00` to `#ffb300` (yellow→orange)
- Letter animation timing: variable per letter (3600-4600ms, staggered 0-900ms)
- Add "Play With Music" tagline below in white uppercase IBM Plex Mono

**Step 2: Commit**

```bash
git add components/LogoBlob/LogoBlob.tsx components/LogoBlob/LogoBlob.styles.tsx components/Logo/AnimatedLogo.tsx
git commit -m "feat: update LogoBlob to match BeeperNative — purple blob, gradient letters, graduated glow"
```

---

## Task 12: Verification

**Step 1: Run dev server**

```bash
cd /Users/smokey/Internal/Beeper/code/Beeper-Frontend && yarn dev
```

**Step 2: Verify each page**

- `/home` — Hero with neon glow, featured strip, shop/marketplace split, device specs
- `/browse` — Mode toggle works, shop shows Devices/Accessories/Apparel, marketplace shows Sample Packs/Synths/Visualizers
- `/browse?mode=marketplace` — Different card layout, magenta accents
- `/[productSlug]` — Glass panels, neon variant selectors, pre-order badge
- `/cart` — Glass treatment, neon accents
- Header — Glass nav bar, sticky, neon cart badge

**Step 3: Check for console errors**

Open browser DevTools and verify no React errors, no missing imports, no broken images.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify synthwave storefront overhaul — all pages rendering"
```
