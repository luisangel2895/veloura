"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function SiteFooter() {
  const { copy, locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (!showSuccessDialog) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSuccessDialog(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showSuccessDialog]);

  function handleNewsletterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!isValidEmail(normalizedEmail)) {
      setEmailError(copy.footerEmailInvalid);
      return;
    }

    setEmailError(null);
    setShowSuccessDialog(true);
    setEmail("");
  }

  return (
    <>
      <footer
        id="site-footer"
        className="border-t border-border bg-[radial-gradient(circle_at_top,rgba(180,140,52,0.04),transparent_24rem)] dark:border-amber-500/10 dark:bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.04),transparent_24rem)]"
      >
        <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.8fr_0.8fr] lg:gap-14">
            <div className="space-y-7">
              <div className="space-y-4">
                <p className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
                  Veloura
                </p>
                <p className="max-w-md text-base leading-9 text-muted-foreground">
                  {copy.footerDescription}
                </p>
              </div>

              <div className="space-y-2">
                <form className="flex max-w-md items-center gap-3" onSubmit={handleNewsletterSubmit}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (emailError) {
                        setEmailError(null);
                      }
                    }}
                    placeholder={copy.footerEmailPlaceholder}
                    aria-invalid={emailError ? "true" : "false"}
                    className="h-12 rounded-md border-border bg-background/70 px-4 text-base dark:border-amber-500/15 dark:bg-background/60"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="icon-lg"
                    className="size-12 rounded-md border-border bg-background/70 hover:bg-accent dark:border-amber-500/15 dark:bg-background/60 dark:hover:bg-amber-500/10"
                    aria-label={copy.footerSubscribeAria}
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                </form>
                {emailError ? (
                  <p className="max-w-md text-sm text-rose-600 dark:text-rose-300">{emailError}</p>
                ) : null}
              </div>
            </div>

            <nav className="space-y-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
                Shop
              </p>
              <div className="flex flex-col gap-4 text-lg text-muted-foreground">
                <Link href="/category/balconette" className="hover:text-foreground">
                  Balconette
                </Link>
                <Link href="/category/bridal" className="hover:text-foreground">
                  Bridal
                </Link>
                <Link href="/category/bodysuits" className="hover:text-foreground">
                  Bodysuits
                </Link>
                <Link href="/category/lounge" className="hover:text-foreground">
                  Lounge
                </Link>
              </div>
            </nav>

            <nav className="space-y-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
                About
              </p>
              <div className="flex flex-col gap-4 text-lg text-muted-foreground">
                <Link href="/our-story" className="hover:text-foreground">
                  Our Story
                </Link>
                <Link href="/our-story" className="hover:text-foreground">
                  Sustainability
                </Link>
              </div>
            </nav>
          </div>

          <div className="mt-12 border-t border-border pt-10 dark:border-amber-500/10">
            <div className="flex flex-col gap-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                {locale === "es"
                  ? "© 2026 Veloura. Todos los derechos reservados."
                  : "© 2026 Veloura. All rights reserved."}
              </p>
              <div className="flex items-center gap-8">
                <Link href="/policies" className="hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/policies" className="hover:text-foreground">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showSuccessDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setShowSuccessDialog(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-dialog-title"
            className="w-full max-w-xl rounded-[2rem] border border-border bg-background/95 p-7 shadow-2xl animate-in zoom-in-95 fade-in-0 duration-300 dark:border-amber-500/10 dark:bg-zinc-950/92 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
              Veloura Newsletter
            </p>
            <h3
              id="newsletter-dialog-title"
              className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              {copy.footerSubscribeTitle}
            </h3>
            <p className="mt-4 max-w-lg text-sm leading-8 text-muted-foreground sm:text-base">
              {copy.footerSubscribeCopy}
            </p>
            <Button
              type="button"
              onClick={() => setShowSuccessDialog(false)}
              className="mt-8 rounded-full bg-amber-700 text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
            >
              {copy.footerSubscribeClose}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
