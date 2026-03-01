import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HomePageView } from "@/components/store/home-page";
import { buildBreadcrumbJsonLd, createHomeMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createHomeMetadata();
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home" }])} />
      <HomePageView />
    </>
  );
}
