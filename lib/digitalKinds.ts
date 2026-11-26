// Digital products: Spree products whose variant carries a published digital
// asset (dna-admin's Spree::DigitalAsset). Each asset has a `kind`, a short
// snake_case word the backend allows through DigitalAssets.config.kinds; the
// storefront v2 product serializer sends the live asset's kind as
// `digital_kind` (null for ordinary products).
//
// Which kinds exist and what they are called is the product's choice, so the
// storefront reads them from NEXT_PUBLIC_DIGITAL_KINDS: a comma-separated list
// of `kind`, `kind:Label` or `kind:Label:Plural label`, in display order.
//
//   NEXT_PUBLIC_DIGITAL_KINDS=ebook:E-book:E-books,course,template
//
// Empty means any kind the backend sends, labelled from its name
// ("video_course" -> "Video course", plural "Video courses"); a kind the list
// leaves out still shows, labelled the same way.

export type DigitalKind = string;

export interface DigitalKindConfig {
  kind: DigitalKind;
  label: string;
  plural: string;
}

const KIND_RE = /^[a-z0-9_]+$/;

export const isDigitalKind = (v: unknown): v is DigitalKind =>
  typeof v === "string" && KIND_RE.test(v);

/** "video_course" -> "Video course". */
export const humanizeKind = (kind: string): string => {
  const words = kind.replace(/_+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "";
};

/** "Course" -> "Courses", "Family" -> "Families", "Box" -> "Boxes". */
export const pluralize = (label: string): string => {
  if (/[^aeiou]y$/i.test(label)) return `${label.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(label)) return `${label}es`;
  return `${label}s`;
};

/** The configured kinds, in order. Malformed and repeated entries are skipped. */
export function parseDigitalKinds(
  raw: string | undefined
): DigitalKindConfig[] {
  const seen = new Set<string>();
  const out: DigitalKindConfig[] = [];
  for (const entry of (raw || "").split(",")) {
    const [kindPart, labelPart, pluralPart] = entry.split(":");
    const kind = (kindPart || "").trim();
    if (!isDigitalKind(kind) || seen.has(kind)) continue;
    seen.add(kind);
    const label = (labelPart || "").trim() || humanizeKind(kind);
    const plural = (pluralPart || "").trim() || pluralize(label);
    out.push({ kind, label, plural });
  }
  return out;
}

export const configuredDigitalKinds = (): DigitalKindConfig[] =>
  parseDigitalKinds(process.env.NEXT_PUBLIC_DIGITAL_KINDS);

/** The label for a kind: the configured one, else derived from its name. */
export function kindLabel(
  kind: DigitalKind,
  plural = false,
  kinds: DigitalKindConfig[] = configuredDigitalKinds()
): string {
  const found = kinds.find((k) => k.kind === kind);
  if (found) return plural ? found.plural : found.label;
  const label = humanizeKind(kind);
  return plural ? pluralize(label) : label;
}

/**
 * Kinds in display order: the configured ones first, then any others in
 * `present` alphabetically.
 */
export function orderKinds(
  present: DigitalKind[],
  kinds: DigitalKindConfig[] = configuredDigitalKinds()
): DigitalKind[] {
  const configured = kinds.map((k) => k.kind);
  const others = Array.from(new Set(present))
    .filter((k) => !configured.includes(k))
    .sort();
  return [...configured.filter((k) => present.includes(k)), ...others];
}

type ProductLike = { attributes?: Record<string, any> } | null | undefined;

/** The product's digital kind (`digital_kind`), or null for an ordinary product. */
export const digitalKindOf = (p: ProductLike): DigitalKind | null => {
  const k = p?.attributes?.digital_kind;
  return isDigitalKind(k) ? k : null;
};

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
