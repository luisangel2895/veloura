import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogView } from "@/components/store/catalog-view";
import { getCategoryBySlug } from "@/lib/medusa/client";
import { buildBreadcrumbJsonLd, createCategoryMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category not found",
    };
  }

  return createCategoryMetadata(category);
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home", url: "/" }, { name: category.name }])} />
      <CatalogView
        title={`${category.name} Collection`}
        eyebrow={category.heroEyebrow}
        description={category.description}
        promoLabel="Category spotlight"
        promoCopy="Persistent size and sort controls stay active while the route keeps this category fixed."
        lockedCategory={category.slug}
        seoCopy={category.seoCopy}
      />
    </>
  );
}
