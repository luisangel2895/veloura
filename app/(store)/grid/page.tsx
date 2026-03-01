import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogView } from "@/components/store/catalog-view";
import {
  buildBreadcrumbJsonLd,
  createGridMetadata,
} from "@/lib/seo/metadata";

export const metadata: Metadata = createGridMetadata();
export const revalidate = 300;

export default function GridPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Grid" },
        ])}
      />
      <CatalogView
        title="Shop the Collection"
        eyebrow="Editorial Catalog"
        description="Explore the full Veloura edit with performance-tuned browsing, polished filters and a clean luxury product grid."
        promoLabel="Catalog preview"
        promoCopy="The same state-driven filters and sorting logic power this dedicated grid route for SEO and direct linking."
        syncWithUrl
        enablePagination
      />
    </>
  );
}
