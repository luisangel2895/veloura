"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { LanguageProvider } from "@/components/providers/language-provider";
import { LanguageTransitionFrame } from "@/components/providers/language-transition-frame";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import type { Locale } from "@/lib/i18n";

export function AppProviders({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LanguageProvider initialLocale={initialLocale}>
        <QueryClientProvider client={queryClient}>
          <StoreHydrator />
          <LanguageTransitionFrame>{children}</LanguageTransitionFrame>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
