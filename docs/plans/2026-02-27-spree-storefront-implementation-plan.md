# Beeper Storefront Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Seed Spree 4.2.5 with Beeper product data via Platform Admin API, then overhaul the Next.js storefront with a glassmorphic synthwave aesthetic featuring dual browse modes (Shop vs Marketplace).

**Architecture:** Seed script uses Spree Platform API v2 (`/api/v2/platform/`) with OAuth client_credentials auth. Frontend extends existing Next.js 13 Pages Router app with new Tailwind tokens, CSS utilities, and redesigned page components. No framework upgrades.

**Tech Stack:** Next.js 13.1.1, React 18.2.0, Tailwind 3.4.0, Framer Motion, React Query 3.6.0, @spree/storefront-api-v2-sdk (local tarball), Radix UI, react-spring (existing)

**Design Doc:** `docs/plans/2026-02-27-spree-data-and-storefront-overhaul-design.md`

---

## Task 1: Spree Seed Script — Setup & Auth

**Files:**

- Create: `scripts/seed-spree.ts`
- Create: `scripts/seed-spree-data.ts`
- Modify: `package.json` (add seed script command)

**Step 1: Create scripts directory and data file**

Create `scripts/seed-spree-data.ts` with all product/taxonomy definitions:

```typescript
// scripts/seed-spree-data.ts
// All Spree seed data — taxonomies, option types, properties, products, promotions

export const TAXONOMIES = [
  { name: "Shop" },
  { name: "Marketplace" },
  { name: "Collections" }
] as const;

export const TAXONS: Record<string, string[]> = {
  Shop: ["Devices", "Accessories", "Apparel"],
  Marketplace: ["Sample Packs", "Synths", "Visualizers"],
  Collections: ["Featured", "New Arrivals", "Pre-Order", "Bundles"]
};

export const OPTION_TYPES = [
  {
    name: "color",
    presentation: "Color",
    values: [
      { name: "black", presentation: "Black" },
      { name: "white", presentation: "White" }
    ]
  },
  {
    name: "size",
    presentation: "Size",
    values: [
      { name: "s", presentation: "S" },
      { name: "m", presentation: "M" },
      { name: "l", presentation: "L" },
      { name: "xl", presentation: "XL" },
      { name: "xxl", presentation: "XXL" }
    ]
  }
] as const;

export const PROPERTIES = [
  { name: "shipping_type", presentation: "Shipping Type" },
  { name: "preorder", presentation: "Pre-Order" },
  { name: "ships_date", presentation: "Ships" },
  { name: "connectivity", presentation: "Connectivity" },
  { name: "compatibility", presentation: "Compatibility" },
  { name: "format", presentation: "Format" },
  { name: "file_count", presentation: "Files Included" },
  { name: "polyphony", presentation: "Polyphony" }
] as const;

export interface ProductDef {
  name: string;
  slug: string;
  price: string;
  description: string;
  shippingWeight?: string;
  optionType?: string; // name of option type to assign
  taxons: string[]; // taxon names to assign
  properties: Record<string, string>;
  variants?: { optionValue: string; sku: string }[];
}

export const PRODUCTS: ProductDef[] = [
  // --- Physical Products ---
  {
    name: "Beeper Δ8",
    slug: "beeper-delta-8",
    price: "199.99",
    description:
      "BLE MIDI controller with 8x FSR trigger pads, 2x capacitive-touch sliders, and an AMOLED heads-up display. PRE-ORDER NOW — SHIPS FALL 2026.",
    shippingWeight: "0.5",
    optionType: "color",
    taxons: ["Devices", "Featured", "Pre-Order"],
    properties: {
      shipping_type: "physical",
      preorder: "true",
      ships_date: "Fall 2026",
      connectivity: "BLE MIDI"
    },
    variants: [
      { optionValue: "black", sku: "BEEPER-D8-BLK" },
      { optionValue: "white", sku: "BEEPER-D8-WHT" }
    ]
  },
  {
    name: "Beeper Carrying Case",
    slug: "beeper-carrying-case",
    price: "29.99",
    description:
      "Custom-fit carrying case for the Beeper Δ8 controller. Padded interior with accessory pocket.",
    shippingWeight: "0.3",
    taxons: ["Accessories"],
    properties: { shipping_type: "physical" }
  },
  {
    name: "USB-C Cable",
    slug: "usb-c-cable",
    price: "14.99",
    description:
      "Premium braided USB-C cable for charging and firmware updates. 6ft / 1.8m.",
    shippingWeight: "0.1",
    taxons: ["Accessories"],
    properties: { shipping_type: "physical" }
  },
  {
    name: "Beeper T-Shirt",
    slug: "beeper-tshirt",
    price: "34.99",
    description: "Beeper logo tee. 100% cotton, unisex fit.",
    shippingWeight: "0.2",
    optionType: "size",
    taxons: ["Apparel"],
    properties: { shipping_type: "physical" },
    variants: [
      { optionValue: "s", sku: "BEEPER-TEE-S" },
      { optionValue: "m", sku: "BEEPER-TEE-M" },
      { optionValue: "l", sku: "BEEPER-TEE-L" },
      { optionValue: "xl", sku: "BEEPER-TEE-XL" },
      { optionValue: "xxl", sku: "BEEPER-TEE-XXL" }
    ]
  },
  // --- Digital Products ---
  {
    name: "Beeper iOS App",
    slug: "beeper-ios-app",
    price: "4.99",
    description:
      "The Beeper companion app for iOS. Synths, samplers, visualizers, and direct BLE MIDI control.",
    taxons: ["Synths"],
    properties: { shipping_type: "digital", compatibility: "iOS 16+" }
  },
  {
    name: "Starter Sample Pack",
    slug: "starter-sample-pack",
    price: "9.99",
    description: "64 curated drum hits, loops, and one-shots. WAV + MIDI.",
    taxons: ["Sample Packs", "Featured"],
    properties: {
      shipping_type: "digital",
      compatibility: "iOS 16+",
      format: "WAV / MIDI",
      file_count: "64 samples"
    }
  },
  {
    name: "Analog Dreams Synth",
    slug: "analog-dreams-synth",
    price: "6.99",
    description:
      "Warm analog-modeled synth with 8-voice polyphony. Detune, filter, ADSR.",
    taxons: ["Synths"],
    properties: {
      shipping_type: "digital",
      compatibility: "iOS 16+",
      polyphony: "8 voices"
    }
  },
  {
    name: "Neon Grid Visualizer",
    slug: "neon-grid-visualizer",
    price: "3.99",
    description:
      "Retro-futuristic wireframe grid visualizer. Responds to MIDI velocity and frequency.",
    taxons: ["Visualizers"],
    properties: {
      shipping_type: "digital",
      compatibility: "iOS 16+"
    }
  }
];

export const PROMOTIONS = [
  {
    name: "Pre-Order 10% Off",
    description: "10% off Beeper Δ8 pre-orders",
    code: "PREORDER10"
  },
  {
    name: "Bundle: Device + Case",
    description: "$10 off when you buy Beeper Δ8 + Carrying Case together",
    code: "BUNDLE10"
  },
  {
    name: "Launch Free Shipping",
    description: "Free shipping on orders over $150",
    code: "FREESHIP150"
  }
];
```

