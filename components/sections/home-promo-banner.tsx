"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HomePromoBannerProps {
  label: string;
  copy: string;
}

export function HomePromoBanner({ label, copy }: HomePromoBannerProps) {
  return (
    <section className="rounded-[2rem] border border-amber-500/10 bg-card/60 px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-200">
            {label}
          </p>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{copy}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const element = document.getElementById("collection");
            element?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="h-11 rounded-full border-amber-500/20 bg-transparent px-5 hover:bg-amber-500/10"
        >
          Shop now
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}
