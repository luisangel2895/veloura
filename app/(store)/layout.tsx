import { RouteScrollReset } from "@/components/providers/route-scroll-reset";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <RouteScrollReset />
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
