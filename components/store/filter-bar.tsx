"use client";

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
  onClear: () => void;
}

function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  align = "left",
}: {
  label: string;
  options: Array<{ label: string; value: T }>;
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
                ? "bg-amber-300 text-zinc-950 hover:bg-amber-200"
                : "border-amber-500/20 bg-transparent text-foreground hover:bg-amber-500/10 hover:text-foreground"
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
  onClear,
}: FilterBarProps) {
  const { copy } = useLanguage();

  return (
    <section className="rounded-[1.75rem] border border-amber-500/10 bg-background/50 p-5 backdrop-blur sm:p-6">
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          {showCategoryFilter ? (
            <ToggleGroup
              label={copy.filterCategory}
              options={[
                { label: copy.filterAll, value: "all" },
                ...categories.map((item) => ({ label: item.name, value: item.slug })),
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
                { label: copy.filterFeatured, value: "featured" },
                { label: copy.filterPriceLow, value: "price-asc" },
                { label: copy.filterPriceHigh, value: "price-desc" },
                { label: copy.filterAZ, value: "name" },
              ]}
              value={sort}
              onChange={onSortChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              className="rounded-full border-amber-500/20 bg-transparent text-foreground hover:bg-amber-500/10 hover:text-foreground"
            >
              {copy.filterClear}
            </Button>
          </div>
        </div>

        <div className="space-y-3 border-t border-amber-500/10 pt-6">
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
