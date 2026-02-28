import type { Metadata } from "next";

import { brand } from "@/lib/brand";
import type { Category, Product } from "@/types/catalog";

export function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configured) {
    return "http://localhost:3000";
  }

  try {
    const normalized = configured.endsWith("/") ? configured.slice(0, -1) : configured;
    return new URL(normalized).toString().replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}

export function getMetadataBase() {
  return new URL(getBaseUrl());
}

export function toAbsoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, getMetadataBase()).toString();
}

function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  category,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  category?: string;
}): Metadata {
  const socialTitle = `${title} | ${brand.name}`;

  return {
    title,
    description,
    keywords,
    category,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: brand.name,
      type: "website",
      images: ["/brand/veloura-logo.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: ["/brand/veloura-logo.png"],
    },
  };
}

export function createBaseMetadata(): Metadata {
  return {
    metadataBase: getMetadataBase(),
    title: {
      default: brand.defaultTitle,
      template: `%s | ${brand.name}`,
    },
    description: brand.shortDescription,
    icons: {
      icon: [
        {
          url: "/brand/veloura-logo.png",
          type: "image/png",
        },
      ],
      shortcut: ["/brand/veloura-logo.png"],
      apple: [
        {
          url: "/brand/veloura-logo.png",
          type: "image/png",
        },
      ],
    },
    openGraph: {
      title: brand.defaultTitle,
      description: brand.shortDescription,
      url: "/",
      siteName: brand.name,
      type: "website",
      images: ["/brand/veloura-logo.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: brand.defaultTitle,
      description: brand.shortDescription,
      images: ["/brand/veloura-logo.png"],
    },
  };
}

export function createHomeMetadata(): Metadata {
  return buildPageMetadata({
    title: "Luxury essentials",
    description: "Hero-led storefront with URL-synced catalog filters and a mocked commerce flow.",
    path: "/",
  });
}

export function createCategoryMetadata(category: Category): Metadata {
  return buildPageMetadata({
    title: `${category.name} Collection`,
    description: category.description,
    path: `/category/${category.slug}`,
  });
}

export function createProductMetadata(product: Product, category?: Category): Metadata {
  return buildPageMetadata({
    title: product.name,
    description: product.description,
    path: `/product/${product.slug}`,
    keywords: [...product.tags, product.categorySlug, brand.name],
    category: category?.name,
  });
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const listItem: Record<string, unknown> = {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
      };

      if (item.url) {
        listItem.item = toAbsoluteUrl(item.url);
      }

      return listItem;
    }),
  };
}

export function buildProductJsonLd(product: Product, category?: Category) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: category?.name ?? product.categorySlug,
    sku: product.slug,
    image: product.images.map((image) => toAbsoluteUrl(image)),
    brand: {
      "@type": "Brand",
      name: brand.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: toAbsoluteUrl(`/product/${product.slug}`),
    },
  };
}
