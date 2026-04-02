import { RouteScrollReset } from "@/components/providers/route-scroll-reset";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-6 focus:py-3 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <RouteScrollReset />
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-8 sm:py-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
