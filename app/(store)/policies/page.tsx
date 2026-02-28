import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description:
    "Review Veloura's privacy notice, terms and conditions, and the core policies that govern the storefront experience.",
  alternates: {
    canonical: "/policies",
  },
};

export default function PoliciesPage() {
  return (
    <div className="space-y-10 pb-16">
      <section className="space-y-5 text-center">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.38em] text-amber-700 dark:text-amber-200">
          Legal
        </p>
        <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-display)] text-5xl font-normal leading-[0.95] tracking-[0.01em] sm:text-7xl">
          Privacy, terms and customer clarity.
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          This page outlines the policies that frame the Veloura storefront experience in this
          demo environment, including privacy practices, order expectations and the terms that
          govern site usage.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-border bg-card/80 p-6 dark:border-amber-500/10 dark:bg-card/70 sm:p-8">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
            Privacy
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">How we handle information.</h2>
          <div className="mt-4 space-y-4 text-sm leading-8 text-muted-foreground sm:text-base">
            <p>
              Veloura only collects the information required to support browsing, mock cart
              persistence and newsletter sign-up interactions inside this demo storefront. We do
              not process real payments or transmit purchase data to a production commerce backend.
            </p>
            <p>
              Any locally stored cart data remains in the user&apos;s browser and is used only to
              preserve the shopping experience across refreshes. Newsletter submissions in this
              demo trigger a confirmation flow only and are not sent to an external provider.
            </p>
            <p>
              If this storefront is later connected to real infrastructure, the privacy policy
              should be expanded to document analytics, retention windows, marketing consent and
              third-party processors in full legal detail.
            </p>
          </div>
        </article>

        <article className="rounded-[2rem] border border-border bg-card/80 p-6 dark:border-amber-500/10 dark:bg-card/70 sm:p-8">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
            Terms
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            Conditions of use and orders.
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-8 text-muted-foreground sm:text-base">
            <p>
              All pricing, inventory and checkout states shown in this demo are illustrative. They
              exist to model an e-commerce architecture and should not be treated as binding offers
              or production order commitments.
            </p>
            <p>
              Product descriptions, shipping estimates and promotional messages are mock content.
              Veloura reserves the right to update or remove them at any time while the storefront
              remains in development.
            </p>
            <p>
              By using this site, you agree not to misuse the interface, attempt to disrupt its
              operation or rely on demo checkout behavior as a substitute for real commercial
              transaction terms.
            </p>
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-border bg-card/70 p-6 dark:border-amber-500/10 dark:bg-card/60 sm:p-8">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
          Customer Policy
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-semibold">Returns</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Return messaging in this demo is informational only. No real logistics flow is
              connected behind the interface.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Shipping</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Delivery timelines are simulated to demonstrate UX states and should not be read as
              guaranteed fulfillment terms.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Contact</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              For a production launch, this section should be replaced with formal customer support
              channels, escalation paths and jurisdiction-specific legal notices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
