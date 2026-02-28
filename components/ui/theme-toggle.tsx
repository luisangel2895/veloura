"use client";

import { useSyncExternalStore } from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Toggle color theme"
        className="border-amber-500/30 bg-transparent text-amber-200 hover:bg-amber-500/10 hover:text-amber-100"
      >
        <span className="block size-4" aria-hidden="true" />
      </Button>
    );
  }

  const isDark = resolvedTheme !== "light";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle color theme"
      className="border-amber-500/30 bg-transparent text-amber-200 hover:bg-amber-500/10 hover:text-amber-100"
    >
      {isDark ? <SunMedium /> : <Moon />}
    </Button>
  );
}
