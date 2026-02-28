import type { Metadata } from "next";

import { HomePageView } from "@/components/store/home-page";

export const metadata: Metadata = {
  title: "Luxury essentials",
  description: "Hero-led storefront with URL-synced catalog filters and a mocked commerce flow.",
};

export default function HomePage() {
  return <HomePageView />;
}
