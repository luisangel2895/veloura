"use client";

import { HomeHero } from "@/components/sections/home-hero";
import { HomePromoBanner } from "@/components/sections/home-promo-banner";
import { useLanguage } from "@/components/providers/language-provider";
import { CatalogView } from "@/components/store/catalog-view";

export function HomePageView() {
  const { copy } = useLanguage();

  return (
    <div className="-mt-8 space-y-10 pb-16">
      <HomeHero />
      <HomePromoBanner label={copy.homePromoLabel} copy={copy.homePromoCopy} />
      <CatalogView
        title={copy.homeTitle}
        eyebrow="Veloura Collection"
        description={copy.homeDescription}
        promoLabel={copy.homePromoLabel}
        promoCopy={copy.homePromoCopy}
        syncWithUrl
        enablePagination
        showIntroSection={false}
        showPromoBanner={false}
        sectionId="collection"
        collectionTitle="The Collection"
        collectionDescription="Curated silhouettes across balconette cuts, ceremony dressing, sets and sculpted body pieces."
      />
    </div>
  );
}
