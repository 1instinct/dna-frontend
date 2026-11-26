import { createContext, useContext } from "react";
import { useQuery } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";
import { fetchHomepage } from "@hooks/useHomepage/useHomepage";
import { resolveAppLinks } from "@lib/appLinks";
import type { AppLink } from "@lib/appLinks";
import { selectAnnouncement, selectAppLinkOverride } from "@lib/announcement";
import type { Announcement } from "@lib/announcement";

export interface AppPresence {
  banner: Announcement | null;
  links: AppLink[];
}

const envPresence = (): AppPresence => ({
  banner: null,
  links: resolveAppLinks(null)
});

export const AppPresenceContext = createContext<AppPresence>(envPresence());

/** The announcement bar and app links from the visible homepage sections. */
export const fetchAppPresence = async (): Promise<AppPresence> => {
  // fetchHomepage already parses Ruby-hash-style settings into objects.
  const data = await fetchHomepage();
  const sections = data?.homepage_sections || [];
  return {
    banner: selectAnnouncement(sections),
    links: resolveAppLinks(selectAppLinkOverride(sections))
  };
};

/** Internal: one fetch per page, seeded with the env links. */
export const useAppPresenceQuery = (): AppPresence => {
  const { data } = useQuery<AppPresence, Error>(
    [QueryKeys.APP_PRESENCE],
    fetchAppPresence,
    {
      staleTime: 5 * 60 * 1000,
      initialData: envPresence(),
      // Seed renders at once but counts as stale, so mount still fetches.
      initialDataUpdatedAt: 0,
      onError: (error) => {
        console.error("Failed to fetch app presence:", error.message);
      }
    }
  );
  return data ?? envPresence();
};

/** Context reader for every placement. Never undefined, never throws. */
export const useAppPresence = (): AppPresence => useContext(AppPresenceContext);
