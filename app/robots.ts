import type { MetadataRoute } from "next";

import { getBaseUrl, toAbsoluteUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart", "/checkout", "/api"],
      },
    ],
    sitemap: [toAbsoluteUrl("/sitemap.xml")],
    host: getBaseUrl(),
  };
}
