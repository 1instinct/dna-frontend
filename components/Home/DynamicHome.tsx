import React from "react";
import { useHomepage, HomepageSection } from "@hooks/useHomepage";
import { Layout } from "../Layout";
import { Loading } from "../Loading";
import Hero from "./Hero";
import Products from "./Products";
import { StreamList } from "../StreamList";
import { VideoJS } from "../VideoJS";
import Featured from "./Featured";
import Banner from "./Banner";
import { Features } from "./Features";
import { Testimonials } from "./Testimonials";
import { Newsletter } from "./Newsletter";
import { CallToAction } from "./CallToAction";
import { useStreams } from "@hooks/useStreams";
import { useProductFeed, FeedType } from "@hooks/useProductFeed";

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

// Section renderers for each type
const SectionRenderers: Record<
  string,
  React.FC<{ section: HomepageSection; additionalData?: any }>
> = {
  hero: () => <Hero />,

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
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          {section.title}
        </h2>
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
          <h2 className="mb-4 text-2xl font-bold text-foreground">
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
        <div className="px-5 py-24 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Unable to load page
          </h2>
          <p className="mt-2 text-muted-foreground">
            Please try again later.
          </p>
        </div>
      </Layout>
    );
  }

  const sections =
    homepageData?.homepage_sections?.filter((s) => s.is_visible) || [];

  return (
    <Layout>
      <div className="space-y-8">
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

        {sections.length === 0 && (
          <div className="px-5 py-24 text-center">
            <h2 className="text-2xl font-bold text-foreground">Welcome</h2>
            <p className="mt-2 text-muted-foreground">
              Content coming soon...
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};
