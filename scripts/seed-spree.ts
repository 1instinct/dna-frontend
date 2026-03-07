#!/usr/bin/env npx tsx
/**
 * Spree 4.2 v1 API Seed Script
 *
 * Idempotent — checks for existing records before creating.
 * Uses X-Spree-Token header authentication (admin API token).
 *
 * Required env vars:
 *   SPREE_API_URL          — e.g. https://admin.beeper.buzz
 *   SPREE_PLATFORM_TOKEN   — admin API token
 *
 * Usage:
 *   SPREE_API_URL=https://admin.beeper.buzz SPREE_PLATFORM_TOKEN=xxx npx tsx scripts/seed-spree.ts
 */

import {
  TAXONOMIES,
  TAXONS,
  OPTION_TYPES,
  PROPERTIES,
  PRODUCTS,
  PROTOTYPES,
  MENU_LOCATIONS,
  PROMOTIONS,
  ProductDef
} from "./seed-spree-data";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.SPREE_API_URL ||
  process.env.NEXT_PUBLIC_SPREE_API_URL ||
  "http://localhost:8080";

const TOKEN = process.env.SPREE_PLATFORM_TOKEN;
if (!TOKEN) {
  console.error("Missing SPREE_PLATFORM_TOKEN environment variable.");
  process.exit(1);
}

const V1 = "/api/v1";

function headers(): Record<string, string> {
  return {
    "X-Spree-Token": TOKEN!,
    "Content-Type": "application/json"
  };
}

