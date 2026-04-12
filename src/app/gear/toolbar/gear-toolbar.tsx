"use client";

import { Filter, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import type { GearFilters } from "../use-gear-filters";
import type { CategoryRow } from "../gear-client";
import { SearchInput } from "./search-input";
import { SortSelect } from "./sort-select";
import { FilterChips } from "./filter-chips";

type GearToolbarProps = {
  filters: GearFilters;
  categories: CategoryRow[];
  totalCount: number;
  filteredCount: number;
};

export function GearToolbar({
  filters,
  categories,
  totalCount,
  filteredCount,
}: GearToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Main bar */}
      <div className="flex items-center gap-2">
        <SearchInput value={filters.search} onChange={filters.setSearch} />
        <SortSelect value={filters.sort} onChange={filters.setSort} />
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
            filtersOpen || filters.hasActiveFilters
              ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
              : "border-white/[0.08] bg-stone-800/60 text-stone-400 hover:bg-stone-800 hover:text-stone-300"
          }`}
        >
          <Filter size={14} />
          <span className="hidden sm:inline">Filter</span>
          {filters.activeTags.length > 0 ? (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/30 px-1 text-[10px] font-bold text-amber-300">
              {filters.activeTags.length}
            </span>
          ) : null}
        </button>
      </div>

      {/* Expanded filters */}
      {filtersOpen ? (
        <FilterChips filters={filters} categories={categories} />
      ) : null}

      {/* Active filters summary */}
      {filters.hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500">
            {filteredCount} of {totalCount} items
          </span>
          {filters.categoryFilter ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-stone-800/80 px-2.5 py-0.5 text-xs text-stone-300">
              {filters.categoryFilter}
              <button
                type="button"
                onClick={() => filters.setCategoryFilter(null)}
                className="text-stone-500 hover:text-stone-300"
              >
                <X size={10} />
              </button>
            </span>
          ) : null}
          {filters.conditionFilter ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-stone-800/80 px-2.5 py-0.5 text-xs text-stone-300">
              {filters.conditionFilter}
              <button
                type="button"
                onClick={() => filters.setConditionFilter(null)}
                className="text-stone-500 hover:text-stone-300"
              >
                <X size={10} />
              </button>
            </span>
          ) : null}
          {filters.activeTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => filters.toggleTag(tag)}
                className="text-amber-400/60 hover:text-amber-300"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={filters.clearFilters}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-stone-500 transition-colors hover:text-stone-300"
          >
            <RotateCcw size={10} />
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}
