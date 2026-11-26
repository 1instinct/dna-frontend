// The buyer's library (/account/library): the digital products the signed-in
// user owns, from dna-admin's GET /api/v1/library, grouped for display, and
// what a product page says a download includes (GET
// /api/v1/products/:slug/digital_summary).

import {
  DigitalKind,
  DigitalKindConfig,
  configuredDigitalKinds,
  formatBytes,
  orderKinds
} from "./digitalKinds";

export interface AssetFile {
  id: number;
  filename: string;
  byte_size: number;
  content_type: string;
  md5?: string;
  sha256?: string | null;
  url?: string;
}

export type LibrarySource = "order" | "iap" | "grant" | "free";

export interface LibraryItem {
  ownership_id: number;
  variant_id: number;
  product: {
    id: number;
    slug: string;
    name: string;
    image_url: string | null;
    creator: { handle: string | null; name: string | null } | null;
  };
  kind: DigitalKind;
  asset: {
    id: number;
    version: number;
    byte_size: number;
    manifest: Record<string, any>;
    files: AssetFile[];
  } | null;
  source: LibrarySource;
  granted_at: string;
  revoked_at: string | null;
}

export interface LibraryLink {
  file_id: number;
  url: string;
  expires_at: string;
}

/** The public summary of a digital product. Apps may add their own keys. */
export interface DigitalSummary {
  product_id?: number;
  slug?: string;
  kind: DigitalKind;
  version?: number;
  file_count?: number;
  byte_size?: number;
  files?: { filename: string; byte_size: number; content_type: string }[];
  creator?: { handle: string | null; name: string | null } | null;
  [extra: string]: unknown;
}

export const LIBRARY_SOURCE_LABELS: Record<LibrarySource, string> = {
  order: "Bought",
  iap: "Bought in app",
  grant: "Gift",
  free: "Free"
};

export interface LibraryGroup {
  kind: DigitalKind;
  items: LibraryItem[];
}

const time = (iso?: string | null) => {
  const t = iso ? new Date(iso).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
};

/**
 * Items grouped by kind (configured kinds first, then the rest by name),
 * newest first within a kind. Revoked items stay listed for a few days (the
 * backend decides how long), after the active ones.
 */
export function groupLibrary(
  items: LibraryItem[],
  kinds: DigitalKindConfig[] = configuredDigitalKinds()
): LibraryGroup[] {
  const valid = items.filter((i) => typeof i.kind === "string" && i.kind);
  return orderKinds(
    valid.map((i) => i.kind),
    kinds
  ).map((kind) => ({
    kind,
    items: valid
      .filter((i) => i.kind === kind)
      .sort(
        (a, b) =>
          Number(!!a.revoked_at) - Number(!!b.revoked_at) ||
          time(b.granted_at) - time(a.granted_at)
      )
  }));
}

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

/** "3 files · 12.4 MB": what the download holds. Empty when unknown. */
export function includedLine(s: DigitalSummary | null | undefined): string {
  if (!s) return "";
  const parts: string[] = [];
  if (s.file_count) parts.push(plural(s.file_count, "file"));
  if (s.byte_size) parts.push(formatBytes(s.byte_size));
  return parts.join(" · ");
}

/**
 * A link that opens a library item in the product's native app, from
 * NEXT_PUBLIC_APP_LIBRARY_URL (e.g. `exampleapp://library`) plus the variant
 * id. Null when no app link is configured, so no "Open in app" shows.
 */
export function libraryAppLink(
  variantId: number | string,
  base: string | undefined = process.env.NEXT_PUBLIC_APP_LIBRARY_URL
): string | null {
  const root = (base || "").trim().replace(/\/+$/, "");
  if (!root || !/^[a-z][a-z0-9+.-]*:/i.test(root)) return null;
  if (/^(javascript|data|vbscript|file):/i.test(root)) return null;
  return `${root}/${encodeURIComponent(String(variantId))}`;
}
