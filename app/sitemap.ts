import type { MetadataRoute } from "next";

import { getMockCategories } from "@/lib/data/mock-categories";
import { getMockProducts } from "@/lib/data/mock-products";
import { toAbsoluteUrl } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: toAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...getMockCategories().map((category) => ({
      url: toAbsoluteUrl(`/category/${category.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...getMockProducts().map((product) => ({
      url: toAbsoluteUrl(`/product/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
