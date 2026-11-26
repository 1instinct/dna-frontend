import React, { useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Layout } from "@components/Layout";
import { ProductList } from "@components/ProductList";
import { Button } from "@components/ui";
import { cn } from "@lib/utils";
import {
  ListingKind,
  humanizeSlug,
  listingBreadcrumbs,
  listingHref,
  useListingResolution
} from "@hooks/useTaxons";
import {
  DEFAULT_LISTING_SORT,
  LISTING_SORTS,
  useProductListing
} from "@hooks/useProductListing";

export interface ProductListingProps {
  kind: ListingKind;
  /** Normalized route param (see normalizeListingSlug). */
  slug: string;
}

const KIND_LABEL: Record<ListingKind, string> = {
  category: "Category",
  tag: "Tag"
};

const parsePage = (raw: unknown): number => {
  const page = parseInt(String(Array.isArray(raw) ? raw[0] : raw ?? ""), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const parseSort = (raw: unknown): string => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return LISTING_SORTS.some((option) => option.value === value)
    ? (value as string)
    : DEFAULT_LISTING_SORT;
};

/** 1 … 4 5 6 … 12: first, last, and the current page's neighbours. */
const pageWindow = (current: number, total: number): Array<number | "gap"> => {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1
      ? (["gap", page] as Array<number | "gap">)
      : [page]
  );
};

const PageShell = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Layout>
    <Head>
      <title>{`${title} | ${
        process.env.NEXT_PUBLIC_PAGE_TITLE || "DNA"
      }`}</title>
    </Head>
    <div className="min-h-screen w-full bg-background px-5 py-10 md:px-10">
      <div className="mx-auto max-w-[1400px]">{children}</div>
    </div>
  </Layout>
);

const Spinner = () => (
  <div className="flex min-h-[400px] items-center justify-center">
    <div
      role="status"
      aria-label="Loading products"
      className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-brand"
    />
  </div>
);

