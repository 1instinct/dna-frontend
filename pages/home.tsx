import { DynamicHome } from "../components/Home";
import { FEED_CONFIGS, fetchProductFeed } from "@hooks/useProductFeed";
import { fetchHomepage, HomepageData } from "@hooks/useHomepage";

export async function getStaticProps() {
  try {
    const [feedData, homepageData] = await Promise.all([
      fetchProductFeed({ ...FEED_CONFIGS.latest, per_page: 8 }).catch(() => null),
      fetchHomepage().catch(() => null),
    ]);
    return {
      props: {
        initialProducts: feedData || null,
        initialHomepage: homepageData || null,
      },
      revalidate: 60
    };
  } catch {
    return {
      props: { initialProducts: null, initialHomepage: null },
      revalidate: 60
    };
  }
}

export default function HomePage({
  initialProducts,
  initialHomepage
}: {
  initialProducts: any;
  initialHomepage: HomepageData | null;
}) {
  return <DynamicHome initialProducts={initialProducts} initialHomepage={initialHomepage} />;
}
