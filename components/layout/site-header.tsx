"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const [cartAnnouncement, setCartAnnouncement] = useState("");

  useEffect(() => {
    if (lastAddedAt > 0 && totalItems > 0) {
      setCartAnnouncement(
        `${copy.productAddedToCart}. ${totalItems} ${totalItems === 1 ? "item" : "items"} in cart.`,
      );
      const timer = setTimeout(() => setCartAnnouncement(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedAt, totalItems, copy.productAddedToCart]);

  const categoryLinks = [
    {
      href: "/category/balconette",
      label: copy.headerNavBalconette,
    },
    {
      href: "/category/bridal",
      label: copy.headerNavBridal,
    },
    {
      href: "/category/bodysuits",
      label: copy.headerNavBodysuits,
    },
    {
      href: "/category/lounge",
      label: copy.headerNavLounge,
    },
  ];

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!mobileMenuRef.current?.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-xl dark:border-amber-500/10 dark:bg-background/88">
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              Veloura
            </p>
            <p className="hidden text-[0.65rem] uppercase tracking-[0.34em] text-muted-foreground sm:block">
              Intimate Atelier
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {categoryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="uppercase tracking-[0.22em] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden md:block">
            <LanguageToggle />
          </div>
          <div className="relative md:hidden" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-category-menu"
              aria-label={isMobileMenuOpen ? copy.headerMenuClose : copy.headerMenu}
              className="inline-flex h-10 items-center justify-center px-1 text-muted-foreground transition-colors hover:text-foreground dark:text-amber-100 dark:hover:text-amber-50"
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <div
              id="mobile-category-menu"
              className={`absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2.5rem))] origin-top-right transition-all duration-300 ease-out ${
                isMobileMenuOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`}
            >
              <div className="overflow-hidden rounded-[2rem] border border-border bg-background/96 p-4 shadow-[0_24px_70px_-28px_rgba(39,34,28,0.35)] backdrop-blur-2xl dark:border-amber-500/12 dark:bg-zinc-950/92 dark:shadow-[0_28px_70px_-28px_rgba(0,0,0,0.75)]">
                <div className="rounded-[1.6rem] border border-border bg-card/80 px-4 py-4 dark:border-white/5 dark:bg-card/70">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
                    {copy.headerMenuTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {copy.headerMenuHint}
                  </p>
                </div>

                <div className="mt-4 grid gap-2">
                  {categoryLinks.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center justify-between rounded-[1.35rem] border border-border bg-card/78 px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-amber-700/30 hover:bg-amber-700/6 dark:border-white/6 dark:bg-card/66 dark:hover:border-amber-300/20 dark:hover:bg-amber-300/8"
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-muted-foreground transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-200">
                        0{index + 1}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-border bg-card/76 p-3 dark:border-white/6 dark:bg-card/62">
                  <LanguageToggle />
                </div>
              </div>
            </div>
          </div>
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
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {cartAnnouncement}
      </div>
    </header>
  );
}
