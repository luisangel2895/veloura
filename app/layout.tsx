import type { Metadata } from "next";
import { cookies, headers } from "next/headers";

import { AppProviders } from "@/components/providers/app-providers";
import { JsonLd } from "@/components/seo/json-ld";
import { resolveLocale } from "@/lib/i18n";
import { buildOrganizationJsonLd, createBaseMetadata } from "@/lib/seo/metadata";

import "./globals.css";

export const metadata: Metadata = createBaseMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLocale = cookieStore.get("veloura-locale")?.value;
  const initialLocale = resolveLocale(cookieLocale ?? headerStore.get("accept-language"));

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/brand/veloura-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/brand/veloura-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/veloura-logo.png" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <JsonLd data={buildOrganizationJsonLd()} />
        <AppProviders initialLocale={initialLocale}>{children}</AppProviders>
      </body>
    </html>
  );
}
