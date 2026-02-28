"use client";

import { createContext, startTransition, useContext, useMemo, useRef, useState } from "react";

import { messages, type Locale } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isTransitioning: boolean;
  copy: (typeof messages)[Locale];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimerRef = useRef<number | null>(null);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: (nextLocale) => {
        if (nextLocale === locale) {
          return;
        }

        if (transitionTimerRef.current) {
          window.clearTimeout(transitionTimerRef.current);
        }

        setIsTransitioning(true);
        startTransition(() => {
          setLocaleState(nextLocale);
        });

        document.documentElement.lang = nextLocale;
        document.cookie = `veloura-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;

        transitionTimerRef.current = window.setTimeout(() => {
          setIsTransitioning(false);
        }, 260);
      },
      isTransitioning,
      copy: messages[locale],
    }),
    [isTransitioning, locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
