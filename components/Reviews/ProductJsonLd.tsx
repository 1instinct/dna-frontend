import React from "react";
import Head from "next/head";
import { REVIEWS_ENABLED } from "@lib/reviews";
import { useProductReviews, useReviewSummary } from "@hooks/useReviews";
import type { Review, ReviewSummary } from "../../types/reviews";

/* The storefront v2 product response is loosely typed across the app. */
type JsonApiResource = {
  id: string;
  type: string;
  attributes?: Record<string, any>;
  relationships?: Record<string, any>;
};

interface ProductResponse {
  data?: JsonApiResource;
  included?: JsonApiResource[];
}

interface ProductJsonLdProps {
  product: ProductResponse | undefined;
  /** Same id/slug the reviews queries are keyed by. */
  productId: string | undefined;
}

const absoluteUrl = (url: string | undefined | null, base: string) => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${base.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
};

const stripHtml = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || undefined;
};

/** Keeps `</script>` and friends out of the inline JSON. */
const serialize = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

const reviewJsonLd = (review: Review) => {
  const entry: Record<string, unknown> = {
    "@type": "Review",
    author: { "@type": "Person", name: review.display_name },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1
    }
  };
  if (review.published_at)
    entry.datePublished = review.published_at.slice(0, 10);
  if (review.title) entry.name = review.title;
  if (review.body) entry.reviewBody = review.body;
  return entry;
};

/** Builds the schema.org Product object. Exported for testing. */
export const buildProductJsonLd = (
  product: ProductResponse,
  summary: ReviewSummary | undefined,
  reviews: Review[]
): Record<string, unknown> | null => {
  const data = product.data;
  const attrs = data?.attributes;
  if (!data || !attrs?.name) return null;

  const apiBase = process.env.NEXT_PUBLIC_SPREE_API_URL || "";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  const included = product.included || [];

  const images = included
    .filter((item) => item.type === "image")
    .map((image) => {
      const styles: Array<{ url?: string; width?: string | number }> =
        image.attributes?.styles || [];
      const style =
        styles.find((s) => String(s.width) === "600") ||
        styles[styles.length - 1];
      return absoluteUrl(style?.url, apiBase);
    })
    .filter(Boolean) as string[];

  const brandProperty = included.find(
    (item) =>
      item.type === "product_property" &&
      /^brand$/i.test(
        String(item.attributes?.name || item.attributes?.presentation || "")
      )
  );

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: attrs.name
  };
  if (images.length) jsonLd.image = images;
  const description = stripHtml(attrs.description);
  if (description) jsonLd.description = description;
  if (attrs.sku) jsonLd.sku = String(attrs.sku);
  if (brandProperty?.attributes?.value) {
    jsonLd.brand = { "@type": "Brand", name: brandProperty.attributes.value };
  }

  const price = attrs.price;
  if (price !== undefined && price !== null && price !== "") {
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      price: String(price),
      priceCurrency: attrs.currency || "USD"
    };
    if (typeof attrs.in_stock === "boolean") {
      offer.availability = attrs.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";
    }
    if (siteUrl && attrs.slug) offer.url = `${siteUrl}/${attrs.slug}`;
    jsonLd.offers = offer;
  }

  // Retail data only (the summary passed in is the retail scope).
  if (summary && summary.ratings_count >= 1 && summary.average > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(summary.average * 10) / 10,
      reviewCount: summary.ratings_count,
      bestRating: 5,
      worstRating: 1
    };
    if (reviews.length) jsonLd.review = reviews.map(reviewJsonLd);
  }

  return jsonLd;
};

/**
 * `<script type="application/ld+json">` for the PDP: Product, offers,
 * AggregateRating (only with at least one rating) and the first page of
 * retail reviews, which is the page SSR renders visibly. It reads the review
 * queries from the cache without fetching. Retail PDPs only, and nothing
 * at all while NEXT_PUBLIC_REVIEWS_ENABLED is off.
 */
export const ProductJsonLd = ({ product, productId }: ProductJsonLdProps) => {
  const summaryQuery = useReviewSummary(productId, "retail", {
    enabled: false
  });
  const reviewsQuery = useProductReviews(
    productId,
    { scope: "retail" },
    { enabled: false }
  );

  // Ships dark with the rest of the reviews work.
  if (!REVIEWS_ENABLED || !product) return null;
  const summary =
    summaryQuery.data?.scope === "retail" ? summaryQuery.data : undefined;
  const firstPage = reviewsQuery.data?.pages?.[0];
  const reviews = (firstPage?.data || []).filter(
    (review) => review.channel === "retail"
  );
  const jsonLd = buildProductJsonLd(product, summary, reviews);
  if (!jsonLd) return null;

  return (
    <Head>
      <script
        key="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialize(jsonLd) }}
      />
    </Head>
  );
};

export default ProductJsonLd;
