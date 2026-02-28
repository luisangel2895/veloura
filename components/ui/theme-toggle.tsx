"use client";

import { flushSync } from "react-dom";
import { useSyncExternalStore } from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

type TransitionCapableDocument = Document & {
  startViewTransition?: (update: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { copy } = useLanguage();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={copy.themeToggle}
        className="rounded-none border-0 bg-transparent px-1 shadow-none text-muted-foreground hover:bg-transparent hover:text-foreground dark:text-amber-200 dark:hover:bg-transparent dark:hover:text-amber-100"
      >
        <span className="block size-5" aria-hidden="true" />
      </Button>
    );
  }

  const isDark = resolvedTheme !== "light";

  function handleThemeToggle(event: React.MouseEvent<HTMLButtonElement>) {
    const nextTheme = isDark ? "light" : "dark";
    const root = document.documentElement;
    const supportsReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transitionDocument = document as TransitionCapableDocument;

    const commitThemeChange = () => {
      root.classList.add("theme-switching");
      flushSync(() => {
        setTheme(nextTheme);
      });
      window.setTimeout(() => {
        root.classList.remove("theme-switching");
      }, 560);
    };

    if (!transitionDocument.startViewTransition || supportsReducedMotion) {
      commitThemeChange();
      return;
    }

    const buttonBounds = event.currentTarget.getBoundingClientRect();
    const originX = buttonBounds.left + buttonBounds.width / 2;
    const originY = buttonBounds.top + buttonBounds.height / 2;
    const maxRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    );

    root.classList.add("theme-switching");

    const transition = transitionDocument.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${originX}px ${originY}px)`,
              `circle(${maxRadius}px at ${originX}px ${originY}px)`,
            ],
          },
          {
            duration: 700,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );

        document.documentElement.animate(
          {
            opacity: [1, 0],
          },
          {
            duration: 240,
            easing: "ease-out",
            pseudoElement: "::view-transition-old(root)",
          },
        );
      })
      .catch(() => {
        commitThemeChange();
      });

    transition.finished.finally(() => {
      window.setTimeout(() => {
        root.classList.remove("theme-switching");
      }, 120);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
      aria-label={copy.themeToggle}
      className="rounded-none border-0 bg-transparent px-1 shadow-none text-muted-foreground hover:bg-transparent hover:text-foreground dark:text-amber-200 dark:hover:bg-transparent dark:hover:text-amber-100"
    >
      {isDark ? <SunMedium className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
