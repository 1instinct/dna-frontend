// The creator marketplace: digital products creators sell, which the backend
// puts in one Spree taxon (dna-admin Creators.config.marketplace_taxon_permalink,
// default `marketplace`). The storefront v2 serializer adds `digital_kind` and
// `creator` ({ handle, name } or null) to their attributes.
//
// The marketplace is off until NEXT_PUBLIC_MARKETPLACE_TAXON names that taxon:
// then /browse gets a Shop / Marketplace switch and the account menu a
// Creator entry.

import {
  configuredDigitalKinds,
  DigitalKind,
  DigitalKindConfig,
  digitalKindOf,
  orderKinds
} from "./digitalKinds";

export interface CreatorRef {
  handle: string | null;
  name: string;
}

type ProductLike = { attributes?: Record<string, any> } | null | undefined;

/** The product's creator, or null for a store product. */
export const creatorOf = (p: ProductLike): CreatorRef | null => {
  const c = p?.attributes?.creator;
  if (!c || typeof c !== "object") return null;
  const handle = typeof c.handle === "string" && c.handle ? c.handle : null;
  const name = typeof c.name === "string" && c.name ? c.name : handle;
  return name ? { handle, name } : null;
};

/** The marketplace taxon's permalink, or null when the marketplace is off. */
export const marketplaceTaxonPermalink = (
  raw: string | undefined = process.env.NEXT_PUBLIC_MARKETPLACE_TAXON
): string | null => (raw || "").trim().replace(/^\/+|\/+$/g, "") || null;

export const marketplaceEnabled = (): boolean => !!marketplaceTaxonPermalink();

export type MarketplaceSort =
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "newest";

export interface MarketplaceFilter {
  kinds: DigitalKind[];
  search: string;
  sort: string;
}

const priceOf = (p: ProductLike) =>
  parseFloat(p?.attributes?.price || "0") || 0;
const nameOf = (p: ProductLike) => String(p?.attributes?.name || "");

/**
 * The marketplace grid: products with a digital kind, narrowed by kind chips
 * and a search over the name, slug and creator, then sorted.
 */
export function filterMarketplace<
  T extends { attributes?: Record<string, any> }
>(products: T[], { kinds, search, sort }: MarketplaceFilter): T[] {
  const s = search.trim().toLowerCase();
  const out = products.filter((p) => {
    const kind = digitalKindOf(p);
    if (!kind) return false;
    if (kinds.length > 0 && !kinds.includes(kind)) return false;
    if (!s) return true;
    const creator = creatorOf(p);
    return [nameOf(p), p.attributes?.slug, creator?.name, creator?.handle]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(s));
  });
  const by: Record<MarketplaceSort, (a: T, b: T) => number> = {
    name_asc: (a, b) => nameOf(a).localeCompare(nameOf(b)),
    name_desc: (a, b) => nameOf(b).localeCompare(nameOf(a)),
    price_asc: (a, b) => priceOf(a) - priceOf(b),
    price_desc: (a, b) => priceOf(b) - priceOf(a),
    newest: (a, b) =>
      new Date(b.attributes?.created_at || 0).getTime() -
      new Date(a.attributes?.created_at || 0).getTime()
  };
  return out.sort(by[sort as MarketplaceSort] || by.name_asc);
}

/** The digital kinds present in a list of products, in display order. */
export const kindsIn = (
  products: { attributes?: Record<string, any> }[]
): DigitalKind[] =>
  orderKinds(
    products.map((p) => digitalKindOf(p)).filter((k): k is DigitalKind => !!k)
  );

/**
 * The kinds a creator may apply for and make: the configured ones
 * (NEXT_PUBLIC_DIGITAL_KINDS), else a single `download` kind. Keep the list
 * in step with the backend's DigitalAssets.config.kinds.
 */
export const DEFAULT_DIGITAL_KIND = "download";

export const sellableKinds = (
  kinds: DigitalKindConfig[] = configuredDigitalKinds()
): DigitalKindConfig[] =>
  kinds.length
    ? kinds
    : [{ kind: DEFAULT_DIGITAL_KIND, label: "Download", plural: "Downloads" }];

/**
 * The creator share /creators advertises, from
 * NEXT_PUBLIC_CREATOR_SHARE_PERCENT; null (nothing said) when unset. Keep it
 * in step with the backend's Creators.config.default_share_bps.
 */
export const creatorSharePercent = (
  raw: string | undefined = process.env.NEXT_PUBLIC_CREATOR_SHARE_PERCENT
): number | null => {
  const n = Number((raw || "").trim());
  return raw && Number.isFinite(n) && n > 0 && n <= 100 ? n : null;
};
