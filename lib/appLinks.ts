// Where "get the app" callouts point. The admin can set an iOS and an Android
// link (the `app_links` homepage section); NEXT_PUBLIC_IOS_APP_URL and
// NEXT_PUBLIC_ANDROID_APP_URL are the build-time fallback.
//
// Pure: no I/O, no window access, so it runs the same in getStaticProps and in
// the browser. An empty result is a valid outcome and means "render no links".
//
// Validation is per value: an override that is blank or not an absolute
// http(s) URL is discarded and the env fallback is then tried on its own
// merits. A platform with no usable URL is left out, never rendered broken.

export type AppPlatform = "ios" | "android";
export type AppLinkKind = "beta" | "store";

export interface AppLink {
  platform: AppPlatform;
  href: string;
  label: string;
  kind: AppLinkKind;
}

export interface AppLinkOverride {
  ios_url?: string;
  android_url?: string;
}

/** A TestFlight invite is a beta; any other URL is treated as a store listing. */
const TESTFLIGHT_HOST = "testflight.apple.com";

// The store labels are deliberately NOT "Download on the App Store" / "Get it
// on Google Play": those are Apple's and Google's badge lockups, and both
// vendors' guidelines treat them as artwork, not as copy. These are text
// buttons, so the wording has to be our own.
const LABELS: Record<AppPlatform, Record<AppLinkKind, string>> = {
  ios: {
    beta: "Join the iOS beta",
    store: "Get the iOS app"
  },
  android: {
    beta: "Join the Android beta",
    store: "Get the Android app"
  }
};

/** The trimmed value if it is an absolute http(s) URL, else null. */
export const validUrl = (value: string | undefined | null): string | null => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return null;
  try {
    const { protocol } = new URL(trimmed);
    return protocol === "http:" || protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
};

/** The build-time fallback links (NEXT_PUBLIC_IOS_APP_URL / NEXT_PUBLIC_ANDROID_APP_URL). */
export const envAppLinks = (): AppLinkOverride => ({
  ios_url: process.env.NEXT_PUBLIC_IOS_APP_URL || "",
  android_url: process.env.NEXT_PUBLIC_ANDROID_APP_URL || ""
});

const buildLink = (
  platform: AppPlatform,
  override: string | undefined,
  fallback: string | undefined
): AppLink | null => {
  const href = validUrl(override) ?? validUrl(fallback);
  if (!href) return null;
  const kind: AppLinkKind =
    new URL(href).hostname === TESTFLIGHT_HOST ? "beta" : "store";
  return { platform, href, label: LABELS[platform][kind], kind };
};

/**
 * The app links to show, iOS first. Each platform takes the admin override if
 * it is valid, otherwise the fallback (the env links by default) if that is
 * valid, otherwise it is omitted. May return an empty array.
 */
export const resolveAppLinks = (
  override?: AppLinkOverride | null,
  fallback: AppLinkOverride = envAppLinks()
): AppLink[] =>
  [
    buildLink("ios", override?.ios_url, fallback.ios_url),
    buildLink("android", override?.android_url, fallback.android_url)
  ].filter((link): link is AppLink => link !== null);

/** Callout wording. `heading` is for the section variant; `body` is used by both. */
export interface AppCalloutCopy {
  heading: string;
  body: string;
}

const PLATFORM_NAMES: Record<AppPlatform, string> = {
  ios: "iPhone",
  android: "Android"
};

/** "iPhone", "Android" or "iPhone and Android": only platforms that are in the list. */
const platformPhrase = (links: AppLink[]): string =>
  links.map((link) => PLATFORM_NAMES[link.platform]).join(" and ");

/**
 * The callout copy for a set of resolved links.
 *
 * An admin who pastes a store URL must not be left with surrounding copy that
 * still announces a beta, and an admin who has only filled in one platform
 * must not get copy implying the other one exists. So every word here is
 * derived from `links` and nothing is hardcoded to a platform or to the beta.
 */
export const appCalloutCopy = (links: AppLink[]): AppCalloutCopy => {
  const store = links.filter((link) => link.kind === "store");
  const beta = links.filter((link) => link.kind === "beta");

  if (links.length === 0) {
    // The component renders nothing in this state; copy still has to be honest.
    return { heading: "Our app", body: "Our app is on its way." };
  }

  if (store.length === 0) {
    return {
      heading: "Try the app beta",
      body: `The app beta is open on ${platformPhrase(beta)}.`
    };
  }

  if (beta.length === 0) {
    return {
      heading: "Get the app",
      body: `The app is out now on ${platformPhrase(store)}.`
    };
  }

  return {
    heading: "Get the app",
    body: `The app is out now on ${platformPhrase(
      store
    )}, with a beta on ${platformPhrase(beta)}.`
  };
};
