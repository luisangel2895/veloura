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
}: {
  label: string;
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
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
    <section className="rounded-3xl border border-amber-500/10 bg-card/75 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.2fr_1fr_auto] lg:items-end">
        <ToggleGroup
          label={copy.filterSize}
          options={sizeOptions.map((option) => ({
            label: option === "all" ? copy.filterAll : option,
            value: option,
          }))}
          value={size}
          onChange={onSizeChange}
        />

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
            <p className="text-sm text-muted-foreground">
              {copy.filterLockedCategoryHelp}
            </p>
          </div>
        )}

        <ToggleGroup
          label={copy.filterSort}
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
          className="border-amber-500/20 bg-transparent text-foreground hover:bg-amber-500/10 hover:text-foreground"
        >
          {copy.filterClear}
        </Button>
      </div>
    </section>
  );
}
