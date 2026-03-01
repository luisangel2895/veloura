"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { ProductImage } from "@/components/store/product-image";
import { Price } from "@/components/store/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useProductQuery } from "@/hooks/use-product-query";
import type { Category, Product, Size } from "@/types/catalog";

interface ProductDetailProps {
  slug: string;
  initialProduct: Product;
  category?: Category;
}

interface PanelState {
  details: boolean;
  sizing: boolean;
  delivery: boolean;
}

function ProductGallery({ product }: { product: Product }) {
  const { copy } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const activeImage = product.images[currentImageIndex] ?? product.images[0];

  const showPreviousImage = () => {
    setCurrentImageIndex((current) =>
      current === 0 ? product.images.length - 1 : current - 1,
    );
  };

  const showNextImage = () => {
    setCurrentImageIndex((current) =>
      current === product.images.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <section className="space-y-4">
      <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-border dark:border-amber-500/10">
        <div
          key={activeImage}
          className="absolute inset-0 animate-in fade-in-0 zoom-in-95 duration-500"
        >
          <ProductImage
            src={activeImage}
            alt={product.name}
            seed={`${product.slug}-hero-${currentImageIndex}`}
            className="absolute inset-0"
            sizes="(min-width: 1024px) 55vw, 100vw"
            priority
          />
          <div
            className="absolute inset-0 opacity-65"
            style={{
              backgroundImage: `linear-gradient(180deg, transparent 15%, ${product.palette[0]} 100%)`,
            }}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_30%)]" />
        {product.images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-4 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur transition-colors hover:bg-black/35"
              aria-label={copy.productPrevImage}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-4 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur transition-colors hover:bg-black/35"
              aria-label={copy.productNextImage}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
        <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/10 bg-black/15 p-6 backdrop-blur">
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/70">
            {product.tagline}
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-semibold text-white">
            {product.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {product.images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setCurrentImageIndex(index)}
            className={`overflow-hidden rounded-3xl border text-left transition-all ${
              currentImageIndex === index
                ? "border-amber-700 shadow-[0_0_0_1px_rgba(180,140,52,0.28)] dark:border-amber-300 dark:shadow-[0_0_0_1px_rgba(252,211,77,0.35)]"
                : "border-border dark:border-amber-500/10"
            }`}
            aria-label={`${copy.productShowFrame} ${index + 1}`}
          >
            <div className="relative h-36">
              <ProductImage
                src={image}
                alt={`${product.name} view ${index + 1}`}
                seed={`${product.slug}-${index + 1}`}
                sizes="(min-width: 640px) 20vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              <p className="absolute bottom-3 left-3 text-[0.7rem] uppercase tracking-[0.24em] text-white/80">
                {copy.productFrame} {index + 1}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ProductDetail({ slug, initialProduct, category }: ProductDetailProps) {
  const { copy, locale } = useLanguage();
  const productQuery = useProductQuery(slug, initialProduct);
  const addItem = useCart((state) => state.addItem);
  const product = productQuery.data ?? initialProduct;
  const [selectedSize, setSelectedSize] = useState<Size>(initialProduct.sizesAvailable[0]);
  const [addedProductSlug, setAddedProductSlug] = useState<string | null>(null);
  const addFeedbackTimeoutRef = useRef<number | null>(null);
  const [panels, setPanels] = useState<PanelState>({
    details: true,
    sizing: false,
    delivery: false,
  });

  useEffect(() => {
    if (addFeedbackTimeoutRef.current) {
      window.clearTimeout(addFeedbackTimeoutRef.current);
      addFeedbackTimeoutRef.current = null;
    }
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [slug]);

  useEffect(() => {
    return () => {
      if (addFeedbackTimeoutRef.current) {
        window.clearTimeout(addFeedbackTimeoutRef.current);
      }
    };
  }, []);

  const sections = [
    {
      key: "details" as const,
      title: copy.productDetails,
      content: product.details.join(" "),
    },
    {
      key: "sizing" as const,
      title: copy.productSizing,
      content:
        "Veloura fits true to size with a close, sculpted silhouette. If you move between sizes, choose the larger option for a softer lounge fit.",
    },
    {
      key: "delivery" as const,
      title: copy.productDelivery,
      content:
        "Dispatch is mocked at 24 hours for demo purposes. Pieces should be hand washed cold, reshaped while damp and dried flat away from direct heat.",
    },
  ];
  const showAddedFeedback = addedProductSlug === product.slug;
  const isSpanish = locale === "es";

  return (
    <div className="space-y-8 pb-16">
      <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {copy.productHome}
        </Link>
        <span>/</span>
        {category ? (
          <>
            <Link href={`/category/${category.slug}`} className="hover:text-foreground">
              {category.name}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery key={product.slug} product={product} />

        <section className="space-y-6 rounded-[2rem] border border-border bg-card/80 p-6 dark:border-amber-500/10 dark:bg-card/75 sm:p-8">
          <div className="space-y-4">
            <Badge className="bg-amber-700/10 px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.32em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
              {category?.name ?? product.categorySlug}
            </Badge>
            <div className="space-y-3">
              <h1 className="text-5xl font-semibold tracking-tight">{product.name}</h1>
              <p className="text-base leading-8 text-muted-foreground">{product.description}</p>
            </div>
            <div className="flex items-center justify-between">
              <Price amountCents={product.priceCents} className="text-2xl font-semibold" />
              <div className="flex flex-wrap justify-end gap-2">
                {product.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-border bg-transparent text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground dark:border-amber-500/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-border dark:bg-amber-500/10" />

          <div className="space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {copy.productSelectSize}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizesAvailable.map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                  className={
                    selectedSize === size
                      ? "bg-amber-700 text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
                      : "border-border bg-transparent hover:bg-accent dark:border-amber-500/20 dark:hover:bg-amber-500/10"
                  }
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              size="lg"
              data-testid="add-to-cart"
              onClick={() => {
                addItem(product, selectedSize);

                if (addFeedbackTimeoutRef.current) {
                  window.clearTimeout(addFeedbackTimeoutRef.current);
                }

                setAddedProductSlug(product.slug);
                addFeedbackTimeoutRef.current = window.setTimeout(() => {
                  setAddedProductSlug(null);
                  addFeedbackTimeoutRef.current = null;
                }, 1900);
              }}
              className={`relative h-14 overflow-hidden rounded-none px-8 font-semibold uppercase transition-all duration-500 ease-out ${
                isSpanish ? "text-[0.72rem] tracking-[0.14em]" : "text-sm tracking-[0.2em]"
              } ${
                showAddedFeedback
                  ? "bg-foreground text-background shadow-[0_18px_45px_-22px_rgba(39,34,28,0.45)] ring-1 ring-amber-700/15 hover:bg-foreground/92 dark:shadow-[0_18px_45px_-22px_rgba(248,245,239,0.16)] dark:ring-amber-300/15"
                  : "bg-amber-700 text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
              }`}
            >
              <span
                className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                  showAddedFeedback
                    ? "opacity-100 bg-[linear-gradient(120deg,transparent_12%,rgba(180,140,52,0.18)_42%,transparent_72%)] dark:bg-[linear-gradient(120deg,transparent_12%,rgba(252,211,77,0.16)_42%,transparent_72%)]"
                    : "opacity-0"
                }`}
              />
              <span
                key={showAddedFeedback ? "added" : "idle"}
                className={`relative z-10 inline-flex items-center animate-in fade-in-0 zoom-in-95 duration-300 ${
                  isSpanish ? "gap-1.5" : "gap-2"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center transition-transform duration-300 ${
                    showAddedFeedback ? "scale-110" : "scale-100"
                  }`}
                >
                  {showAddedFeedback ? (
                    <Check className={isSpanish ? "size-3.5" : "size-4"} />
                  ) : (
                    <ShoppingBag className={isSpanish ? "size-3.5" : "size-4"} />
                  )}
                </span>
                <span
                  className={
                    showAddedFeedback
                      ? isSpanish
                        ? "tracking-[0.16em]"
                        : "tracking-[0.24em]"
                      : undefined
                  }
                >
                  {showAddedFeedback ? copy.productAddedToCart : copy.productAddToCart}
                </span>
              </span>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 rounded-none border-border bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.2em] hover:bg-accent dark:border-amber-500/20 dark:hover:bg-amber-500/10"
            >
              <Link href="/cart">{copy.productGoToCart}</Link>
            </Button>
          </div>

          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.key} className="rounded-3xl border border-border px-5 py-4 dark:border-amber-500/10">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={panels[section.key]}
                  aria-controls={`product-panel-${section.key}`}
                  onClick={() =>
                    setPanels((current) => ({
                      ...current,
                      [section.key]: !current[section.key],
                    }))
                  }
                >
                  <span className="font-medium">{section.title}</span>
                  <ChevronDown
                    className={`size-4 transition-transform duration-300 ease-out ${
                      panels[section.key] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  id={`product-panel-${section.key}`}
                  className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                    panels[section.key] ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm leading-7 text-muted-foreground">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
