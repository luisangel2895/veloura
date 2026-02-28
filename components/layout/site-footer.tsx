import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-amber-500/10 bg-background/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-amber-500/15">
              <Image
                src="/brand/veloura-logo.png"
                alt="Veloura logo"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">
              Veloura
            </p>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Lenceria contemporanea con enfoque editorial, construida para escalar de
            front-end demo a un backend real sin rehacer la base.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/cart" className="hover:text-foreground">
            Cart
          </Link>
          <Link href="/checkout" className="hover:text-foreground">
            Checkout
          </Link>
        </div>
      </div>
    </footer>
  );
}
