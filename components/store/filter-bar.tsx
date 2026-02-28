"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { type ProductSort, type Size } from "@/types/catalog";

const sizeOptions: Array<Size | "all"> = ["all", "XS", "S", "M", "L", "XL"];

interface FilterBarProps {
  size: Size | "all";
  category: string;
  sort: ProductSort;
  categories: Array<{ slug: string; name: string }>;
  showCategoryFilter?: boolean;
  onSizeChange: (size: Size | "all") => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: ProductSort) => void;
}

function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  align = "left",
}: {
  label: string;
  options: Array<{ label: ReactNode; value: T }>;
  value: T;
  onChange: (value: T) => void;
  align?: "left" | "right";
}) {
  return (
    <div className="space-y-3">
      <p
        className={`text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground ${
          align === "right" ? "text-left xl:text-right" : ""
        }`}
      >
        {label}
      </p>
      <div
        className={`flex flex-wrap gap-2 ${
          align === "right" ? "xl:justify-end" : ""
        }`}
      >
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            className={
              value === option.value
                ? "bg-amber-700 text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
                : "border-border bg-transparent text-foreground hover:bg-accent hover:text-foreground dark:border-amber-500/20 dark:hover:bg-amber-500/10"
            }
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function FilterBar({
  size,
  category,
  sort,
  categories,
  showCategoryFilter = true,
  onSizeChange,
  onCategoryChange,
  onSortChange,
}: FilterBarProps) {
  const { copy } = useLanguage();

  return (
    <section className="rounded-[1.75rem] border border-border bg-background/70 p-5 backdrop-blur dark:border-amber-500/10 dark:bg-background/50 sm:p-6">
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          {showCategoryFilter ? (
            <ToggleGroup
              label={copy.filterCategory}
              options={[
                { label: copy.filterAll, value: "all" },
                ...categories.map((item) => ({
                  label: item.name.toUpperCase(),
                  value: item.slug,
                })),
              ]}
              value={category}
              onChange={onCategoryChange}
            />
          ) : (
            <div className="space-y-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                {copy.filterCategory}
              </p>
              <p className="text-sm text-muted-foreground">{copy.filterLockedCategoryHelp}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 xl:items-end">
            <ToggleGroup
              label={copy.filterSort}
              align="right"
              options={[
                { label: copy.filterFeatured.toUpperCase(), value: "featured" },
                {
                  label: (
                    <span className="inline-flex items-center gap-1.5 uppercase">
                      <span>PRICE</span>
                      <ArrowUp className="size-3.5" />
                    </span>
                  ),
                  value: "price-asc",
                },
                {
                  label: (
                    <span className="inline-flex items-center gap-1.5 uppercase">
                      <span>PRICE</span>
                      <ArrowDown className="size-3.5" />
                    </span>
                  ),
                  value: "price-desc",
                },
              ]}
              value={sort}
              onChange={onSortChange}
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-6 dark:border-amber-500/10">
          <ToggleGroup
            label={copy.filterSize}
            options={sizeOptions.map((option) => ({
              label: option === "all" ? copy.filterAll : option,
              value: option,
            }))}
            value={size}
            onChange={onSizeChange}
          />
        </div>
      </div>
    </section>
  );
}
