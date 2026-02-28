"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import type { Locale } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale, copy } = useLanguage();

  const options: Locale[] = ["es", "en"];

  return (
    <div
      className="relative grid h-10 grid-cols-2 items-center rounded-full border border-border bg-card/85 p-1 shadow-sm dark:border-amber-500/20 dark:bg-card/80"
      aria-label={copy.languageLabel}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-amber-700 transition-transform duration-300 ease-out dark:bg-amber-300 ${
          locale === "en" ? "translate-x-[calc(100%+0.25rem)]" : "translate-x-0"
        }`}
      />
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setLocale(option)}
          className={`relative z-10 h-8 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ${
            locale === option
              ? "text-amber-50 hover:bg-transparent dark:text-zinc-950"
              : "text-foreground hover:bg-accent dark:hover:bg-amber-500/10"
          }`}
        >
          {option === "es" ? copy.languageSpanish : copy.languageEnglish}
        </Button>
      ))}
    </div>
  );
}
