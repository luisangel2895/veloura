"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useCart } from "@/hooks/use-cart";

export function SiteHeader() {
  const { totalItems, lastAddedAt } = useCart((state) => ({
    totalItems: state.totalItems,
    lastAddedAt: state.lastAddedAt,
  }));
  const { copy } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-xl dark:border-amber-500/10 dark:bg-background/88">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              Veloura
            </p>
            <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted-foreground">
              Intimate Atelier
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link
            href="/category/balconette"
            className="uppercase tracking-[0.22em] hover:text-foreground"
          >
            {copy.headerNavBalconette}
          </Link>
          <Link
            href="/category/bridal"
            className="uppercase tracking-[0.22em] hover:text-foreground"
          >
            {copy.headerNavBridal}
          </Link>
          <Link
            href="/category/bodysuits"
            className="uppercase tracking-[0.22em] hover:text-foreground"
          >
            {copy.headerNavBodysuits}
          </Link>
          <Link
            href="/category/lounge"
            className="uppercase tracking-[0.22em] hover:text-foreground"
          >
            {copy.headerNavLounge}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <Link
            href="/cart"
            data-testid="cart-button"
            className="relative inline-flex h-10 items-center justify-center px-1 text-muted-foreground transition-colors hover:text-foreground dark:text-amber-100 dark:hover:text-amber-50"
            aria-label={copy.headerCart}
          >
            <span
              key={`cart-icon-${lastAddedAt || 0}`}
              className={lastAddedAt ? "inline-flex animate-cart-nudge" : "inline-flex"}
            >
              <ShoppingBag className="size-5" />
            </span>
            <span
              key={`cart-badge-${lastAddedAt || 0}-${totalItems}`}
              className={`absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-700 px-1.5 text-[0.65rem] font-semibold text-amber-50 dark:bg-amber-300 dark:text-zinc-950 ${
                lastAddedAt
                  ? "animate-cart-badge-pop shadow-[0_8px_20px_-10px_rgba(180,140,52,0.9)] dark:shadow-[0_8px_20px_-10px_rgba(252,211,77,0.55)]"
                  : ""
              }`}
            >
              {totalItems}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
