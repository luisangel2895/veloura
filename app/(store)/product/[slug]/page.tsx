import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { ProductDetail } from "@/components/store/product-detail";
import { getMockCategoryBySlug } from "@/lib/data/mock-categories";
import { getMockProductBySlug } from "@/lib/data/mock-products";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  createProductMetadata,
} from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getMockProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  const category = getMockCategoryBySlug(product.categorySlug);

  return createProductMetadata(product, category);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getMockProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = getMockCategoryBySlug(product.categorySlug);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          ...(category
            ? [
                {
                  name: category.name,
                  url: `/category/${category.slug}`,
                },
              ]
            : []),
          { name: product.name },
        ])}
      />
      <JsonLd data={buildProductJsonLd(product, category)} />
      <ProductDetail slug={product.slug} initialProduct={product} category={category} />
    </>
  );
}
