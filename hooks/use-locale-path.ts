"use client";

import { useLanguage } from "@/components/providers/language-provider";

export function useLocalePath() {
  const { locale } = useLanguage();

  return function localePath(path: string): string {
    if (path.startsWith("/en/") || path.startsWith("/es/")) {
      return path;
    }
    return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
  };
}
