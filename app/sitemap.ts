import type { MetadataRoute } from "next";

import { getCategories, getProducts } from "@/lib/medusa/client";
import { toAbsoluteUrl } from "@/lib/seo/metadata";

const LOCALES = ["es", "en"] as const;

function localizedEntries(
  path: string,
  options: { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number },
  now: Date,
): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: toAbsoluteUrl(`/${locale}${path}`),
    lastModified: now,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, toAbsoluteUrl(`/${l}${path}`)])),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return [
    ...localizedEntries("/", { changeFrequency: "daily", priority: 1 }, now),
    ...localizedEntries("/grid", { changeFrequency: "daily", priority: 0.9 }, now),
    ...categories.flatMap((category) =>
      localizedEntries(
        `/category/${category.slug}`,
        { changeFrequency: "weekly", priority: 0.8 },
        now,
      ),
    ),
    ...products.flatMap((product) =>
      localizedEntries(
        `/product/${product.slug}`,
        { changeFrequency: "weekly", priority: 0.7 },
        now,
      ),
    ),
  ];
}
