import { createRequire } from "node:module";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const require = createRequire(import.meta.url);

const isDev = process.env.NODE_ENV === "development";

const securityHeaders: Array<{ key: string; value: string }> = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://picsum.photos http://localhost:9000",
      "media-src 'self' blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://r.stripe.com https://m.stripe.network https://*.ingest.us.sentry.io",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self' https://api.stripe.com",
    ].join("; "),
  },
];

function createBundleAnalyzer() {
  try {
    const withAnalyzer = require("@next/bundle-analyzer");
    return withAnalyzer({
      enabled: process.env.ANALYZE === "true",
    }) as (config: NextConfig) => NextConfig;
  } catch {
    if (process.env.ANALYZE === "true") {
      console.warn(
        "Bundle analysis requested but @next/bundle-analyzer is not installed. Install it to enable visual reports.",
      );
    }

    return (config: NextConfig) => config;
  }
}

const withBundleAnalyzer = createBundleAnalyzer();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  typescript: {
    tsconfigPath: "./tsconfig.build.json",
  },
  images: {
    qualities: [75, 84],
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      {
        protocol: "http",
        hostname: "161.132.40.176",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: "veloura-qx",
  project: "veloura-store",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
