"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

export function LanguageTransitionFrame({ children }: { children: React.ReactNode }) {
  const { isTransitioning } = useLanguage();

  return (
    <div
      className={cn(
        "transition-[opacity,transform,filter] duration-300 ease-out",
        isTransitioning && "opacity-90 blur-[1px]",
      )}
    >
      {children}
    </div>
  );
}
