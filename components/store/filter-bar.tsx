"use client";

import { Button } from "@/components/ui/button";
import { type ProductSort, type Size } from "@/types/catalog";

const sizeOptions: Array<Size | "all"> = ["all", "XS", "S", "M", "L", "XL"];
const sortOptions: Array<{ label: string; value: ProductSort }> = [
  { label: "Featured", value: "featured" },
  { label: "Price Low", value: "price-asc" },
  { label: "Price High", value: "price-desc" },
  { label: "A-Z", value: "name" },
];

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
  return (
    <section className="rounded-3xl border border-amber-500/10 bg-card/75 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.2fr_1fr_auto] lg:items-end">
        <ToggleGroup
          label="Size"
          options={sizeOptions.map((option) => ({
            label: option === "all" ? "All" : option,
            value: option,
          }))}
          value={size}
          onChange={onSizeChange}
        />

        {showCategoryFilter ? (
          <ToggleGroup
            label="Category"
            options={[
              { label: "All", value: "all" },
              ...categories.map((item) => ({ label: item.name, value: item.slug })),
            ]}
            value={category}
            onChange={onCategoryChange}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Category
            </p>
            <p className="text-sm text-muted-foreground">
              This collection keeps the route category fixed while size and sort remain persistent.
            </p>
          </div>
        )}

        <ToggleGroup
          label="Sort"
          options={sortOptions}
          value={sort}
          onChange={onSortChange}
        />

        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          className="border-amber-500/20 bg-transparent text-foreground hover:bg-amber-500/10 hover:text-foreground"
        >
          Clear filters
        </Button>
      </div>
    </section>
  );
}
