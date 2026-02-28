import type { Metadata } from "next";

import { brand } from "@/lib/brand";
import type { Category, Product } from "@/types/catalog";

export function createBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(brand.url),
    title: {
      default: brand.defaultTitle,
      template: `%s | ${brand.name}`,
    },
    description: brand.shortDescription,
    openGraph: {
      title: brand.defaultTitle,
      description: brand.shortDescription,
      siteName: brand.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: brand.defaultTitle,
      description: brand.shortDescription,
    },
  };
}

export function createCategoryMetadata(category: Category): Metadata {
  const title = `${category.name} Collection`;

  return {
    title,
    description: category.description,
    openGraph: {
      title: `${brand.name} ${title}`,
      description: category.description,
      type: "website",
    },
  };
}

export function createProductMetadata(product: Product, category?: Category): Metadata {
  const description = product.description;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${brand.name} ${product.name}`,
      description,
      type: "website",
    },
    keywords: [...product.tags, product.categorySlug, brand.name],
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    category: category?.name,
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildProductJsonLd(product: Product, category?: Category) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: category?.name ?? product.categorySlug,
    sku: product.id,
    image: product.images,
    brand: {
      "@type": "Brand",
      name: brand.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: `${brand.url}/product/${product.slug}`,
    },
  };
}
