"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ShoppingBag } from "lucide-react";

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

export function ProductDetail({ slug, initialProduct, category }: ProductDetailProps) {
  const productQuery = useProductQuery(slug, initialProduct);
  const addItem = useCart((state) => state.addItem);
  const product = productQuery.data ?? initialProduct;
  const [selectedSize, setSelectedSize] = useState<Size>(initialProduct.sizesAvailable[0]);
  const [added, setAdded] = useState(false);
  const [panels, setPanels] = useState<PanelState>({
    details: true,
    sizing: false,
    delivery: false,
  });

  const sections = [
    {
      key: "details" as const,
      title: "Product details",
      content: product.details.join(" "),
    },
    {
      key: "sizing" as const,
      title: "Fit and sizing",
      content:
        "Veloura fits true to size with a close, sculpted silhouette. If you move between sizes, choose the larger option for a softer lounge fit.",
    },
    {
      key: "delivery" as const,
      title: "Delivery and care",
      content:
        "Dispatch is mocked at 24 hours for demo purposes. Pieces should be hand washed cold, reshaped while damp and dried flat away from direct heat.",
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
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
        <section className="space-y-4">
          <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-amber-500/10">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              seed={`${product.slug}-hero`}
              className="absolute inset-0"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
            <div
              className="absolute inset-0 opacity-65"
              style={{
                backgroundImage: `linear-gradient(180deg, transparent 15%, ${product.palette[0]} 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_30%)]" />
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
              <div key={image} className="overflow-hidden rounded-3xl border border-amber-500/10">
                <div className="relative h-36">
                  <ProductImage
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    seed={`${product.slug}-${index + 1}`}
                    sizes="(min-width: 640px) 20vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <p className="absolute bottom-3 left-3 text-[0.7rem] uppercase tracking-[0.24em] text-white/80">
                    Frame {index + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-[2rem] border border-amber-500/10 bg-card/75 p-6 sm:p-8">
          <div className="space-y-4">
            <Badge className="bg-amber-500/10 px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.32em] text-amber-200">
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
                    className="border-amber-500/20 bg-transparent text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-amber-500/10" />

          <div className="space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Select size
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
                      ? "bg-amber-300 text-zinc-950 hover:bg-amber-200"
                      : "border-amber-500/20 bg-transparent hover:bg-amber-500/10"
                  }
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={() => {
              addItem(product, selectedSize);
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1600);
            }}
            className="h-12 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200"
          >
            {added ? <Check /> : <ShoppingBag />}
            {added ? "Added to cart" : "Add to cart"}
          </Button>

          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.key} className="rounded-3xl border border-amber-500/10 px-5 py-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 text-left"
                  onClick={() =>
                    setPanels((current) => ({
                      ...current,
                      [section.key]: !current[section.key],
                    }))
                  }
                >
                  <span className="font-medium">{section.title}</span>
                  <ChevronDown
                    className={`size-4 transition-transform ${
                      panels[section.key] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {panels[section.key] ? (
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.content}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
