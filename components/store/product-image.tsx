"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string;
  alt: string;
  seed: string;
  className?: string;
  sizes?: string;
}

export function ProductImage({ src, alt, seed, className, sizes }: ProductImageProps) {
  const fallbackSrc = `https://picsum.photos/seed/${seed}/1200/1600`;
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={1200}
      height={1600}
      unoptimized
      sizes={sizes}
      className={cn("h-full w-full object-cover", className)}
      onError={(event) => {
        const image = event.currentTarget;

        if (image.dataset.fallbackApplied === "true") {
          return;
        }

        image.dataset.fallbackApplied = "true";
        setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
