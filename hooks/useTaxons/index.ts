import { useQuery } from "react-query";
import { QueryKeys } from "../queryKeys";

/**
 * Taxon lookups for the /category/[category] and /tag/[tag] listing pages.
 *
 * Spree's storefront API filters products by taxon *id* (`filter[taxons]`),
 * so a URL slug is first resolved to a taxon through
 * `GET /api/v2/storefront/taxons/:permalink`, which accepts a permalink or an
 * id. Plain `fetch` (like hooks/useProduct) so it also runs during SSR.
 */

export type ListingKind = "category" | "tag";

export interface ListingTaxonLink {
  id: string;
  name: string;
  permalink: string;
}

export interface ListingTaxon extends ListingTaxonLink {
  /** "Categories -> Women -> Tops" */
  prettyName: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  depth: number;
  children: ListingTaxonLink[];
}

/**
 * - `taxon`: list the products classified under this taxon (and its descendants).
 * - `search`: a tag with no taxon of its own; list products whose name matches.
 * - `not_found`: no such category.
 */
export type ListingResolution =
  | { status: "taxon"; taxon: ListingTaxon }
  | { status: "search"; query: string; label: string }
  | { status: "not_found" };

/** Spree's default category taxonomy; its taxons are `categories/<slug>`. */
const CATEGORY_ROOT = "categories";
/** Tags map to taxons only when a "Tags" taxonomy (permalink root `tags`) exists. */
const TAG_ROOT = "tags";

interface RequestOptions {
  signal?: AbortSignal;
}

const apiBase = () =>
  `${process.env.NEXT_PUBLIC_SPREE_API_URL || ""}/api/v2/storefront`;

const encodePermalink = (permalink: string) =>
  permalink.split("/").map(encodeURIComponent).join("/");

/** Lowercases and trims a route param; Next has already URL-decoded it. */
export const normalizeListingSlug = (raw: unknown): string => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
        .replace(/^\/+|\/+$/g, "")
    : "";
};

/** "wrap-top" -> "Wrap Top" */
export const humanizeSlug = (slug: string): string =>
  slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const toTaxonLink = (node: any): ListingTaxonLink => ({
  id: String(node.id),
  name: node.attributes?.name ?? "",
  permalink: node.attributes?.permalink ?? ""
});

const toListingTaxon = (json: any): ListingTaxon => {
  const node = json.data;
  const attrs = node.attributes ?? {};
  const childIds: string[] = (node.relationships?.children?.data ?? []).map(
    (child: any) => String(child.id)
  );
  const children = (json.included ?? [])
    .filter((inc: any) => inc.type === "taxon" && childIds.includes(inc.id))
    .map(toTaxonLink);

  return {
    ...toTaxonLink(node),
    prettyName: attrs.pretty_name ?? attrs.name ?? "",
    description: attrs.description ?? null,
    metaTitle: attrs.meta_title ?? null,
    metaDescription: attrs.meta_description ?? null,
    depth: Number(attrs.depth ?? 0),
    children
  };
};

