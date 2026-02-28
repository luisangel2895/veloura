import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Discover Veloura's mission and vision: a refined, modern approach to intimate essentials built with intention.",
  alternates: {
    canonical: "/our-story",
  },
};

export default function OurStoryPage() {
  return (
    <div className="space-y-10 pb-16">
      <section className="space-y-5 text-center">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.38em] text-amber-700 dark:text-amber-200">
          Brand Manifesto
        </p>
        <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-display)] text-5xl font-normal leading-[0.95] tracking-[0.01em] sm:text-7xl">
          A quieter kind of luxury, designed to stay.
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          Veloura was imagined as a modern lingerie house for women who want softness,
          structure and elegance without excess. Every silhouette is guided by restraint,
          intimacy and long-wear comfort.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-border bg-card/80 p-6 dark:border-amber-500/10 dark:bg-card/70 sm:p-8">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
            Mission
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">Design with intention.</h2>
          <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">
            Our mission is to build intimate essentials that feel precise, calming and
            distinctly elevated. We focus on silhouettes that support the body, fabrics that
            soften the daily routine and a visual language rooted in subtle confidence rather
            than spectacle.
          </p>
        </article>

        <article className="rounded-[2rem] border border-border bg-card/80 p-6 dark:border-amber-500/10 dark:bg-card/70 sm:p-8">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
            Vision
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">Elevate the everyday ritual.</h2>
          <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">
            Our vision is a category where luxury lingerie feels intelligent, wearable and
            emotionally grounded. Veloura aims to become a reference for understated design,
            where craftsmanship, comfort and editorial clarity can coexist in every layer.
          </p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-border bg-card/70 p-6 dark:border-amber-500/10 dark:bg-card/60 sm:p-8">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-700 dark:text-amber-200">
          What We Believe
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-semibold">Form follows feeling.</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Beauty matters, but only when it supports comfort, movement and confidence.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Restraint creates elegance.</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              We choose clarity, proportion and texture over noise, excess and trend cycles.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Intimacy deserves design.</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              The pieces worn closest to the body should be treated with the highest level of
              intention.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
