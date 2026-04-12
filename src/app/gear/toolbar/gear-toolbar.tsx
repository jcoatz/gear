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
              ? "border-g-border-active bg-g-accent-surface text-g-accent"
              : "border-g-border bg-g-raised text-g-text-3 hover:bg-g-raised hover:text-g-text-2"
          }`}
        >
          <Filter size={14} />
          <span className="hidden sm:inline">Filter</span>
          {filters.activeTags.length > 0 ? (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-g-accent-hover px-1 text-[10px] font-bold text-g-accent">
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
          <span className="text-xs text-g-text-3">
            {filteredCount} of {totalCount} items
          </span>
          {filters.categoryFilter ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-g-border bg-g-raised px-2.5 py-0.5 text-xs text-g-text-2">
              {filters.categoryFilter}
              <button
                type="button"
                onClick={() => filters.setCategoryFilter(null)}
                className="text-g-text-3 hover:text-g-text-2"
              >
                <X size={10} />
              </button>
            </span>
          ) : null}
          {filters.conditionFilter ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-g-border bg-g-raised px-2.5 py-0.5 text-xs text-g-text-2">
              {filters.conditionFilter}
              <button
                type="button"
                onClick={() => filters.setConditionFilter(null)}
                className="text-g-text-3 hover:text-g-text-2"
              >
                <X size={10} />
              </button>
            </span>
          ) : null}
          {filters.activeTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-g-border-active bg-g-accent-surface px-2.5 py-0.5 text-xs text-g-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => filters.toggleTag(tag)}
                className="text-g-accent/60 hover:text-g-accent"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={filters.clearFilters}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-g-text-3 transition-colors hover:text-g-text-2"
          >
            <RotateCcw size={10} />
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}
