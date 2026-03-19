import { DynamicHome } from "../components/Home";
import { FEED_CONFIGS, fetchProductFeed } from "@hooks/useProductFeed";

export async function getStaticProps() {
  try {
    const feedData = await fetchProductFeed({
      ...FEED_CONFIGS.latest,
      per_page: 8
    });
    return {
      props: { initialProducts: feedData || null },
      revalidate: 60
    };
  } catch {
    return {
      props: { initialProducts: null },
      revalidate: 60
    };
  }
}

export default function HomePage({
  initialProducts
}: {
  initialProducts: any;
}) {
  return <DynamicHome initialProducts={initialProducts} />;
}