/** Fetches a taxon by permalink or id. Resolves `null` on 404; throws on other failures. */
export const fetchTaxon = async (
  permalinkOrId: string,
  { signal }: RequestOptions = {}
): Promise<ListingTaxon | null> => {
  if (!permalinkOrId) return null;
  const res = await fetch(
    `${apiBase()}/taxons/${encodePermalink(permalinkOrId)}?include=children`,
    { headers: { "Content-Type": "application/json" }, signal }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Taxon request failed: ${res.status}`);
  return toListingTaxon(await res.json());
};

/** First page (API max 100) of all taxons, for matching a bare slug. */
const fetchAllTaxonLinks = async ({ signal }: RequestOptions = {}): Promise<
  Array<ListingTaxonLink & { depth: number }>
> => {
  const res = await fetch(`${apiBase()}/taxons?per_page=100`, {
    headers: { "Content-Type": "application/json" },
    signal
  });
  if (!res.ok) throw new Error(`Taxons request failed: ${res.status}`);
  const json = await res.json();
  return (json.data ?? []).map((node: any) => ({
    ...toTaxonLink(node),
    depth: Number(node.attributes?.depth ?? 0)
  }));
};

const lastSegment = (permalink: string) =>
  permalink.split("/").filter(Boolean).pop() || "";

/**
 * /category/<slug>: `categories/<slug>` first, then `<slug>` as a full
 * permalink or id (e.g. "categories" itself, or "brands/acme"), then any
 * taxon whose permalink ends in `/<slug>` (shallowest wins).
 */
const resolveCategory = async (
  slug: string,
  options: RequestOptions
): Promise<ListingResolution> => {
  const candidates = Array.from(new Set([`${CATEGORY_ROOT}/${slug}`, slug]));
  for (const candidate of candidates) {
    const taxon = await fetchTaxon(candidate, options);
    if (taxon) return { status: "taxon", taxon };
  }

  if (!slug.includes("/")) {
    const match = (await fetchAllTaxonLinks(options))
      .filter((link) => lastSegment(link.permalink) === slug)
      .sort((a, b) => a.depth - b.depth)[0];
    const taxon = match ? await fetchTaxon(match.permalink, options) : null;
    if (taxon) return { status: "taxon", taxon };
  }

  return { status: "not_found" };
};

/**
 * /tag/<slug>: the storefront API has no product tag filter, so a tag is the
 * taxon `tags/<slug>` when a "Tags" taxonomy exists, and otherwise a product
 * name search. Hyphens become `_` (a one-character ILIKE wildcard), so
 * "rib-knit" matches "Rib-Knit" and "Rib Knit".
 */
const resolveTag = async (
  slug: string,
  options: RequestOptions
): Promise<ListingResolution> => {
  const taxon = await fetchTaxon(`${TAG_ROOT}/${slug}`, options);
  if (taxon) return { status: "taxon", taxon };
  return {
    status: "search",
    query: slug.replace(/[-\s]+/g, "_"),
    label: humanizeSlug(slug)
  };
};

export const resolveListing = async (
  kind: ListingKind,
  slug: string,
  options: RequestOptions = {}
): Promise<ListingResolution> => {
  if (!slug) return { status: "not_found" };
  return kind === "category"
    ? resolveCategory(slug, options)
    : resolveTag(slug, options);
};

export const listingResolutionKey = (kind: ListingKind, slug: string) => [
  QueryKeys.LISTING_TAXON,
  kind,
  slug
];

/** Seeded by the page's getServerSideProps; fetched in the browser if SSR could not. */
export const useListingResolution = (kind: ListingKind, slug: string) =>
  useQuery(
    listingResolutionKey(kind, slug),
    ({ signal }) => resolveListing(kind, slug, { signal }),
    { enabled: !!slug, staleTime: 5 * 60 * 1000, retry: 1 }
  );

/**
 * The listing URL for a taxon permalink: `categories/tops` -> `/category/tops`,
 * `tags/sale` -> `/tag/sale`. Deeper or foreign permalinks keep their path
 * (`/category/women%2Ftops`), which the resolver accepts as a permalink.
 */
export const listingHref = (kind: ListingKind, permalink: string): string => {
  const root = kind === "category" ? CATEGORY_ROOT : TAG_ROOT;
  const rest = permalink.startsWith(`${root}/`)
    ? permalink.slice(root.length + 1)
    : permalink;
  return `/${kind}/${encodeURIComponent(rest)}`;
};

export interface ListingCrumb {
  name: string;
  href?: string;
}

/**
 * Ancestors from `pretty_name` and `permalink` (one name per path segment).
 * The taxonomy root is plain text; ancestors link; the taxon itself is last.
 */
export const listingBreadcrumbs = (
  kind: ListingKind,
  taxon: ListingTaxon
): ListingCrumb[] => {
  const names = taxon.prettyName.split(" -> ");
  const segments = taxon.permalink.split("/");
  if (names.length !== segments.length) return [{ name: taxon.name }];
  return names.map((name, index) => ({
    name,
    href:
      index > 0 && index < names.length - 1
        ? listingHref(kind, segments.slice(0, index + 1).join("/"))
        : undefined
  }));
};
