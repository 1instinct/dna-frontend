import React from "react";
import { useHomepage, HomepageSection } from "@hooks/useHomepage";
import { Layout, Loading } from "../components";
import { Content } from "./StaticHome.styles";
import Hero from "./Hero";
import Products from "./Products";
import { StreamList } from "../StreamList";
import { VideoJS } from "..";
import Featured from "./Featured";
import Banner from "./Banner";
import { useProducts } from "@hooks/useProducts";
import { useStreams } from "@hooks/useStreams";
import { useProductFeed, FeedType } from "@hooks/useProductFeed";

// Section renderers for each type
const SectionRenderers: Record<
  string,
  React.FC<{ section: HomepageSection; additionalData?: any }>
> = {
  hero: ({ section }) => <Hero />,

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
    // Parse nested settings if needed (API returns settings within settings)
    const sectionSettings =
      section.settings?.settings || section.settings || {};

    // Get feed type from section settings, default to "latest"
    const feedType = (sectionSettings.feedType as FeedType) || "latest";

    // Get custom parameters from section settings
    const customParams = sectionSettings.feedParams || {};

    // Use product feed hook
    const { data: feedData, isLoading } = useProductFeed(
      feedType,
      customParams
    );

    console.log("Product feed data:", feedData);
    console.log("Has data array?", feedData?.data);
    console.log("Data length:", feedData?.data?.length);

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
    <div style={{ padding: "40px 0" }}>
      {section.title && <h2>{section.title}</h2>}
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
    // For custom sections, render based on settings or content
    if (section.settings?.componentType === "featured") {
      return (
        <Featured
          data={section.settings?.data || []}
          title={section.title || "Featured"}
        />
      );
    }
    if (section.settings?.componentType === "banner") {
      return <Banner data={section.settings?.data || {}} />;
    }
    // Default custom rendering
    return (
      <div style={{ padding: "40px 0" }}>
        {section.title && <h2>{section.title}</h2>}
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    );
  }
};

export const DynamicHome = () => {
  const { data: homepageData, isLoading, error } = useHomepage();

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (error) {
    console.error("Homepage error:", error);
    return (
      <Layout>
        <Content>
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <h2>Unable to load page</h2>
            <p>Please try again later.</p>
          </div>
        </Content>
      </Layout>
    );
  }

  const sections =
    homepageData?.homepage_sections?.filter((s) => s.is_visible) || [];

  return (
    <Layout>
      <Content>
        {/* Render dynamic sections */}
        {sections.map((section) => {
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

        {/* Fallback if no sections */}
        {sections.length === 0 && (
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <h2>Welcome</h2>
            <p>Content coming soon...</p>
          </div>
        )}
      </Content>
    </Layout>
  );
};
