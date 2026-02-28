import type { Metadata } from "next";

import { CatalogView } from "@/components/store/catalog-view";

export const metadata: Metadata = {
  title: "Luxury essentials",
  description: "Hero-led storefront with URL-synced catalog filters and a mocked commerce flow.",
};

export default function HomePage() {
  return (
    <CatalogView
      title="Luxury loungewear and lingerie with editorial restraint."
      eyebrow="Veloura Collection"
      description="Discover a tightly curated edit of balconette silhouettes, ceremony-ready layers and soft lounge staples designed with a luxury minimal point of view."
      promoLabel="Private client offer"
      promoCopy="Complimentary express dispatch on orders over $180 and discreet packaging across the entire mock collection."
      syncWithUrl
      enablePagination
    />
  );
}
