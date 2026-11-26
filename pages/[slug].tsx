import { GetServerSideProps } from "next";
import { ProductDetails } from "../components/ProductDetails";
import { ServiceUnavailable } from "../components/404/ServiceUnavailable";
import { Layout } from "@components/Layout";
import { resolveSlug } from "../lib/slugRoute";

interface SlugPageProps {
  type: "product" | "unavailable";
  slug: string;
}

// Server-rendered per request, so nothing here is cached: a product published
// or hidden in the admin is right on the next request. The props never carry
// product data; the page fetches what was confirmed on the client.
export const getServerSideProps: GetServerSideProps<SlugPageProps> = async ({
  params,
  res
}) => {
  const slug = params?.slug as string;
  const resolved = await resolveSlug(slug || "", {
    baseUrl:
      process.env.SPREE_API_URL ||
      process.env.NEXT_PUBLIC_SPREE_API_URL ||
      "http://localhost:8080"
  });

  switch (resolved.kind) {
    case "product":
      return { props: { type: "product", slug } };
    case "unavailable":
      // The API failed, so this may well exist. A 503 tells crawlers and caches
      // to come back, where a 404 could get a real page dropped.
      res.statusCode = 503;
      res.setHeader("Retry-After", "30");
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-Robots-Tag", "noindex");
      return { props: { type: "unavailable", slug } };
    default:
      res.setHeader("X-Robots-Tag", "noindex");
      return { notFound: true };
  }
};

export default function SlugPage({ type }: SlugPageProps) {
  if (type === "unavailable") {
    return (
      <Layout>
        <ServiceUnavailable />
      </Layout>
    );
  }

  // Confirmed visible on the server; the client hook fetches it and renders
  // not-found itself if it's hidden in the meantime.
  return <ProductDetails props={{}} />;
}
