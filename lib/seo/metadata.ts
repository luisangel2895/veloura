import type { Metadata } from "next";

import { brand } from "@/lib/brand";
import type { Category, Product } from "@/types/catalog";

const socialImagePath = "/brand/veloura-logo.png";
const defaultKeywords = [
  brand.name,
  "luxury lingerie",
  "editorial ecommerce",
  "next.js commerce",
  "stripe checkout",
];

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
    keywords: [...defaultKeywords, ...(keywords ?? [])],
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
      images: [
        {
          url: socialImagePath,
          width: 512,
          height: 512,
          alt: `${brand.name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImagePath],
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
    applicationName: brand.name,
    keywords: defaultKeywords,
    referrer: "strict-origin-when-cross-origin",
    icons: {
      icon: [
        {
          url: socialImagePath,
          type: "image/png",
        },
      ],
      shortcut: [socialImagePath],
      apple: [
        {
          url: socialImagePath,
          type: "image/png",
        },
      ],
    },
    appleWebApp: {
      capable: true,
      title: brand.name,
      statusBarStyle: "default",
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: brand.defaultTitle,
      description: brand.shortDescription,
      url: "/",
      siteName: brand.name,
      type: "website",
      images: [
        {
          url: socialImagePath,
          width: 512,
          height: 512,
          alt: `${brand.name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: brand.defaultTitle,
      description: brand.shortDescription,
      images: [socialImagePath],
    },
  };
}

export function createHomeMetadata(): Metadata {
  return buildPageMetadata({
    title: "Luxury essentials",
    description:
      "Modern editorial lingerie storefront with luxury product discovery, URL-synced catalog filters and Stripe-ready checkout architecture.",
    path: "/",
  });
}

export function createGridMetadata(): Metadata {
  return buildPageMetadata({
    title: "Shop the collection",
    description:
      "Browse the full Veloura catalog with editorial product cards, live filtering and a performance-tuned product grid.",
    path: "/grid",
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

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: getBaseUrl(),
    logo: toAbsoluteUrl(socialImagePath),
    description: brand.shortDescription,
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
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: brand.name,
      },
      url: toAbsoluteUrl(`/product/${product.slug}`),
    },
  };
}
