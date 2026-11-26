// Browser-side Sentry. Loaded automatically by @sentry/nextjs at app start.
//
// Pinned to @sentry/nextjs 7.x on purpose: 8.x and 9.x declare
// `next: ^13.2.0 || ^14 || ^15`, and this app is on Next 13.1.1. Upgrading the
// SDK means upgrading Next first.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// No DSN (local dev, or an env that has not been given one) means no init, so
// nothing is sent and nothing is logged.
if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
      process.env.DEPLOY_ENV ||
      "development",
    // Low by default: this is a storefront, and traces are billed per event.
    tracesSampleRate: Number(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1
    ),
    // The storefront renders customer addresses and order contents; do not let
    // the SDK attach request bodies, cookies or IPs on its own.
    sendDefaultPii: false
  });
}
