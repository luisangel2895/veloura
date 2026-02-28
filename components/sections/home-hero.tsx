"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

function smoothScrollTo(id: string) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function HomeHero() {
  return (
    <section className="relative -mx-5 flex min-h-[calc(100svh-5.5rem)] items-center justify-center px-5 pb-28 pt-8 text-center sm:-mx-8 sm:min-h-[calc(100svh-6rem)] sm:px-8">
      <div className="relative mx-auto max-w-4xl">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.38em] text-amber-200">
            New Collection
          </p>
          <h1 className="mx-auto max-w-3xl font-[family-name:var(--font-display)] text-5xl font-normal leading-[0.94] tracking-[0.01em] sm:text-7xl">
            Intimacy,
            <br />
            <span className="italic">redefined.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            A curated selection of sculptural silhouettes and ceremony pieces, designed
            through the lens of understated luxury.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            onClick={() => smoothScrollTo("collection")}
            className="h-14 rounded-none bg-amber-300 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 hover:bg-amber-200"
          >
            EXPLORE COLLECTION
            <ArrowRight className="size-4" />
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 rounded-none border-amber-500/20 bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.2em] hover:bg-amber-500/10"
          >
            <Link href="/our-story">OUR STORY</Link>
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => smoothScrollTo("collection")}
        className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 flex-col items-center gap-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Scroll to collection"
      >
        <span>Discover more</span>
        <span className="inline-flex size-10 items-center justify-center rounded-full border border-amber-500/15 bg-background/70 motion-safe:animate-bounce">
          <ChevronDown className="size-4" />
        </span>
      </button>
    </section>
  );
}
