"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string;
  alt: string;
  seed: string;
  className?: string;
  sizes?: string;
  showBrandSkeleton?: boolean;
}

export function ProductImage({
  src,
  alt,
  seed,
  className,
  sizes,
  showBrandSkeleton = false,
}: ProductImageProps) {
  const fallbackSrc = `https://picsum.photos/seed/${seed}/1200/1600`;
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const fallbackAppliedRef = useRef(!src);

  return (
    <div className="relative h-full w-full">
      {showBrandSkeleton ? (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-10 transition-opacity duration-500",
            isLoaded ? "opacity-0" : "opacity-100",
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-card via-card/95 to-muted/70 dark:from-zinc-950 dark:via-zinc-950/95 dark:to-zinc-900/70" />
          <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_top,rgba(180,140,52,0.16),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,rgba(252,211,77,0.14),transparent_42%)]" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-border/80 bg-background/60 px-8 py-7 backdrop-blur-md dark:border-white/8 dark:bg-black/15">
              <Image
                src="/brand/veloura-logo.png"
                alt=""
                width={72}
                height={72}
                className="h-auto w-16 opacity-25 dark:brightness-0 dark:invert dark:opacity-40"
              />
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.36em] text-muted-foreground/85">
                Veloura
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <Image
        src={currentSrc}
        alt={alt}
        width={1200}
        height={1600}
        unoptimized
        sizes={sizes}
        className={cn("h-full w-full object-cover", className)}
        onLoad={() => {
          setIsLoaded(true);
        }}
        onError={() => {
          if (fallbackAppliedRef.current) {
            setIsLoaded(true);
            return;
          }

          fallbackAppliedRef.current = true;
          setIsLoaded(false);
          setCurrentSrc(fallbackSrc);
        }}
      />
    </div>
  );
}
