import { GetServerSideProps } from "next";
import { ProductDetails } from "../components/ProductDetails";
import { UserProfile } from "../components/UserProfile";
import { Layout } from "@components/Layout";

const RESERVED_SLUGS = [
  "cart",
  "checkout",
  "login",
  "signup",
  "account",
  "browse",
  "about",
  "terms",
  "privacy",
  "home",
  "reset-password",
  "thank-you",
  "update-email",
  "update-password"
];

interface SlugPageProps {
  type: "product" | "profile";
  slug: string;
  productData?: any;
  profileData?: any;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  if (!slug || RESERVED_SLUGS.includes(slug)) {
    return { notFound: true };
  }

  // 1. Try product lookup by slug
  const spreeUrl =
    process.env.NEXT_PUBLIC_SPREE_API_URL || "http://localhost:8080";
  try {
    const productRes = await fetch(
      `${spreeUrl}/api/v2/storefront/products?filter[slug]=${encodeURIComponent(slug)}&include=images,variants,option_types`,
      { headers: { "Content-Type": "application/vnd.api+json" } }
    );
    if (productRes.ok) {
      const productData = await productRes.json();
      if (productData.data && productData.data.length > 0) {
        return {
          props: { type: "product", slug, productData }
        };
      }
    }
  } catch {
    // Product lookup failed, try profile
  }

  // 2. Try creator profile lookup by username
  // Phase 3: update URL to /api/v1/creator_profiles/:username when ready
  try {
    const profileRes = await fetch(
      `${spreeUrl}/api/v1/users/by_username/${encodeURIComponent(slug)}`,
      { headers: { "Content-Type": "application/json" } }
    );
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      return {
        props: { type: "profile", slug, profileData }
      };
    }
  } catch {
    // Profile lookup failed
  }

  // 3. Neither found — fall back to client-side product detail rendering
  // (lets ProductDetails handle its own loading/404 via useProduct hook)
  return {
    props: { type: "product", slug }
  };
};

export default function SlugPage({
  type,
  slug,
  productData,
  profileData
}: SlugPageProps) {
  if (type === "profile" && profileData) {
    return (
      <Layout>
        <UserProfile username={slug} />
      </Layout>
    );
  }

  // Default: render product details (client-side hook handles loading)
  return <ProductDetails props={{}} />;
}
