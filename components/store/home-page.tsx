"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { CatalogView } from "@/components/store/catalog-view";

export function HomePageView() {
  const { copy } = useLanguage();

  return (
    <CatalogView
      title={copy.homeTitle}
      eyebrow="Veloura Collection"
      description={copy.homeDescription}
      promoLabel={copy.homePromoLabel}
      promoCopy={copy.homePromoCopy}
      syncWithUrl
      enablePagination
    />
  );
}
