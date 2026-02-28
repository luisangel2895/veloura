"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteFooter() {
  const { copy, locale } = useLanguage();

  return (
    <footer
      id="site-footer"
      className="border-t border-border bg-[radial-gradient(circle_at_top,rgba(180,140,52,0.04),transparent_24rem)] dark:border-amber-500/10 dark:bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.04),transparent_24rem)]"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.7fr_0.7fr_0.7fr] lg:gap-14">
          <div className="space-y-7">
            <div className="space-y-4">
              <p className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
                Veloura
              </p>
              <p className="max-w-md text-base leading-9 text-muted-foreground">
                {copy.footerDescription}
              </p>
            </div>

            <form className="flex max-w-md items-center gap-3" onSubmit={(event) => event.preventDefault()}>
              <Input
                type="email"
                placeholder={locale === "es" ? "Tu correo" : "Your email"}
                className="h-12 rounded-md border-border bg-background/70 px-4 text-base dark:border-amber-500/15 dark:bg-background/60"
              />
              <Button
                type="submit"
                variant="outline"
                size="icon-lg"
                className="size-12 rounded-md border-border bg-background/70 hover:bg-accent dark:border-amber-500/15 dark:bg-background/60 dark:hover:bg-amber-500/10"
                aria-label={locale === "es" ? "Suscribirse" : "Subscribe"}
              >
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>

          <nav className="space-y-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
              Shop
            </p>
            <div className="flex flex-col gap-4 text-lg text-muted-foreground">
              <Link href="/category/balconette" className="hover:text-foreground">
                Bras
              </Link>
              <Link href="/category/lounge" className="hover:text-foreground">
                Sets
              </Link>
              <Link href="/category/bodysuits" className="hover:text-foreground">
                Bodies
              </Link>
              <Link href="/" className="hover:text-foreground">
                Sale
              </Link>
            </div>
          </nav>

          <nav className="space-y-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
              Support
            </p>
            <div className="flex flex-col gap-4 text-lg text-muted-foreground">
              <Link href="/product/noir-essence-balconette" className="hover:text-foreground">
                Size Guide
              </Link>
              <Link href="/checkout" className="hover:text-foreground">
                Shipping
              </Link>
              <Link href="/cart" className="hover:text-foreground">
                Returns
              </Link>
              <Link href="/checkout" className="hover:text-foreground">
                FAQ
              </Link>
            </div>
          </nav>

          <nav className="space-y-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
              About
            </p>
            <div className="flex flex-col gap-4 text-lg text-muted-foreground">
              <Link href="/our-story" className="hover:text-foreground">
                Our Story
              </Link>
              <Link href="/our-story" className="hover:text-foreground">
                Sustainability
              </Link>
              <Link href="/our-story" className="hover:text-foreground">
                Press
              </Link>
              <Link href="/our-story" className="hover:text-foreground">
                Careers
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-12 border-t border-border pt-10 dark:border-amber-500/10">
          <div className="flex flex-col gap-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              {locale === "es"
                ? "© 2026 Veloura. Todos los derechos reservados."
                : "© 2026 Veloura. All rights reserved."}
            </p>
            <div className="flex items-center gap-8">
              <Link href="/our-story" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/our-story" className="hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
