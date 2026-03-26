import { describe, expect, it, beforeEach } from "vitest";

import { useFilterStore } from "@/store/filter-store";

describe("filter store", () => {
  beforeEach(() => {
    useFilterStore.setState({
      size: "all",
      category: "all",
      sort: "featured",
    });
  });

  it("initializes with default values", () => {
    const state = useFilterStore.getState();
    expect(state.size).toBe("all");
    expect(state.category).toBe("all");
    expect(state.sort).toBe("featured");
  });

  it("sets size filter", () => {
    useFilterStore.getState().setFilter("size", "M");
    expect(useFilterStore.getState().size).toBe("M");
  });

  it("sets category filter", () => {
    useFilterStore.getState().setFilter("category", "balconette");
    expect(useFilterStore.getState().category).toBe("balconette");
  });

  it("sets sort order", () => {
    useFilterStore.getState().setFilter("sort", "price-asc");
    expect(useFilterStore.getState().sort).toBe("price-asc");
  });

  it("does not trigger unnecessary updates for same value", () => {
    const before = useFilterStore.getState();
    useFilterStore.getState().setFilter("size", "all");
    const after = useFilterStore.getState();
    expect(before).toBe(after);
  });

  it("clears all filters to defaults", () => {
    useFilterStore.getState().setFilter("size", "L");
    useFilterStore.getState().setFilter("category", "bridal");
    useFilterStore.getState().setFilter("sort", "price-desc");
    useFilterStore.getState().clearFilters();

    const state = useFilterStore.getState();
    expect(state.size).toBe("all");
    expect(state.category).toBe("all");
    expect(state.sort).toBe("featured");
  });
});
