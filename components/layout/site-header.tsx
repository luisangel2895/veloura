"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCart } from "@/hooks/use-cart";

export function SiteHeader() {
  const totalItems = useCart((state) => state.totalItems);

  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/10 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-amber-500/20 bg-amber-500/10">
            <Image
              src="/brand/veloura-logo.png"
              alt="Veloura logo"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </span>
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
          <Link href="/" className="hover:text-foreground">
            New arrivals
          </Link>
          <Link href="/category/balconette" className="hover:text-foreground">
            Balconette
          </Link>
          <Link href="/category/bridal" className="hover:text-foreground">
            Bridal
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/cart"
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-100 transition-colors hover:bg-amber-500/15"
            aria-label="Open cart"
          >
            <ShoppingBag className="size-4" />
            <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-300 px-1.5 text-[0.65rem] font-semibold text-zinc-950">
              {totalItems}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
