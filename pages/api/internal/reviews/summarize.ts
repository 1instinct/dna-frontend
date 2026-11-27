/**
 * POST /api/internal/reviews/summarize  (M7.2)
 *
 * Called by dna-admin's `rake reviews:dispatch` (and the admin "Regenerate"
 * button) with `Authorization: Bearer ${INTERNAL_CRON_SECRET}`. Pulls up to
 * 10 stale products from dna-admin, asks Claude to summarize each product's
 * retail reviews, and PUTs the result back.
 *
 * Responses:
 * - 200 `{ processed, failed, skipped }`
 * - 401 wrong or missing secret · 405 not POST
 * - 503 `INTERNAL_CRON_SECRET`, `ANTHROPIC_API_KEY` or
 *   `DNA_ADMIN_SERVICE_TOKEN` missing
 * - 502 the stale list couldn't be loaded
 *
 * `skipped` counts products with nothing to summarize (no written reviews, or
 * the product is gone), products not started because the feature was switched
 * off mid-run (PUT 503) or the time budget ran out.
 *
 * Never logs review text, model output or secrets: only product ids, HTTP
 * statuses and error reasons.
 *
 * Note on time limits: `export const config = { maxDuration }` is a Vercel
 * setting, and this app runs as a Node server in Docker/k8s, where it has no
 * effect. The caller allows 300 s to read, so the route stops starting new
 * products after `START_BUDGET_MS` instead.
 */
import { createHash, timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import { isAnthropicConfigured } from "../../../../lib/ai/anthropic";
import {
  ReviewsForSummary,
  ReviewSummaryError,
  ReviewSummaryPutBody,
  summarizeProduct,
  SummarizeOptions
} from "../../../../lib/ai/reviewSummary";
import {
  dnaAdminFetch,
  isDnaAdminServiceConfigured
} from "../../../../lib/api/dnaAdminFetch";
import { isDnaApiError } from "../../../../lib/api/dnaFetch";

export const STALE_LIMIT = 10;
export const CONCURRENCY = 3;
/** Don't start another product after this long (caller reads for 300 s). */
const START_BUDGET_MS = 180_000;

export interface StaleProduct {
  product_id: number;
  slug: string;
  name: string;
  reviews_count: number;
  summarized_count: number;
  generated_at: string | null;
}

export interface SummarizeResult {
  processed: number;
  failed: number;
  skipped: number;
}

type Outcome = "processed" | "failed" | "skipped";

/** Constant-time comparison (hashing first makes lengths equal). */
const safeEqual = (a: string, b: string): boolean => {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

const readBearer = (req: NextApiRequest): string | null => {
  const header = req.headers.authorization;
  if (typeof header !== "string") return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
};

const describeError = (error: unknown): string => {
  if (error instanceof ReviewSummaryError) {
    return error.refusalCategory
      ? `${error.reason} (${error.refusalCategory})`
      : error.reason;
  }
  if (isDnaApiError(error)) return `dna-admin HTTP ${error.status}`;
  if (error && typeof error === "object" && "status" in error) {
    // Anthropic.APIError and friends carry a numeric status.
    const status = (error as { status?: unknown }).status;
    const name = (error as { name?: unknown }).name;
    return `${typeof name === "string" ? name : "Error"} ${String(status)}`;
  }
  return error instanceof Error ? error.name : "unknown error";
};

export interface RunOptions extends SummarizeOptions {
  now?: () => number;
}

/** Runs one batch. Exported for tests; the handler wraps it. */
export async function runSummarizeBatch(
  options: RunOptions = {}
): Promise<SummarizeResult> {
  const now = options.now ?? Date.now;
  const startedAt = now();

  const stale = await dnaAdminFetch<{ data?: StaleProduct[] }>(
    "/admin/review_summaries/stale",
    { query: { limit: STALE_LIMIT } }
  );
  const queue = (stale?.data ?? []).slice(0, STALE_LIMIT);
  const result: SummarizeResult = { processed: 0, failed: 0, skipped: 0 };
  let stopped = false;

  const processOne = async (item: StaleProduct): Promise<Outcome> => {
    const productId = item.product_id;
    let input: ReviewsForSummary;
    try {
      input = await dnaAdminFetch<ReviewsForSummary>(
        `/admin/products/${encodeURIComponent(
          String(productId)
        )}/reviews_for_summary`
      );
    } catch (error) {
      if (isDnaApiError(error) && error.status === 404) return "skipped";
      throw error;
    }

    let body: ReviewSummaryPutBody;
    try {
      body = await summarizeProduct(input, options);
    } catch (error) {
      if (
        error instanceof ReviewSummaryError &&
        error.reason === "no_reviews"
      ) {
        return "skipped";
      }
      throw error;
    }

    try {
      await dnaAdminFetch(
        `/admin/review_summaries/${encodeURIComponent(String(productId))}`,
        { method: "PUT", body }
      );
    } catch (error) {
      if (isDnaApiError(error) && error.status === 503) {
        // AI summary was switched off in admin: stop the batch.
        stopped = true;
        return "skipped";
      }
      throw error;
    }
    return "processed";
  };

  let next = 0;
  const worker = async () => {
    while (next < queue.length) {
      const item = queue[next];
      next += 1;
      if (stopped || now() - startedAt > START_BUDGET_MS) {
        result.skipped += 1;
        continue;
      }
      try {
        const outcome = await processOne(item);
        result[outcome] += 1;
      } catch (error) {
        result.failed += 1;
        // Ids and statuses only: never review text, output or secrets.
        console.error(
          `[reviews/summarize] product ${
            item.product_id
          } failed: ${describeError(error)}`
        );
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker)
  );
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.INTERNAL_CRON_SECRET;
  if (!secret) {
    return res.status(503).json({ error: "Not configured" });
  }
  const provided = readBearer(req);
  if (!provided || !safeEqual(provided, secret)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!isAnthropicConfigured() || !isDnaAdminServiceConfigured()) {
    return res.status(503).json({ error: "Not configured" });
  }

  try {
    const result = await runSummarizeBatch();
    console.info(
      `[reviews/summarize] processed=${result.processed} failed=${result.failed} skipped=${result.skipped}`
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error(
      `[reviews/summarize] couldn't load stale products: ${describeError(
        error
      )}`
    );
    return res.status(502).json({
      error: "Couldn't load stale products",
      processed: 0,
      failed: 0,
      skipped: 0
    });
  }
}
