import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: process.env.VERCEL_ENV === "production" ? 0.2 : 1.0,
  debug: false,
  enabled: process.env.NODE_ENV !== "development",
});