// ---------------------------------------------------------------------------
// Generic API helpers
// ---------------------------------------------------------------------------

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${V1}${path}`, { headers: headers() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${BASE_URL}${V1}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

async function put<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE_URL}${V1}${path}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedTaxonomies(): Promise<Map<string, number>> {
  console.log("\n--- Seeding Taxonomies ---");
  const { taxonomies: existing } = await get<{
    taxonomies: Array<{ id: number; name: string }>;
  }>("/taxonomies");
  const map = new Map<string, number>();

  for (const t of existing) {
    map.set(t.name, t.id);
  }

  for (const { name } of TAXONOMIES) {
    if (map.has(name)) {
      console.log(`  [skip] Taxonomy "${name}" (id=${map.get(name)})`);
    } else {
      const created = await post<{ id: number; name: string }>("/taxonomies", {
        taxonomy: { name }
      });
      map.set(name, created.id);
      console.log(`  [create] Taxonomy "${name}" (id=${created.id})`);
    }
  }

  return map;
}

async function seedTaxons(
  taxonomyIds: Map<string, number>
): Promise<Map<string, number>> {
  console.log("\n--- Seeding Taxons ---");
  const map = new Map<string, number>();

  for (const [taxonomyName, children] of Object.entries(TAXONS)) {
    const taxonomyId = taxonomyIds.get(taxonomyName);
    if (!taxonomyId) {
      console.warn(`  [warn] Taxonomy "${taxonomyName}" not found`);
      continue;
    }

    // Get existing taxons for this taxonomy
    const { taxons: existing } = await get<{
      taxons: Array<{ id: number; name: string }>;
    }>(`/taxonomies/${taxonomyId}/taxons`);

    for (const t of existing) {
      map.set(t.name, t.id);
    }

    for (const childName of children) {
      if (map.has(childName)) {
        console.log(`  [skip] Taxon "${childName}" (id=${map.get(childName)})`);
      } else {
        const created = await post<{ id: number; name: string }>(
          `/taxonomies/${taxonomyId}/taxons`,
          { taxon: { name: childName } }
        );
        map.set(childName, created.id);
        console.log(
          `  [create] Taxon "${childName}" under "${taxonomyName}" (id=${created.id})`
        );
      }
    }
  }

  return map;
}

async function seedOptionTypes(): Promise<{
  typeIds: Map<string, number>;
  valueIds: Map<string, number>;
}> {
  console.log("\n--- Seeding Option Types ---");
  // v1 API returns bare array for option_types
  const rawOts = await get<
    | Array<{
        id: number;
        name: string;
        option_values: Array<{ id: number; name: string }>;
      }>
    | {
        option_types: Array<{
          id: number;
          name: string;
          option_values: Array<{ id: number; name: string }>;
        }>;
      }
  >("/option_types");
  const existing = Array.isArray(rawOts) ? rawOts : rawOts.option_types;

  const typeIds = new Map<string, number>();
  const valueIds = new Map<string, number>();

  // Index existing
  for (const ot of existing) {
    typeIds.set(ot.name, ot.id);
    for (const ov of ot.option_values || []) {
      valueIds.set(ov.name, ov.id);
    }
  }

  for (const otDef of OPTION_TYPES) {
    let typeId = typeIds.get(otDef.name);

    if (typeId) {
      console.log(`  [skip] Option type "${otDef.name}" (id=${typeId})`);
    } else {
      // Create option type with nested option_values
      const created = await post<{
        id: number;
        name: string;
        option_values: Array<{ id: number; name: string }>;
      }>("/option_types", {
        option_type: {
          name: otDef.name,
          presentation: otDef.presentation,
          option_values_attributes: otDef.values.map((v, i) => ({
            name: v.name,
            presentation: v.presentation,
            position: i + 1
          }))
        }
      });
      typeId = created.id;
      typeIds.set(otDef.name, typeId);
      console.log(`  [create] Option type "${otDef.name}" (id=${typeId})`);

      // Index the created option values
      for (const ov of created.option_values || []) {
        valueIds.set(ov.name, ov.id);
        console.log(`    [create] Option value "${ov.name}" (id=${ov.id})`);
      }
    }

    // Ensure all option values exist (in case type existed but values were missing)
    for (const ovDef of otDef.values) {
      if (!valueIds.has(ovDef.name)) {
        const created = await post<{ id: number; name: string }>(
          `/option_types/${typeId}/option_values`,
          {
            option_value: { name: ovDef.name, presentation: ovDef.presentation }
          }
        );
        valueIds.set(ovDef.name, created.id);
        console.log(
          `    [create] Option value "${ovDef.name}" (id=${created.id})`
        );
      }
    }
  }

  return { typeIds, valueIds };
}

async function seedProperties(): Promise<Map<string, number>> {
  console.log("\n--- Seeding Properties ---");
  const { properties: existing } = await get<{
    properties: Array<{ id: number; name: string }>;
  }>("/properties");

  const map = new Map<string, number>();
  for (const p of existing) {
    map.set(p.name, p.id);
  }

  for (const propDef of PROPERTIES) {
    if (map.has(propDef.name)) {
      console.log(
        `  [skip] Property "${propDef.name}" (id=${map.get(propDef.name)})`
      );
    } else {
      const created = await post<{ id: number; name: string }>("/properties", {
        property: { name: propDef.name, presentation: propDef.presentation }
      });
      map.set(propDef.name, created.id);
      console.log(`  [create] Property "${propDef.name}" (id=${created.id})`);
    }
  }

  return map;
}

async function seedProducts(
  taxonIds: Map<string, number>,
  propertyIds: Map<string, number>,
  optionTypeIds: Map<string, number>,
  optionValueIds: Map<string, number>
): Promise<void> {
  console.log("\n--- Seeding Products ---");

  // Fetch existing products (paginated)
  const { products: existing } = await get<{
    products: Array<{ id: number; slug: string; name: string }>;
  }>("/products?per_page=100");

  for (const def of PRODUCTS) {
    let product = existing.find((p) => p.slug === def.slug);

    if (product) {
      console.log(`  [skip] Product "${def.name}" (id=${product.id})`);
    } else {
      // Resolve taxon IDs
      const taxonIdList = def.taxons
        .map((t) => taxonIds.get(t))
        .filter((id): id is number => id !== undefined);

      const productPayload: Record<string, unknown> = {
        name: def.name,
        slug: def.slug,
        price: def.price,
        description: def.description,
        available_on: new Date().toISOString(),
        shipping_category_id: 1, // Default
        taxon_ids: taxonIdList
      };

      if (def.shippingWeight) {
        productPayload.weight = parseFloat(def.shippingWeight);
      }

      if (def.optionType) {
        const otId = optionTypeIds.get(def.optionType);
        if (otId) {
          productPayload.option_type_ids = [otId];
        }
      }

      product = await post<{ id: number; slug: string; name: string }>(
        "/products",
        {
          product: productPayload
        }
      );
      console.log(`  [create] Product "${def.name}" (id=${product.id})`);

      // Set product properties
      for (const [propName, propValue] of Object.entries(def.properties)) {
        const propId = propertyIds.get(propName);
        if (!propId) continue;

        try {
          await post(`/products/${product.id}/product_properties`, {
            product_property: { property_name: propName, value: propValue }
          });
        } catch {
          console.warn(`    [warn] Could not set property "${propName}"`);
        }
      }

      // Create variants
      if (def.variants) {
        for (const v of def.variants) {
          const ovId = optionValueIds.get(v.optionValue);
          if (!ovId) {
            console.warn(
              `    [warn] Option value "${v.optionValue}" not found`
            );
            continue;
          }

          try {
            const variant = await post<{ id: number; sku: string }>(
              `/products/${product.id}/variants`,
              {
                variant: {
                  sku: v.sku,
                  price: def.price,
                  weight: def.shippingWeight
                    ? parseFloat(def.shippingWeight)
                    : undefined,
                  option_value_ids: [ovId]
                }
              }
            );
            console.log(`    [create] Variant "${v.sku}" (id=${variant.id})`);

            // Set stock for variant
            await setStock(variant.id);
          } catch (err) {
            console.warn(
              `    [warn] Could not create variant "${v.sku}": ${err}`
            );
          }
        }
      }

      // Set stock for master variant
      await setMasterStock(product.id);
    }
  }
}

async function setStock(variantId: number): Promise<void> {
  try {
    // Find the stock item for this variant
    const { stock_items } = await get<{
      stock_items: Array<{
        id: number;
        variant_id: number;
        count_on_hand: number;
      }>;
    }>("/stock_locations/1/stock_items?per_page=200");

    const stockItem = stock_items.find((si) => si.variant_id === variantId);
    if (stockItem && stockItem.count_on_hand === 0) {
      await put(`/stock_locations/1/stock_items/${stockItem.id}`, {
        stock_item: { count_on_hand: 100, force: true }
      });
    }
  } catch {
    // Stock adjustment is best-effort
  }
}

async function setMasterStock(productId: number): Promise<void> {
  try {
    const { variants } = await get<{
      variants: Array<{ id: number; is_master: boolean }>;
    }>(`/products/${productId}/variants?per_page=100`);

    const master = variants.find((v) => v.is_master);
    if (master) {
      await setStock(master.id);
    }
  } catch {
    // Best-effort
  }
}

// ---------------------------------------------------------------------------
// Menus (via v1 API — requires CRUD endpoints deployed to admin)
// ---------------------------------------------------------------------------

interface MenuLocationResponse {
  response_code: number;
  response_data: {
    menu_location_listing: Array<{ id: number; title: string }>;
  };
}

interface MenuItemResponse {
  response_code: number;
  response_data: {
    menu_location_listing: Array<{
      id: number;
      title: string;
      menu_item_listing: Array<{
        id: number;
        name: string;
        parent_id: number;
        childrens: unknown[];
      }>;
    }>;
  };
}

async function seedMenus(): Promise<void> {
  console.log("\n--- Seeding Menus ---");

  // Check existing menu locations
  const existing = await get<MenuLocationResponse>("/menu_locations").catch(
    () => null
  );
  const existingLocations =
    existing?.response_data?.menu_location_listing || [];

  if (existingLocations.length >= MENU_LOCATIONS.length) {
    console.log(
      `  [skip] ${existingLocations.length} menu location(s) already exist`
    );
    return;
  }

  const locationIds = new Map<string, number>();
  for (const loc of existingLocations) {
    locationIds.set(loc.title, loc.id);
  }

  // Create menu locations via v1 API
  for (const menuDef of MENU_LOCATIONS) {
    if (locationIds.has(menuDef.title)) {
      console.log(
        `  [skip] Menu location "${menuDef.title}" (id=${locationIds.get(
          menuDef.title
        )})`
      );
      continue;
    }

    try {
      const created = await post<{
        response_code: number;
        response_data: { id: number; title: string };
      }>("/menu_locations", {
        menu_location: {
          title: menuDef.title,
          location: menuDef.location,
          is_visible: true
        }
      });
      const id = created.response_data?.id;
      if (id) {
        locationIds.set(menuDef.title, id);
        console.log(`  [create] Menu location "${menuDef.title}" (id=${id})`);
      }
    } catch (err) {
      console.warn(
        `  [warn] Could not create menu location "${menuDef.title}": ${err}`
      );
    }
  }

  // Create menu items for each location
  for (const menuDef of MENU_LOCATIONS) {
    const locId = locationIds.get(menuDef.title);
    if (!locId) continue;

    for (let i = 0; i < menuDef.items.length; i++) {
      const item = menuDef.items[i];
      try {
        const created = await post<{
          response_code: number;
          response_data: { id: number; name: string };
        }>("/menu_items", {
          menu_item: {
            name: item.name,
            url: item.url,
            menu_location_id: locId,
            is_visible: true,
            position: i + 1
          }
        });
        const parentId = created.response_data?.id;
        console.log(`    [create] Menu item "${item.name}" (id=${parentId})`);

        // Create children
        if (item.children && parentId) {
          for (let j = 0; j < item.children.length; j++) {
            const child = item.children[j];
            try {
              const childCreated = await post<{
                response_code: number;
                response_data: { id: number; name: string };
              }>("/menu_items", {
                menu_item: {
                  name: child.name,
                  url: child.url,
                  menu_location_id: locId,
                  parent_id: parentId,
                  is_visible: true,
                  position: j + 1
                }
              });
              console.log(
                `      [create] Child "${child.name}" (id=${childCreated.response_data?.id})`
              );
            } catch (err) {
              console.warn(
                `      [warn] Could not create child "${child.name}": ${err}`
              );
            }
          }
        }
      } catch (err) {
        console.warn(
          `    [warn] Could not create menu item "${item.name}": ${err}`
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== Beeper Spree Seed Script (v1 API) ===");
  console.log(`Target: ${BASE_URL}`);

  try {
    const taxonomyIds = await seedTaxonomies();
    const taxonIds = await seedTaxons(taxonomyIds);
    const { typeIds: optionTypeIds, valueIds: optionValueIds } =
      await seedOptionTypes();
    const propertyIds = await seedProperties();
    await seedProducts(taxonIds, propertyIds, optionTypeIds, optionValueIds);
    await seedMenus();

    // Note: Prototypes cannot be created via v1 API (endpoint doesn't exist).
    // They are defined in seed-spree-data.ts for reference and can be created
    // via rails runner or the Spree admin panel.
    console.log("\n--- Prototypes ---");
    console.log(
      "  [info] Prototypes defined in seed-spree-data.ts but cannot be created via API."
    );
    console.log(
      "         Create via admin panel or: docker exec -it beeper-admin-web-1 rails runner db/seed_products.rb"
    );

    console.log("\n=== Seed complete! ===\n");
  } catch (err) {
    console.error("\n[FATAL]", err);
    process.exit(1);
  }
}

main();