const EmptyState = ({
  title,
  message,
  action
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl bg-card px-5 py-20 text-center">
    <SearchX
      aria-hidden="true"
      className="mb-4 h-10 w-10 text-muted-foreground/50"
    />
    <h2 className="mb-3 font-title text-lg text-foreground">{title}</h2>
    <p className="mb-6 max-w-md font-body text-sm text-muted-foreground">
      {message}
    </p>
    {action}
  </div>
);

const BrowseAllButton = () => (
  <Button asChild className="bg-brand font-title text-white hover:bg-brand/90">
    <Link href="/browse">Browse all products</Link>
  </Button>
);

/**
 * Product listing for /category/[category] (a taxon) and /tag/[tag] (a taxon
 * under "Tags", or a product name search when there is none). Page and sort
 * live in the query string (?page=2&sort=price).
 */
export const ProductListing: React.FC<ProductListingProps> = ({
  kind,
  slug
}) => {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const page = parsePage(router.query.page);
  const sort = parseSort(router.query.sort);
  const kindLabel = KIND_LABEL[kind];

  const resolution = useListingResolution(kind, slug);
  const source = resolution.data;
  const taxon = source?.status === "taxon" ? source.taxon : null;
  const nameQuery = source?.status === "search" ? source.query : undefined;

  const products = useProductListing(
    { taxonId: taxon?.id, name: nameQuery, page, sort },
    !!taxon || !!nameQuery
  );

  const setQuery = (next: { page?: number; sort?: string }) => {
    const query: Record<string, string> = { [kind]: slug };
    const nextPage = next.page ?? page;
    const nextSort = next.sort ?? sort;
    if (nextPage > 1) query.page = String(nextPage);
    if (nextSort !== DEFAULT_LISTING_SORT) query.sort = nextSort;
    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false
    });
    topRef.current?.scrollIntoView({ block: "start" });
  };

  const heading =
    taxon?.name ||
    (source?.status === "search" ? source.label : humanizeSlug(slug));

  if (resolution.isLoading) {
    return (
      <PageShell title={heading}>
        <Spinner />
      </PageShell>
    );
  }

  const tagWithoutMatches =
    source?.status === "search" &&
    products.isSuccess &&
    !products.data?.meta?.total_count;

  if (!slug || source?.status === "not_found" || tagWithoutMatches) {
    const label = kindLabel.toLowerCase();
    return (
      <PageShell title={`${kindLabel} not found`}>
        <EmptyState
          title={`${kindLabel} not found`}
          message={
            slug
              ? `We couldn't find the ${label} “${slug}”. It may have been renamed or removed.`
              : `No ${label} was given.`
          }
          action={<BrowseAllButton />}
        />
      </PageShell>
    );
  }

  if (resolution.isError) {
    return (
      <PageShell title={heading}>
        <EmptyState
          title="Something went wrong"
          message={`We couldn't load this ${kindLabel.toLowerCase()}. Please try again.`}
          action={
            <Button variant="outline" onClick={() => resolution.refetch()}>
              Try again
            </Button>
          }
        />
      </PageShell>
    );
  }

  const crumbs = taxon ? listingBreadcrumbs(kind, taxon) : [];
  const totalCount = products.data?.meta?.total_count ?? 0;
  const totalPages = Math.max(1, products.data?.meta?.total_pages ?? 1);
  const items = products.data?.data ?? [];

  return (
    <PageShell title={taxon?.metaTitle || heading}>
      {taxon?.metaDescription && (
        <Head>
          <meta name="description" content={taxon.metaDescription} />
        </Head>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 font-body text-sm text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-brand">
              Home
            </Link>
          </li>
          {(crumbs.length > 0
            ? crumbs.slice(0, -1)
            : [{ name: `${kindLabel}s` }]
          ).map((crumb: { name: string; href?: string }, index) => (
            <li
              key={`${index}-${crumb.name}`}
              className="flex items-center gap-1.5"
            >
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-brand"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span>{crumb.name}</span>
              )}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
            <span aria-current="page" className="text-foreground">
              {heading}
            </span>
          </li>
        </ol>
      </nav>

      {/* Heading */}
      <div ref={topRef} className="mb-6 scroll-mt-6">
        <p className="mb-1 font-title text-xs uppercase tracking-widest text-brand">
          {kindLabel}
        </p>
        <h1 className="break-words font-title text-3xl font-bold uppercase tracking-wider text-foreground">
          {heading}
        </h1>
        {taxon?.description && (
          <p className="mt-3 max-w-2xl font-body text-sm text-muted-foreground">
            {taxon.description}
          </p>
        )}
        {taxon && taxon.children.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {taxon.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={listingHref(kind, child.permalink)}
                  className="inline-flex rounded-full border border-border px-4 py-1.5 font-body text-sm text-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Count + sort bar (same as /browse) */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-border/30 bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center">
        <span className="font-title text-sm font-semibold text-foreground">
          {products.isLoading
            ? "Loading…"
            : `${totalCount} ${totalCount === 1 ? "product" : "products"}`}
        </span>
        <label className="flex items-center gap-2.5">
          <span className="whitespace-nowrap font-body text-sm text-muted-foreground">
            Sort by:
          </span>
          <select
            value={sort}
            onChange={(event) =>
              setQuery({ page: 1, sort: event.target.value })
            }
            className="w-auto cursor-pointer rounded-lg border border-border bg-background px-3 py-2 pr-8 font-body text-sm text-foreground transition-colors hover:border-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {LISTING_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Products */}
      {products.isLoading ? (
        <Spinner />
      ) : products.isError ? (
        <EmptyState
          title="Couldn't load products"
          message="Something went wrong while loading these products. Please try again."
          action={
            <Button variant="outline" onClick={() => products.refetch()}>
              Try again
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={page > 1 ? "No more products" : "No products here yet"}
          message={
            page > 1
              ? "This page is past the end of the list."
              : `Nothing is listed under ${heading} right now. Check back soon.`
          }
          action={
            page > 1 ? (
              <Button variant="outline" onClick={() => setQuery({ page: 1 })}>
                Back to page 1
              </Button>
            ) : (
              <BrowseAllButton />
            )
          }
        />
      ) : (
        <div
          className={cn(
            "transition-opacity",
            products.isFetching && products.isPreviousData && "opacity-60"
          )}
        >
          <ProductList products={products.data} title="" />
        </div>
      )}

      {/* Pagination (same style as account/favorites) */}
      {totalPages > 1 && items.length > 0 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => setQuery({ page: page - 1 })}
            disabled={page <= 1}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageWindow(page, totalPages).map((entry, index) =>
            entry === "gap" ? (
              <span
                key={`gap-${index}`}
                aria-hidden="true"
                className="px-1 text-muted-foreground"
              >
                …
              </span>
            ) : (
              <button
                type="button"
                key={entry}
                aria-current={entry === page ? "page" : undefined}
                onClick={() => setQuery({ page: entry })}
                className={cn(
                  "flex h-9 min-w-[36px] cursor-pointer items-center justify-center rounded-lg border px-3 font-body text-sm transition-colors",
                  entry === page
                    ? "border-brand bg-brand font-semibold text-white"
                    : "border-border bg-background text-foreground hover:bg-muted"
                )}
              >
                {entry}
              </button>
            )
          )}
          <button
            type="button"
            aria-label="Next page"
            onClick={() => setQuery({ page: page + 1 })}
            disabled={page >= totalPages}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </PageShell>
  );
};
