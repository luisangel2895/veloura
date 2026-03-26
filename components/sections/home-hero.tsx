"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

function smoothScrollTo(id: string) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function HomeHero() {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    let frameId: number | null = null;

    const markReady = () => {
      setIsVideoReady(true);
    };

    const handleReady = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(markReady);
    };

    if (video.readyState >= 2) {
      handleReady();
    }

    video.addEventListener("loadeddata", handleReady);
    video.addEventListener("canplay", handleReady);
    video.addEventListener("playing", handleReady);

    const playback = video.play();

    if (playback) {
      void playback.catch(() => {});
    }

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("playing", handleReady);
    };
  }, []);

  return (
    <section className="relative isolate mx-[calc(50%-50dvw)] flex h-[calc(100dvh-5.5rem+20px)] w-[100dvw] max-w-[100dvw] items-center justify-center overflow-hidden pb-28 pt-8 text-center sm:h-[calc(100dvh-6rem+20px)]">
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isVideoReady ? "opacity-0 blur-md scale-[1.01]" : "opacity-100 blur-0 scale-100"
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.82)_0%,rgba(243,238,230,0.92)_34%,rgba(225,218,208,0.78)_58%,rgba(205,196,184,0.44)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(58,53,47,0.52)_0%,rgba(39,36,32,0.72)_34%,rgba(24,22,20,0.84)_58%,rgba(16,15,14,0.94)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(205,196,184,0.26)_0%,transparent_17%,transparent_83%,rgba(176,164,150,0.28)_100%)] dark:bg-[linear-gradient(90deg,rgba(18,17,16,0.72)_0%,transparent_17%,transparent_83%,rgba(14,13,12,0.78)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,140,52,0.08),transparent_26rem),radial-gradient(circle_at_bottom_left,rgba(141,122,92,0.06),transparent_24rem)] dark:bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.14),transparent_24rem),radial-gradient(circle_at_bottom_left,rgba(120,102,74,0.12),transparent_22rem)]" />
        </div>

        <div
          className={`absolute inset-0 hidden lg:block transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isVideoReady ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-xl scale-[1.03]"
          }`}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-[center_26%]"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            aria-hidden="true"
          >
            <source src="/videos/veloura-hero-loop-bw.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(242,236,228,0.32)_0%,rgba(243,238,230,0.14)_16%,rgba(247,244,239,0.04)_34%,rgba(247,244,239,0.04)_66%,rgba(236,229,221,0.14)_84%,rgba(222,212,201,0.34)_100%)] dark:bg-[linear-gradient(90deg,rgba(15,14,13,0.74)_0%,rgba(18,17,16,0.42)_16%,rgba(24,22,20,0.2)_34%,rgba(24,22,20,0.22)_66%,rgba(16,15,14,0.44)_84%,rgba(11,10,9,0.76)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,246,242,0.1)_0%,rgba(249,246,242,0.03)_36%,transparent_62%)] dark:bg-[radial-gradient(circle_at_center,rgba(10,10,9,0.16)_0%,rgba(10,10,9,0.06)_36%,transparent_62%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.015)_22%,rgba(255,255,255,0.02)_78%,rgba(255,255,255,0.1)_100%)] dark:bg-[linear-gradient(180deg,rgba(6,6,6,0.18)_0%,rgba(6,6,6,0.04)_22%,rgba(6,6,6,0.06)_78%,rgba(6,6,6,0.22)_100%)]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 sm:px-8">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.38em] text-amber-700 dark:text-amber-200">
            New Collection
          </p>
          <h1 className="mx-auto max-w-3xl font-[family-name:var(--font-display)] text-5xl font-normal leading-[0.94] tracking-[0.01em] sm:text-7xl">
            Intimacy,
            <br />
            <span className="italic">redefined.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-muted-foreground dark:text-white/80 sm:text-lg">
            A curated selection of sculptural silhouettes and ceremony pieces, designed through the
            lens of understated luxury.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            onClick={() => smoothScrollTo("collection")}
            className="h-14 rounded-none bg-amber-700 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
          >
            EXPLORE COLLECTION
            <ArrowRight className="size-4" />
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 rounded-none border-foreground/18 bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.2em] text-foreground hover:bg-accent dark:border-amber-500/20 dark:hover:bg-amber-500/10"
          >
            <Link href="/our-story">OUR STORY</Link>
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => smoothScrollTo("collection")}
        className="absolute bottom-6 left-1/2 z-10 inline-flex -translate-x-1/2 flex-col items-center gap-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground dark:text-white/70 dark:hover:text-white"
        aria-label="Scroll to collection"
      >
        <span>Discover more</span>
        <span className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/80 motion-safe:animate-bounce dark:border-amber-500/15 dark:bg-background/70">
          <ChevronDown className="size-4" />
        </span>
      </button>
    </section>
  );
}
