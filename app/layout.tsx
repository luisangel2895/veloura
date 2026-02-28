import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import { createBaseMetadata } from "@/lib/seo/metadata";

import "./globals.css";

export const metadata: Metadata = createBaseMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/brand/veloura-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/brand/veloura-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/veloura-logo.png" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
