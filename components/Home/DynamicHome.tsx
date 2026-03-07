import React, { useMemo, useRef, useEffect } from "react";
import { useHomepage, HomepageSection } from "@hooks/useHomepage";
import { Layout } from "../Layout";
import { Loading } from "../Loading";
import Hero from "./Hero";
import Products from "./Products";
import { StreamList } from "../StreamList";
import { VideoJS } from "../VideoJS";
import Featured, { FeaturedProduct } from "./Featured";
import Banner from "./Banner";
import { Features } from "./Features";
import { Testimonials } from "./Testimonials";
import { Newsletter } from "./Newsletter";
import { CallToAction } from "./CallToAction";
import { useStreams } from "@hooks/useStreams";
import { useProductFeed, FeedType } from "@hooks/useProductFeed";
import { LogoBlob } from "../LogoBlob/LogoBlob";
import { ShopMarketplaceSplit } from "./ShopMarketplaceSplit";
import { SpecsGrid } from "./SpecsGrid";

// Utility to parse settings (handles Ruby hash string or object)
function parseSettings(settings: any): any {
  if (typeof settings === "string") {
    try {
      let json = settings
        .replace(/"=>/g, '":')
        .replace(/([,{])\s*"([a-zA-Z0-9_]+)":/g, '$1"$2":')
        .replace(/:([\s\d\w\[\{\"])/g, ": $1");
      return JSON.parse(json);
    } catch {
      return {};
    }
  }
  return settings || {};
}

// Section renderers for each type (used for CMS-driven sections)
const SectionRenderers: Record<
  string,
  React.FC<{ section: HomepageSection; additionalData?: any }>
> = {
  hero: ({ section }) => {
    const settings = parseSettings(section.settings);
    return (
      <Hero
        title={section.title || undefined}
        content={section.content || undefined}
        buttonText={settings.button_text}
        buttonLink={settings.button_link}
        backgroundImage={settings.background_image}
      />
    );
  },

  live_streams: ({ section }) => {
    const { data: streamsData } = useStreams(1);
    if (!streamsData?.response_data || streamsData.response_data.length === 0)
      return null;
    return (
      <StreamList
        data={streamsData.response_data}
        title={section.title || "Live Shopping"}
      />
    );
  },

  products: ({ section }) => {
    const sectionSettings =
      parseSettings(section.settings?.settings) ||
      parseSettings(section.settings) ||
      {};
    const feedType = (sectionSettings.feedType as FeedType) || "latest";
    const customParams = sectionSettings.feedParams || {};
    const { data: feedData, isLoading } = useProductFeed(
      feedType,
      customParams
    );

    if (isLoading) return <Loading />;
    if (!feedData || !feedData.data || feedData.data.length === 0) return null;

    return (
      <Products
        products={feedData}
        title={section.title || "Featured Products"}
      />
    );
  },

  content: ({ section }) => (
    <div className="px-10 py-5">
      {section.title && (
        <h2 className="mb-4 text-2xl font-bold text-white">{section.title}</h2>
      )}
      <div dangerouslySetInnerHTML={{ __html: section.content }} />
    </div>
  ),

  video: ({ section }) => {
    const videoOptions = section.settings?.videoOptions || {
      autoplay: true,
      playsInline: true,
      controls: false,
      responsive: true,
      preload: "auto",
      muted: true,
      fluid: true,
      sources: [
        {
          src: section.settings?.videoSrc || "pol-fw-21.mp4",
          type: "video/mp4"
        }
      ]
    };
    return <VideoJS options={videoOptions} onReady={() => {}} />;
  },

  custom: ({ section }) => {
    const settings = parseSettings(section.settings);
    if (settings.componentType === "featured") {
      return (
        <Featured
          data={settings.data || []}
          title={section.title || "Featured"}
        />
      );
    }
    if (settings.componentType === "banner") {
      return <Banner data={settings.data || {}} />;
    }
    return (
      <div className="py-10">
        {section.title && (
          <h2 className="mb-4 text-2xl font-bold text-white">
            {section.title}
          </h2>
        )}
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    );
  },

  features: ({ section }) => {
    const settings = parseSettings(section.settings);
    return (
      <Features
        features={settings.features || []}
        title={section.title}
        content={section.content}
      />
    );
  },

  testimonials: ({ section }) => {
    const settings = parseSettings(section.settings);
    return (
      <Testimonials
        testimonials={settings.testimonials || []}
        title={section.title}
        content={section.content}
        displayStyle={settings.display_style || "carousel"}
      />
    );
  },

  newsletter: ({ section }) => {
    const settings = parseSettings(section.settings);
    return (
      <Newsletter
        title={section.title}
        content={section.content}
        backgroundColor={settings.background_color}
        privacyText={settings.privacy_text}
        showSocialLinks={settings.show_social_links}
      />
    );
  },

  call_to_action: ({ section }) => {
    const settings = parseSettings(section.settings);
    return (
      <CallToAction
        title={section.title}
        content={section.content}
        backgroundColor={settings.background_color}
        textColor={settings.text_color}
        buttonText={settings.button_text}
        buttonLink={settings.button_link}
      />
    );
  }
};

export const DynamicHome = () => {
  const { data: homepageData, isLoading, error } = useHomepage();
  const { data: feedData } = useProductFeed("latest", { per_page: 8 });

  // Transform Spree product feed into FeaturedProduct[] for the Featured strip
  const featuredProducts = useMemo<FeaturedProduct[] | undefined>(() => {
    if (!feedData?.data || feedData.data.length === 0) return undefined;
    const allImages =
      feedData.included?.filter((e: any) => e.type === "image") || [];
    const apiUrl = process.env.NEXT_PUBLIC_SPREE_API_URL || "";
    return feedData.data.map((item: any) => {
      const imgId = item.relationships?.images?.data?.[0]?.id;
      const imgRecord = imgId
        ? allImages.find((e: any) => e.id === imgId)
        : null;
      const imgUrl =
        imgRecord?.attributes?.styles?.[4]?.url ||
        imgRecord?.attributes?.styles?.[0]?.url;
      return {
        name: item.attributes.name,
        price: item.attributes.display_price || `$${item.attributes.price}`,
        href: `/${item.attributes.slug}`,
        image: imgUrl ? `${apiUrl}${imgUrl}` : undefined
      };
    });
  }, [feedData]);

  // Ensure video is muted for autoplay (iOS requires muted attribute set via JS)
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.play().catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (error) {
    console.error("Homepage error:", error);
  }

  // CMS-driven sections (if any)
  const cmsSections =
    homepageData?.homepage_sections?.filter((s) => s.is_visible) || [];

  // Fixed background — rendered outside <main> scroll container to avoid
  // cross-browser issues with position:fixed inside overflow:auto
  const videoBackground = (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        src="/device-rotate.mp4"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-25"
      />
      <div
        className="absolute inset-0 animate-gradient-sweep"
        style={{
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(255,0,138,0.2) 33%, rgba(0,255,255,0.15) 66%, rgba(124,58,237,0.3) 100%)",
          backgroundSize: "300% 300%",
          mixBlendMode: "overlay"
        }}
      />
    </div>
  );

  return (
    <Layout background={videoBackground}>
      <div className="relative z-10">
        {/* 0. LogoBlob Hero */}
        <section className="flex items-center justify-center py-16 md:py-20">
          <LogoBlob hasBlob isAnimated={true} showTagline={true} />
        </section>

        {/* 1. Hero Section -- Beeper Delta 8 */}
        <Hero />

        {/* 2. Featured Products Strip */}
        <Featured products={featuredProducts} />

        {/* 3. Shop / Marketplace Split */}
        <ShopMarketplaceSplit />

        {/* 4. Specs Grid */}
        <SpecsGrid />

        {/* 5. Newsletter CTA */}
        <Newsletter />

        {/* CMS-driven sections (from Spree) rendered below */}
        {cmsSections.length > 0 && (
          <div className="space-y-8 py-8">
            {cmsSections.map((section) => {
              const Renderer = SectionRenderers[section.section_type];
              if (!Renderer) {
                console.warn(
                  `No renderer found for section type: ${section.section_type}`
                );
                return null;
              }
              return (
                <div key={section.id} data-section-id={section.id}>
                  <Renderer section={section} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
