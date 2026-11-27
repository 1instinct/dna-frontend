/**
 * Server-only Anthropic client for dna-frontend's AI features.
 *
 * - The client is created lazily from `ANTHROPIC_API_KEY` (never a
 *   `NEXT_PUBLIC_` variable) the first time it is needed, so importing this
 *   module never throws and never reads the key at build time.
 * - `withRefusalFallback` opts a request into the API's server-side refusal
 *   fallback: `fallbacks: "default"` behind the
 *   `server-side-fallback-2026-07-01` beta. On a safety-classifier decline the
 *   API re-runs the same request on Anthropic's recommended fallback model for
 *   that refusal category, inside the same call. If the whole chain declines,
 *   the response still ends with `stop_reason: "refusal"`, so callers must
 *   check `stop_reason` before reading `content`.
 */
import Anthropic from "@anthropic-ai/sdk";

/** Model for review summaries (design doc › AI). */
export const CLAUDE_MODEL = "claude-opus-5-5";

/** Beta header that enables the `fallbacks: "default"` scalar form. */
export const SERVER_SIDE_FALLBACK_BETA = "server-side-fallback-2026-07-01";

/** Per-request timeout. The cron caller allows 300 s for the whole batch. */
const REQUEST_TIMEOUT_MS = 120_000;

export class AnthropicConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnthropicConfigError";
    Object.setPrototypeOf(this, AnthropicConfigError.prototype);
  }
}

export const isAnthropicConfigured = (): boolean =>
  Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | undefined;

/**
 * Returns the shared client, creating it on first use. Throws
 * `AnthropicConfigError` in the browser or when `ANTHROPIC_API_KEY` is unset.
 */
export function getAnthropicClient(): Anthropic {
  if (typeof window !== "undefined") {
    throw new AnthropicConfigError(
      "The Anthropic client is server-only and must not run in the browser."
    );
  }
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AnthropicConfigError("ANTHROPIC_API_KEY is not set.");
  }
  client = new Anthropic({
    apiKey,
    timeout: REQUEST_TIMEOUT_MS,
    maxRetries: 2
  });
  return client;
}

/** Drops the cached client (tests, or after rotating the key). */
export function resetAnthropicClient(): void {
  client = undefined;
}

type BetaCreateParams = Anthropic.Beta.Messages.MessageCreateParamsNonStreaming;

/**
 * Adds the server-side refusal fallback to a `client.beta.messages.create`
 * request: `fallbacks: "default"` plus the `server-side-fallback-2026-07-01`
 * beta (merged with any betas the request already lists).
 */
export function withRefusalFallback(
  params: BetaCreateParams
): BetaCreateParams {
  const betas = params.betas ?? [];
  return {
    ...params,
    betas: betas.includes(SERVER_SIDE_FALLBACK_BETA)
      ? betas
      : [...betas, SERVER_SIDE_FALLBACK_BETA],
    fallbacks: "default"
  };
}

/**
 * True when a fallback model ran for this response (a `fallback_message`
 * entry in `usage.iterations`). Pair with `stop_reason !== "refusal"` to know
 * the fallback actually served it; `response.model` names the serving model.
 */
export function servedByFallback(
  message: Anthropic.Beta.Messages.BetaMessage
): boolean {
  const iterations = message.usage?.iterations ?? [];
  return iterations.some((entry) => entry.type === "fallback_message");
}