**Step 2: Create the seed script**

Create `scripts/seed-spree.ts`:

```typescript
// scripts/seed-spree.ts
// Idempotent Spree 4.2.5 Platform Admin API seed script
//
// Usage:
//   SPREE_API_URL=https://your-spree.com \
//   SPREE_CLIENT_ID=xxx \
//   SPREE_CLIENT_SECRET=xxx \
//   npx ts-node scripts/seed-spree.ts
//
// Spree 4.2.5 Platform API uses:
//   - OAuth2 client_credentials for auth
//   - JSON:API format with singular resource keys
//   - Base path: /api/v2/platform/

import {
  TAXONOMIES,
  TAXONS,
  OPTION_TYPES,
  PROPERTIES,
  PRODUCTS,
  PROMOTIONS,
  ProductDef
} from "./seed-spree-data";

const SPREE_URL =
  process.env.SPREE_API_URL || process.env.NEXT_PUBLIC_SPREE_API_URL;
const CLIENT_ID = process.env.SPREE_CLIENT_ID;
const CLIENT_SECRET = process.env.SPREE_CLIENT_SECRET;

if (!SPREE_URL || !CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing env vars: SPREE_API_URL, SPREE_CLIENT_ID, SPREE_CLIENT_SECRET"
  );
  process.exit(1);
}

let accessToken = "";

// --- Helpers ---

async function getToken(): Promise<string> {
  const res = await fetch(`${SPREE_URL}/spree_oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "admin"
    })
  });
  if (!res.ok)
    throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function api(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<any> {
  const url = `${SPREE_URL}/api/v2/platform${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function listAll(path: string): Promise<any[]> {
  let page = 1;
  const all: any[] = [];
  while (true) {
    const res = await api("GET", `${path}?page=${page}&per_page=100`);
    all.push(...(res.data || []));
    if (!res.data?.length || res.data.length < 100) break;
    page++;
  }
  return all;
}

function findByName(items: any[], name: string): any | undefined {
  return items.find((i: any) => i.attributes?.name === name);
}

// --- Seeders ---

async function seedTaxonomies(): Promise<
  Record<string, { id: string; rootTaxonId: string }>
> {
  console.log("\n=== Taxonomies ===");
  const existing = await listAll("/taxonomies");
  const map: Record<string, { id: string; rootTaxonId: string }> = {};

  for (const t of TAXONOMIES) {
    const found = findByName(existing, t.name);
    if (found) {
      console.log(`  ✓ ${t.name} (id: ${found.id}) — exists`);
      map[t.name] = {
        id: found.id,
        rootTaxonId: found.relationships?.root?.data?.id
      };
    } else {
      const res = await api("POST", "/taxonomies", {
        taxonomy: { name: t.name }
      });
      console.log(`  + ${t.name} (id: ${res.data.id}) — created`);
      map[t.name] = {
        id: res.data.id,
        rootTaxonId: res.data.relationships?.root?.data?.id
      };
    }
  }
  return map;
}

async function seedTaxons(
  taxonomyMap: Record<string, { id: string; rootTaxonId: string }>
): Promise<Record<string, string>> {
  console.log("\n=== Taxons ===");
  const existing = await listAll("/taxons");
  const taxonMap: Record<string, string> = {}; // taxon name → taxon id

  for (const [taxonomyName, taxonNames] of Object.entries(TAXONS)) {
    const taxonomy = taxonomyMap[taxonomyName];
    if (!taxonomy) {
      console.error(`  ! Taxonomy "${taxonomyName}" not found`);
      continue;
    }
    for (const name of taxonNames) {
      const found = findByName(existing, name);
      if (found) {
        console.log(`  ✓ ${taxonomyName} > ${name} (id: ${found.id}) — exists`);
        taxonMap[name] = found.id;
      } else {
        const res = await api("POST", "/taxons", {
          taxon: {
            taxonomy_id: taxonomy.id,
            parent_id: taxonomy.rootTaxonId,
            name
          }
        });
        console.log(
          `  + ${taxonomyName} > ${name} (id: ${res.data.id}) — created`
        );
        taxonMap[name] = res.data.id;
      }
    }
  }
  return taxonMap;
}

async function seedOptionTypes(): Promise<
  Record<string, { id: string; values: Record<string, string> }>
> {
  console.log("\n=== Option Types ===");
  const existing = await listAll("/option_types");
  const map: Record<string, { id: string; values: Record<string, string> }> =
    {};

  for (const ot of OPTION_TYPES) {
    let found = findByName(existing, ot.name);
    if (found) {
      console.log(`  ✓ ${ot.name} (id: ${found.id}) — exists`);
    } else {
      const res = await api("POST", "/option_types", {
        option_type: { name: ot.name, presentation: ot.presentation }
      });
      found = res.data;
      console.log(`  + ${ot.name} (id: ${found.id}) — created`);
    }

    // Seed option values
    const existingValues = await listAll(
      `/option_values?filter[option_type_id]=${found.id}`
    );
    const valueMap: Record<string, string> = {};

    for (const ov of ot.values) {
      const foundOv = existingValues.find(
        (v: any) => v.attributes?.name === ov.name
      );
      if (foundOv) {
        console.log(`    ✓ ${ov.name} (id: ${foundOv.id}) — exists`);
        valueMap[ov.name] = foundOv.id;
      } else {
        const res = await api("POST", "/option_values", {
          option_value: {
            name: ov.name,
            presentation: ov.presentation,
            option_type_id: found.id
          }
        });
        console.log(`    + ${ov.name} (id: ${res.data.id}) — created`);
        valueMap[ov.name] = res.data.id;
      }
    }
    map[ot.name] = { id: found.id, values: valueMap };
  }
  return map;
}

async function seedProperties(): Promise<Record<string, string>> {
  console.log("\n=== Properties ===");
  const existing = await listAll("/properties");
  const map: Record<string, string> = {};

  for (const p of PROPERTIES) {
    const found = findByName(existing, p.name);
    if (found) {
      console.log(`  ✓ ${p.name} (id: ${found.id}) — exists`);
      map[p.name] = found.id;
    } else {
      const res = await api("POST", "/properties", {
        property: { name: p.name, presentation: p.presentation }
      });
      console.log(`  + ${p.name} (id: ${res.data.id}) — created`);
      map[p.name] = res.data.id;
    }
  }
  return map;
}

async function seedProducts(
  taxonMap: Record<string, string>,
  optionTypeMap: Record<string, { id: string; values: Record<string, string> }>,
  propertyMap: Record<string, string>
): Promise<void> {
  console.log("\n=== Products ===");
  const existing = await listAll("/products");

  for (const p of PRODUCTS) {
    const found = existing.find((e: any) => e.attributes?.slug === p.slug);
    let productId: string;

    if (found) {
      console.log(`  ✓ ${p.name} (id: ${found.id}) — exists`);
      productId = found.id;
    } else {
      // Create product with price
      const productBody: Record<string, unknown> = {
        name: p.name,
        slug: p.slug,
        price: p.price,
        description: p.description,
        status: "active",
        available_on: new Date().toISOString(),
        shipping_category_id: "1" // default
      };
      if (p.shippingWeight) {
        productBody.weight = p.shippingWeight;
      }

      const res = await api("POST", "/products", { product: productBody });
      productId = res.data.id;
      console.log(`  + ${p.name} (id: ${productId}) — created`);
    }

    // Assign taxons
    for (const taxonName of p.taxons) {
      const taxonId = taxonMap[taxonName];
      if (!taxonId) {
        console.error(`    ! Taxon "${taxonName}" not found for ${p.name}`);
        continue;
      }
      try {
        await api("PATCH", `/products/${productId}`, {
          product: {
            taxon_ids: [...p.taxons.map((t) => taxonMap[t]).filter(Boolean)]
          }
        });
      } catch (e) {
        // Taxon assignment may already exist — not fatal
      }
    }
    // Only log once per product
    console.log(`    → Taxons: ${p.taxons.join(", ")}`);

    // Assign option type
    if (p.optionType) {
      const ot = optionTypeMap[p.optionType];
      if (ot) {
        try {
          await api("PATCH", `/products/${productId}`, {
            product: { option_type_ids: [ot.id] }
          });
          console.log(`    → Option type: ${p.optionType}`);
        } catch (e) {
          console.log(`    → Option type already assigned`);
        }
      }
    }

    // Assign properties
    for (const [propName, propValue] of Object.entries(p.properties)) {
      const propId = propertyMap[propName];
      if (!propId) continue;
      try {
        await api("POST", "/product_properties", {
          product_property: {
            product_id: productId,
            property_id: propId,
            value: propValue
          }
        });
        console.log(`    → Property: ${propName}=${propValue}`);
      } catch (e) {
        // May already exist
        console.log(`    → Property ${propName} already set`);
      }
    }

    // Create variants
    if (p.variants && p.optionType) {
      const ot = optionTypeMap[p.optionType];
      if (!ot) continue;

      const existingVariants = await listAll(
        `/variants?filter[product_id]=${productId}`
      );

      for (const v of p.variants) {
        const ovId = ot.values[v.optionValue];
        if (!ovId) {
          console.error(`    ! Option value "${v.optionValue}" not found`);
          continue;
        }
        const existingVar = existingVariants.find(
          (ev: any) => ev.attributes?.sku === v.sku
        );
        if (existingVar) {
          console.log(
            `    ✓ Variant ${v.sku} (id: ${existingVar.id}) — exists`
          );
        } else {
          const res = await api("POST", "/variants", {
            variant: {
              product_id: productId,
              sku: v.sku,
              price: p.price,
              option_value_ids: [ovId],
              track_inventory: true
            }
          });
          console.log(`    + Variant ${v.sku} (id: ${res.data.id}) — created`);
        }
      }
    }
  }
}

async function seedPromotions(): Promise<void> {
  console.log("\n=== Promotions ===");
  const existing = await listAll("/promotions");

  for (const promo of PROMOTIONS) {
    const found = findByName(existing, promo.name);
    if (found) {
      console.log(`  ✓ ${promo.name} (id: ${found.id}) — exists`);
    } else {
      const res = await api("POST", "/promotions", {
        promotion: {
          name: promo.name,
          description: promo.description,
          code: promo.code,
          starts_at: new Date().toISOString(),
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString()
        }
      });
      console.log(`  + ${promo.name} (id: ${res.data.id}) — created`);
      // Note: Promotion rules and actions must be configured in Spree Admin UI
      // The Platform API for promotion rules/actions varies by Spree version
      console.log(`    ⚠ Configure rules & actions in Spree Admin UI`);
    }
  }
}

// --- Main ---

async function main() {
  console.log(`Seeding Spree 4.2.5 at ${SPREE_URL}`);
  console.log("Authenticating...");
  accessToken = await getToken();
  console.log("✓ Authenticated");

  const taxonomyMap = await seedTaxonomies();
  const taxonMap = await seedTaxons(taxonomyMap);
  const optionTypeMap = await seedOptionTypes();
  const propertyMap = await seedProperties();
  await seedProducts(taxonMap, optionTypeMap, propertyMap);
  await seedPromotions();

  console.log("\n✓ Seed complete!");
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err.message);
  process.exit(1);
});
```

**Step 3: Add npm script to package.json**

In `package.json`, add to `"scripts"`:

```json
"seed": "ts-node scripts/seed-spree.ts"
```

**Step 4: Run the seed script**

```bash
SPREE_API_URL=<your-url> SPREE_CLIENT_ID=<id> SPREE_CLIENT_SECRET=<secret> yarn seed
```

Expected: All taxonomies, taxons, option types, properties, products, variants, and promotions created. Console shows ✓ for existing items, + for new items.

**Step 5: Commit**

```bash
git add scripts/ package.json
git commit -m "feat: add Spree 4.2.5 seed script with Beeper product data"
```

---

## Task 2: Tailwind Tokens + Global Styles

**Files:**

- Modify: `tailwind.config.ts`
- Modify: `styles/globals.css`
- Modify: `styles/fonts.css`
- Create: `styles/synthwave.css`

**Step 1: Add neon color tokens to Tailwind config**

In `tailwind.config.ts`, extend the `theme.extend.colors` object:

```typescript
// Add inside theme.extend.colors:
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
surface: {
  deep: '#0A0020',
  void: '#000000',
},
```

**Step 2: Add PressStart2P font**

In `styles/fonts.css`, add:

```css
@font-face {
  font-family: "PressStart2P";
  src: url("/fonts/PressStart2P-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

Download `PressStart2P-Regular.ttf` from Google Fonts and place in `public/fonts/`.

In `tailwind.config.ts`, add to `theme.extend.fontFamily`:

```typescript
pressstart: ['PressStart2P', 'monospace'],
```

**Step 3: Create synthwave.css utility classes**

Create `styles/synthwave.css`:

```css
/* === Glass Panel === */
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.glass-panel-hover:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

/* === Neon Text Glow === */
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
  text-shadow: 0 0 7px #ff1493, 0 0 20px #ff1493, 0 0 42px #ff0066;
}

.neon-text-lime {
  color: #39ff14;
  text-shadow: 0 0 7px #39ff14, 0 0 20px #39ff14, 0 0 42px #00ff00;
}

.neon-text-amber {
  color: #ff6600;
  text-shadow: 0 0 7px #ff6600, 0 0 20px #ff6600, 0 0 42px #ff3300;
}

/* === Neon Border Glow === */
.neon-border-cyan {
  border: 1px solid #00ffff;
  box-shadow: 0 0 5px #00ffff, inset 0 0 5px rgba(0, 255, 255, 0.1);
}

.neon-border-magenta {
  border: 1px solid #ff00ff;
  box-shadow: 0 0 5px #ff00ff, inset 0 0 5px rgba(255, 0, 255, 0.1);
}

/* === Neon Button === */
.neon-btn {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid #00ffff;
  box-shadow: 0 0 5px #00ffff, inset 0 0 5px rgba(0, 255, 255, 0.1);
  color: #00ffff;
  transition: all 0.3s ease;
}

.neon-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 10px #00ffff, 0 0 20px rgba(0, 255, 255, 0.3),
    inset 0 0 10px rgba(0, 255, 255, 0.15);
}

