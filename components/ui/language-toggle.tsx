"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import type { Locale } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale, copy } = useLanguage();

  const options: Locale[] = ["es", "en"];

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/8 p-1"
      aria-label={copy.languageLabel}
    >
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          variant={locale === option ? "default" : "ghost"}
          size="sm"
          onClick={() => setLocale(option)}
          className={
            locale === option
              ? "h-8 rounded-full bg-amber-300 px-3 text-zinc-950 hover:bg-amber-200"
              : "h-8 rounded-full px-3 text-amber-100 hover:bg-amber-500/10"
          }
        >
          {option === "es" ? copy.languageSpanish : copy.languageEnglish}
        </Button>
      ))}
    </div>
  );
}
