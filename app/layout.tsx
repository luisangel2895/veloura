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
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