/* === Pre-Order Badge === */
.badge-preorder {
  background: rgba(255, 102, 0, 0.15);
  border: 1px solid rgba(255, 102, 0, 0.5);
  color: #ff6600;
  font-family: "PressStart2P", monospace;
  font-size: 0.5rem;
  padding: 4px 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* === CRT Scanline Overlay === */
.scanlines::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* === Neon Focus Ring === */
.neon-focus:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.3), 0 0 8px rgba(0, 255, 255, 0.2);
}

/* === Breathing Glow Animation === */
@keyframes breathe {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.38);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.42);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 10px #00ffff;
  }
  50% {
    box-shadow: 0 0 20px #00ffff, 0 0 40px rgba(0, 255, 255, 0.3);
  }
}

.animate-breathe {
  animation: breathe 4s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

**Step 4: Update globals.css**

In `styles/globals.css`, add/update the body background:

```css
/* At the top of the file, after @tailwind directives */
@import "./synthwave.css";

body {
  background: linear-gradient(180deg, #0a0020 0%, #000000 100%);
  min-height: 100vh;
  color: #e0e0e0;
}
```

**Step 5: Verify styles load**

Run: `yarn dev`
Expected: Dark gradient background on all pages, no errors in console.

**Step 6: Commit**

```bash
git add styles/ tailwind.config.ts public/fonts/PressStart2P-Regular.ttf
git commit -m "feat: add synthwave design tokens, glass utilities, neon glow classes"
```

---

## Task 3: LogoBlob — Match BeeperNative

**Files:**

- Modify: `components/LogoBlob/LogoBlob.tsx`
- Modify: `components/LogoBlob/LogoBlob.styles.tsx`
- Modify: `components/Logo/AnimatedLogo.tsx`

**Step 1: Update LogoBlob.tsx blob color and animation**

Replace the blob fill color cycling with solid purple `#7c3aed`. Replace SVG `feTurbulence`/`feDisplacementMap` filter with `react-spring` path interpolation between the 4 blob shapes on a 16000ms loop. Add 10-layer graduated glow via stacked `box-shadow`.

Reference the native implementation at:

- `/Users/smokey/Internal/Beeper/code/BeeperNative/src/components/LogoBlob.tsx`

Key changes:

- Blob fill: `#7c3aed` (solid purple)
- Blob stroke: `#ff008a` (hot pink)
- Animation: `useSpring` with 16000ms duration cycling through blob1→blob2→blob3→blob4→blob1
- Breathing: CSS `animation: breathe 4s ease-in-out infinite` on wrapper
- Glow: CSS `box-shadow` stack with 10 graduated layers

**Step 2: Update AnimatedLogo.tsx letter styling**

- Replace solid gold `#E9C86F` fills with SVG `<linearGradient>` from `#fffb00` to `#ffb300`
- Update animation timings per letter: B(3800ms/0ms), E(4200ms/400ms), E(4600ms/800ms), P(4000ms/200ms), E(4400ms/600ms), R(3600ms/900ms)
- Add "Play With Music" tagline in IBM Plex Medium, white, uppercase, 12px, letter-spacing 0.15em

**Step 3: Update LogoBlob.styles.tsx**

Add graduated glow CSS:

```typescript
export const blobGlowShadow = `
  0 0 70px rgba(124, 58, 237, 0.3),
  0 0 60px rgba(124, 58, 237, 0.35),
  0 0 50px rgba(124, 58, 237, 0.4),
  0 0 45px rgba(124, 58, 237, 0.45),
  0 0 40px rgba(124, 58, 237, 0.5),
  0 0 35px rgba(124, 58, 237, 0.55),
  0 0 30px rgba(124, 58, 237, 0.6),
  0 0 25px rgba(255, 0, 138, 0.4),
  0 0 20px rgba(255, 0, 138, 0.5),
  0 0 15px rgba(255, 0, 138, 0.6)
`;
```

**Step 4: Verify in browser**

Run: `yarn dev`
Expected: Purple morphing blob with neon glow, yellow-orange gradient letters floating with staggered timing, "Play With Music" tagline.

**Step 5: Commit**

```bash
git add components/LogoBlob/ components/Logo/
git commit -m "feat: update LogoBlob to match BeeperNative synthwave style"
```

---

## Task 4: Header & Navigation — Glass Treatment

**Files:**

- Modify: `components/Header/Header.tsx`
- Modify: `components/MainMenu/DesktopMenu.tsx`
- Modify: `components/MainMenu/MobileMenu.tsx`
- Modify: `components/MainMenu/MobileBottomNav.tsx`

**Step 1: Glassmorphic header bar**

Update Header.tsx:

- Background: `glass-panel` class (translucent with backdrop blur)
- Logo: Use AnimatedLogo component (small scale)
- Nav links: IBM Plex Mono, white, neon-cyan on hover
- Cart icon: Neon badge count
- Sticky position with `z-50`

**Step 2: Desktop menu neon treatment**

Update DesktopMenu.tsx:

- Nav items: White text, neon-cyan underline on hover (animated width)
- Active state: Neon glow text
- Dropdown menus: Glass panel background

**Step 3: Mobile menu**

Update MobileMenu.tsx:

- Full-screen dark glass overlay
- Links: PressStart2P for section headers, IBM Plex Mono for items
- Neon accent dividers

**Step 4: Verify**

Run: `yarn dev`, check header on desktop and mobile viewport.

**Step 5: Commit**

```bash
git add components/Header/ components/MainMenu/
git commit -m "feat: glassmorphic header and navigation"
```

---

## Task 5: Homepage Redesign

**Files:**

- Modify: `components/Home/DynamicHome.tsx`
- Modify: `components/Home/Hero/Hero.tsx`
- Modify: `components/Home/Featured/Featured.tsx`
- Modify: `components/Home/Products/Products.tsx`
- Modify: `components/Home/Newsletter/Newsletter.tsx`
- Create: `components/Home/ShopMarketplaceSplit/ShopMarketplaceSplit.tsx`
- Create: `components/Home/SpecsGrid/SpecsGrid.tsx`
- Modify: `pages/home.tsx`

**Step 1: LogoBlob hero section in DynamicHome**

At the top of DynamicHome, render the updated LogoBlob component centered with the "Play With Music" tagline.

**Step 2: Hero section — Beeper Δ8 product**

Update Hero.tsx:

- Fetch `beeper-delta-8` product from Spree (from Featured taxon)
- Dark gradient background with radial neon glow (magenta) behind product image
- "BEEPER Δ8" in PressStart2P with neon magenta glow
- "PRE-ORDER NOW — SHIPS FALL '26" subtitle in IBM Plex Mono
- Glass CTA button with neon-cyan border + `animate-pulse-glow`
- Framer Motion: Staggered fade-up entrance animation

**Step 3: Featured products strip**

Update Featured.tsx:

- Fetch products from "Featured" taxon via existing `useProducts` hook with taxon filter
- Horizontal scroll container with glass product cards
- Each card: Image, name (IBM Plex Mono), price (neon-cyan), hover glow

**Step 4: Shop / Marketplace split**

Create `components/Home/ShopMarketplaceSplit/ShopMarketplaceSplit.tsx`:

- Two glass panels side by side (CSS Grid, stack on mobile)
- Left: "SHOP" — neon-cyan accent, device imagery silhouette
- Right: "MARKETPLACE" — neon-magenta accent, waveform pattern
- Hover: Scale(1.02), border glow intensifies
- Links to `/browse?mode=shop` and `/browse?mode=marketplace`

**Step 5: Specs grid**

Create `components/Home/SpecsGrid/SpecsGrid.tsx`:

- 4 glass pills: "8x FSR PADS", "2x CAP-TOUCH SLIDERS", "AMOLED HUD", "BLE MIDI"
- PressStart2P labels at small size (0.6rem)
- Subtle neon-cyan icon/accent per item
- 2x2 grid on mobile, 4-col on desktop

**Step 6: Newsletter CTA**

Update Newsletter.tsx:

- Glass panel, full-width
- Input: Dark bg, neon-cyan focus ring (`neon-focus` class)
- Submit button: `neon-btn` class
- Title in PressStart2P

**Step 7: Wire up DynamicHome.tsx**

Arrange sections in order:

1. LogoBlob
2. Hero (Beeper Δ8)
3. Featured Products
4. Shop/Marketplace Split
5. Specs Grid
6. Newsletter

**Step 8: Verify**

Run: `yarn dev`, navigate to `/home`.
Expected: Full synthwave homepage with all sections rendering.

**Step 9: Commit**

```bash
git add components/Home/ pages/home.tsx
git commit -m "feat: redesign homepage with glassmorphic synthwave sections"
```

---

## Task 6: Browse Page — Dual Mode

**Files:**

- Modify: `pages/browse.tsx`
- Modify: `components/Browse/Browse.tsx`
- Modify: `components/ProductCard/ProductCard.tsx`
- Modify: `components/ProductList/ProductList.tsx`
- Create: `components/Browse/ModeToggle.tsx`
- Create: `components/Browse/MarketplaceCard.tsx`

**Step 1: Mode toggle component**

Create `components/Browse/ModeToggle.tsx`:

- Two glass tab buttons: "SHOP" (neon-cyan) / "MARKETPLACE" (neon-magenta)
- Active tab: Filled background with neon color, glow
- Inactive tab: Glass panel, dim text
- Controls `mode` query param via `next/router`

**Step 2: Update Browse.tsx for dual mode**

Read `mode` from `router.query.mode` (default: `shop`).

- Shop mode: Filter by taxons under "Shop" taxonomy
- Marketplace mode: Filter by taxons under "Marketplace" taxonomy
- Show filter chips for the active taxonomy's taxons
- Search bar with `neon-focus` styling
- Sort dropdown with glass treatment

**Step 3: Shop mode ProductCard**

Update `components/ProductCard/ProductCard.tsx`:

- Glass panel card with dark bg
- Product image
- Name in IBM Plex Mono (white)
- Price in neon-cyan
- Color swatches (small circles) if `option_types` includes color
- "PRE-ORDER" badge (`badge-preorder` class) if `preorder` property is `true`
- Hover: `translateY(-4px)`, border glow intensifies via CSS transition

**Step 4: Marketplace mode card**

Create `components/Browse/MarketplaceCard.tsx`:

- Wider/landscape glass card (different aspect ratio)
- Artwork thumbnail
- Name + type badge (Sample Pack/Synth/Visualizer) with neon tint
- Price badge
- Format/file count metadata line (from product properties)
- Hover: Scale(1.02), glow

**Step 5: Update ProductList.tsx**

Conditionally render `ProductCard` or `MarketplaceCard` based on `mode` prop.

- Shop grid: 2 cols mobile, 3 tablet, 4 desktop
- Marketplace grid: 1-2 cols mobile, 2-3 desktop (wider cards)

**Step 6: Wire up URL state**

Support query params: `?mode=shop|marketplace&category=<taxon-name>&sort=newest|price-asc|price-desc&q=<search>`

**Step 7: Verify**

Run: `yarn dev`, navigate to:

- `/browse` — defaults to shop mode
- `/browse?mode=marketplace` — switches to marketplace
- Click filter chips, verify filtering works
- Verify product cards render with correct styling

**Step 8: Commit**

```bash
git add pages/browse.tsx components/Browse/ components/ProductCard/ components/ProductList/
git commit -m "feat: dual-mode browse page with Shop and Marketplace views"
```

---

## Task 7: Product Detail Page — Glass Treatment

**Files:**

- Modify: `pages/[productSlug].tsx`
- Modify: `components/ProductDetails/RetailProductDetails.tsx`

**Step 1: Product hero**

- Large product image with radial neon glow backdrop (CSS `radial-gradient` + `box-shadow`)
- Framer Motion fade-in on mount

**Step 2: Info panel**

- Glass panel with:
  - Product name in PressStart2P (responsive size)
  - Price in neon-cyan, large
  - Pre-order badge if applicable
  - Variant selectors: Color swatches (circles with border glow on active) or size pills (glass buttons with neon active state)
  - "ADD TO CART" button: `neon-btn` class, full-width on mobile
  - Quantity selector with glass styling

**Step 3: Specs table**

- Glass panel below info
- Product properties rendered as monospace key-value rows
- Alternating row bg for readability (slightly different glass opacity)

**Step 4: Related products**

- Horizontal scroll of glass ProductCards
- Filtered from same taxon as current product

**Step 5: Verify**

Run: `yarn dev`, navigate to `/beeper-delta-8`.
Expected: Glassmorphic product page with variant selector, specs, related.

**Step 6: Commit**

```bash
git add pages/\[productSlug\].tsx components/ProductDetails/
git commit -m "feat: glassmorphic product detail page with neon variant selectors"
```

---

## Task 8: Cart & Checkout — Glass Treatment

**Files:**

- Modify: `components/Cart/Cart.tsx`
- Modify: `components/CartSidebar/CartSidebar.tsx`
- Modify: `components/Checkout/Checkout.tsx`

**Step 1: Cart page**

- Glass panel for cart items list
- Each line item: Glass row with image, name, quantity, price (neon-cyan)
- Remove button: Neon-pink on hover
- Cart total section: Glass panel, neon-cyan total
- "CHECKOUT" button: `neon-btn` class

**Step 2: Cart sidebar**

- Glass panel overlay from right
- Same styling as cart page but condensed

**Step 3: Checkout page**

- Glass panel for form sections (shipping, payment, review)
- Inputs: Dark bg, white text, neon-cyan focus ring (`neon-focus`)
- Step indicators: Neon accent for active step
- Keep existing Stripe integration unchanged — just restyle the wrapper

**Step 4: Verify**

Add items to cart, verify styling through checkout flow.

**Step 5: Commit**

```bash
git add components/Cart/ components/CartSidebar/ components/Checkout/
git commit -m "feat: glassmorphic cart and checkout styling"
```

---

## Task 9: Footer & Remaining Pages

**Files:**

- Modify: `components/Footer/Footer.tsx`
- Modify: `components/Login/Login.tsx`
- Modify: `components/Account/Account.tsx`

**Step 1: Footer**

- Glass panel background
- Neon accent dividers
- Social links with neon hover glow
- Copyright text in IBM Plex Mono

**Step 2: Auth pages**

- Login/signup forms: Glass panel, neon focus inputs, neon-btn submit

**Step 3: Account pages**

- Glass panel sections for orders, addresses, profile

**Step 4: Commit**

```bash
git add components/Footer/ components/Login/ components/Account/
git commit -m "feat: glassmorphic footer, auth, and account pages"
```

---

## Task 10: Final Review & Cleanup

**Step 1: Full visual audit**

Navigate through all pages in dev mode, checking:

- [ ] Homepage sections all render
- [ ] Browse shop mode with products
- [ ] Browse marketplace mode with products
- [ ] Product detail page with variants
- [ ] Cart and checkout flow
- [ ] Header/footer on all pages
- [ ] Mobile responsive on all pages
- [ ] No console errors

**Step 2: Remove old coral/pink brand colors**

Search for old brand colors (`#EB8B8B`, `#E6CDC0`, `#af1e1e`) and replace with neon equivalents where appropriate. Leave in Tailwind config for backwards compat if any components still reference them.

**Step 3: Performance check**

- Verify `backdrop-filter` doesn't cause layout thrashing
- Check PressStart2P font loading (should use `font-display: swap`)
- Ensure Framer Motion animations don't block first paint

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: final visual audit and cleanup for synthwave storefront"
```
