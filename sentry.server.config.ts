// Node-side Sentry (getStaticProps, getServerSideProps, API routes).
// See sentry.client.config.ts for why the SDK is pinned to 7.x.
import * as Sentry from "@sentry/nextjs";

// Server-only, so the public DSN is not required here — but fall back to it so
// a single env var is enough to turn reporting on.
const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT ||
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
      process.env.DEPLOY_ENV ||
      "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    sendDefaultPii: false
  });
}
