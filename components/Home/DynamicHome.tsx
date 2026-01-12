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
import { Features } from "./Features";
import { Testimonials } from "./Testimonials";
import { Newsletter } from "./Newsletter";
import { CallToAction } from "./CallToAction";
import { useProducts } from "@hooks/useProducts";
import { useStreams } from "@hooks/useStreams";
import { useProductFeed, FeedType } from "@hooks/useProductFeed";

// Utility to parse settings (handles Ruby hash string or object)
function parseSettings(settings: any): any {
  if (typeof settings === "string") {
    try {
      // Convert Ruby hash rocket to JSON colon, add quotes, and parse
      let json = settings
        .replace(/"=>/g, '":')
        .replace(/([,{])\s*"([a-zA-Z0-9_]+)":/g, '$1"$2":') // ensure keys are quoted
        .replace(/:([\s\d\w\[\{\"])/g, ": $1");
      return JSON.parse(json);
    } catch {
      return {};
    }
  }
  return settings || {};
}

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
      parseSettings(section.settings?.settings) ||
      parseSettings(section.settings) ||
      {};

    // Get feed type from section settings, default to "latest"
    const feedType = (sectionSettings.feedType as FeedType) || "latest";

    // Get custom parameters from section settings
    const customParams = sectionSettings.feedParams || {};

    // Use product feed hook
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
    <div style={{ padding: "20px 40px" }}>
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
    const settings = parseSettings(section.settings);
    // For custom sections, render based on settings or content
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
    // Default custom rendering
    return (
      <div style={{ padding: "40px 0" }}>
        {section.title && <h2>{section.title}</h2>}
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    );
  },

  features: ({ section }) => {
    const settings = parseSettings(section.settings);
    const features = settings.features || [];
    return (
      <Features
        features={features}
        title={section.title}
        content={section.content}
      />
    );
  },

  testimonials: ({ section }) => {
    const settings = parseSettings(section.settings);
    const testimonials = settings.testimonials || [];
    const displayStyle = settings.display_style || "carousel";
    return (
      <Testimonials
        testimonials={testimonials}
        title={section.title}
        content={section.content}
        displayStyle={displayStyle}
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
