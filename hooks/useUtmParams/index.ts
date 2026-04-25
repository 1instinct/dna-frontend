export interface UtmParams {
  utm_medium?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ad_id?: string;
  adset_id?: string;
  campaign_id?: string;
  ad_name?: string;
  adset_name?: string;
  campaign_name?: string;
  placement?: string;
  site_source_name?: string;
}

const STORAGE_KEY = "allrise_utm_params";

const UTM_KEYS: (keyof UtmParams)[] = [
  "utm_medium",
  "utm_source",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ad_id",
  "adset_id",
  "campaign_id",
  "ad_name",
  "adset_name",
  "campaign_name",
  "placement",
  "site_source_name"
];

export function captureUtmParams(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);

  const hasUtmParams = UTM_KEYS.some((key) => params.has(key));
  if (!hasUtmParams) return;

  // First-touch attribution: don't overwrite existing data
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return;

  const utmData: UtmParams = {};
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utmData[key] = value;
    }
  });

  if (Object.keys(utmData).length > 0) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(utmData));
    } catch {
      // localStorage may be unavailable (private browsing, quota exceeded)
    }
  }
}

export function getStoredUtmParams(): UtmParams | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UtmParams;
  } catch {
    return null;
  }
}

export function clearUtmParams(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
