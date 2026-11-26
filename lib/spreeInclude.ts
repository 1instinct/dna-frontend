// `include=videos` makes a backend without the product_video relationship
// answer 400 ("videos is not specified as a relationship ..."), which would
// blank every product list. The backend is meant to deploy first, but if the
// web goes out early (or a dev points at an older admin) we retry once without
// videos and stop asking for a while. "A while", not "for good": on the server
// this module lives as long as the Node process, so a permanent flag would keep
// getStaticProps/ISR from ever asking again after the backend deploys.

export const VIDEOS_RETRY_AFTER_MS = 10 * 60 * 1000;

let unsupportedUntil = 0;

/** Append `videos` to a JSON:API include list unless the backend rejected it recently. */
export function withVideos(include: string, now: number = Date.now()): string {
  if (now < unsupportedUntil) return include;
  const parts = include.split(",").filter(Boolean);
  return parts.includes("videos") ? include : [...parts, "videos"].join(",");
}

export function withoutVideos(include: string): string {
  return include
    .split(",")
    .filter((p) => p && p !== "videos")
    .join(",");
}

/** True for the 400 a backend without the relationship returns. */
export function isVideosIncludeError(
  status: number | undefined | null,
  message: string | undefined | null
): boolean {
  return status === 400 && /videos/i.test(String(message || ""));
}

export function markVideosUnsupported(now: number = Date.now()): void {
  unsupportedUntil = now + VIDEOS_RETRY_AFTER_MS;
}

/** Test hook. */
export function resetVideosSupport(): void {
  unsupportedUntil = 0;
}

/** (status, message) from a Spree SDK error or an Error carrying `status`. */
export function describeRequestError(err: unknown): {
  status?: number;
  message?: string;
} {
  const e = (err || {}) as {
    status?: number;
    message?: string;
    summary?: string;
    serverResponse?: { status?: number; data?: { error?: string } };
  };
  return {
    status: e.serverResponse?.status ?? e.status,
    message: [e.summary, e.serverResponse?.data?.error, e.message]
      .filter(Boolean)
      .join(" ")
  };
}

/**
 * Run a request with `videos` in the include; if it fails with the
 * unsupported-relationship 400, mark it and run once more without.
 * `describe` pulls (status, message) from whatever the request threw.
 */
export async function requestWithVideosFallback<T>(
  include: string,
  run: (include: string) => Promise<T>,
  describe: (err: unknown) => { status?: number; message?: string }
): Promise<T> {
  const first = withVideos(include);
  try {
    return await run(first);
  } catch (err) {
    if (first === include) throw err;
    const { status, message } = describe(err);
    if (!isVideosIncludeError(status, message)) throw err;
    markVideosUnsupported();
    return run(withoutVideos(include));
  }
}
