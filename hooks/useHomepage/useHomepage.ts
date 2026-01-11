import { useQuery } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";
import constants from "@utilities/constants";

const API_BASE =
  process.env.NEXT_PUBLIC_SPREE_API_URL || "http://localhost:3001";

export interface HomepageSection {
  id: number;
  title?: string | null;
  section_type:
    | "hero"
    | "features"
    | "products"
    | "content"
    | "testimonials"
    | "gallery"
    | "call_to_action"
    | "newsletter"
    | "video"
    | "custom"
    | "live_streams";
  content: string;
  position: number;
  is_visible: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HomepageData {
  total_records: number;
  offset: number;
  homepage_sections: HomepageSection[];
}

export interface HomepageResponse {
  response_code: number;
  response_message: string;
  response_data: HomepageData;
}

export const fetchHomepage = async (): Promise<HomepageData> => {
  const response = await fetch(
    `${API_BASE}/api/v1/homepage_sections?visible_only=true`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch homepage sections");
  }

  const data: HomepageResponse = await response.json();

  // Parse settings if they're JSON strings
  if (data.response_data?.homepage_sections) {
    data.response_data.homepage_sections =
      data.response_data.homepage_sections.map((section) => ({
        ...section,
        settings:
          typeof section.settings === "string"
            ? JSON.parse(section.settings || "{}")
            : section.settings || {}
      }));
  }

  return data.response_data;
};

export const useHomepage = () => {
  return useQuery<HomepageData, Error>([QueryKeys.HOMEPAGE], fetchHomepage, {
    staleTime: 60000, // 1 minute
    onError: (error) => {
      console.error("Failed to fetch homepage:", error.message);
    },
    onSuccess: (data) => {
      constants.IS_DEBUG && console.log("Homepage fetched successfully:", data);
    }
  });
};
