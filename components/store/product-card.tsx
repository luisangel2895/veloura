import Link from "next/link";

import { ProductImage } from "@/components/store/product-image";
import { Price } from "@/components/store/price";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types/catalog";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-amber-500/10 bg-card/80 py-0 transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-[3/4] overflow-hidden">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            seed={product.slug}
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
          />
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `linear-gradient(180deg, transparent 20%, ${product.palette[0]} 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_34%)]" />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/15 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-white/70">{product.tagline}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
              {product.name}
            </p>
          </div>
        </div>
        <CardContent className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-amber-500/20 bg-amber-500/5 text-[0.7rem] uppercase tracking-[0.22em] text-amber-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>
          <div className="flex items-center justify-between">
            <Price amountCents={product.priceCents} className="text-base font-semibold" />
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {product.sizesAvailable.join(" / ")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
