"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useCart } from "@/hooks/use-cart";
import { useLocalePath } from "@/hooks/use-locale-path";

export function SiteHeader() {
  const { totalItems, lastAddedAt } = useCart((state) => ({
    totalItems: state.totalItems,
    lastAddedAt: state.lastAddedAt,
  }));
  const { copy } = useLanguage();
  const lp = useLocalePath();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const announcementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lastAddedAt > 0 && totalItems > 0 && announcementRef.current) {
      const text = `${copy.productAddedToCart}. ${totalItems} ${totalItems === 1 ? "item" : "items"} in cart.`;
      announcementRef.current.textContent = text;
      const timer = setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = "";
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedAt, totalItems, copy.productAddedToCart]);

  const categoryLinks = [
    {
      href: lp("/category/balconette"),
      label: copy.headerNavBalconette,
    },
    {
      href: lp("/category/bridal"),
      label: copy.headerNavBridal,
    },
    {
      href: lp("/category/bodysuits"),
      label: copy.headerNavBodysuits,
    },
    {
      href: lp("/category/lounge"),
      label: copy.headerNavLounge,
    },
  ];

  // Lock body scroll and bind Escape while the mobile menu is open.
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/92 backdrop-blur-xl dark:border-amber-500/10 dark:bg-background/88">
        <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-[72px] sm:px-8">
          <Link href={lp("/")} className="group flex items-center">
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
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-category-menu"
              aria-label={copy.headerMenu}
              className="inline-flex h-10 items-center justify-center px-1 text-muted-foreground transition-colors hover:text-foreground md:hidden dark:text-amber-100 dark:hover:text-amber-50"
            >
              <Menu className="size-5" />
            </button>
            <ThemeToggle />
            <Link
              href={lp("/cart")}
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
        <div ref={announcementRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      </header>

      {/* Mobile full-screen menu overlay */}
      <div
        id="mobile-category-menu"
        aria-hidden={!isMobileMenuOpen}
        className={`fixed inset-0 z-50 overflow-hidden md:hidden ${
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-out dark:bg-zinc-950 ${
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {/* Top bar matching the header height */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4 dark:border-amber-500/10">
            <Link
              href={lp("/")}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center"
            >
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
                Veloura
              </p>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label={copy.headerMenuClose}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-amber-700/30 hover:text-foreground dark:border-amber-500/15 dark:text-amber-100 dark:hover:border-amber-300/25"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
                {copy.headerMenuTitle}
              </p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                {copy.headerMenuHint}
              </p>

              <nav className="mt-10">
                <ul className="border-y border-border dark:border-amber-500/10">
                  {categoryLinks.map((item, index) => (
                    <li
                      key={item.href}
                      className="border-b border-border last:border-b-0 dark:border-amber-500/10"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="group flex items-center justify-between gap-4 py-5"
                      >
                        <span className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-200">
                          {item.label}
                        </span>
                        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-200">
                          0{index + 1}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Footer with language toggle */}
          <div className="border-t border-border px-5 py-4 dark:border-amber-500/10">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </>
  );
}
