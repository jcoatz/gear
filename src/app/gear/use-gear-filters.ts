"use client";

import { useMemo, useState } from "react";
import type { GearItemRow } from "./gear-client";
import { CONDITION_ORDER } from "./schema";
import { getTagGroup, type TagGroup } from "./tags";

export type SortKey =
  | "newest"
  | "name-asc"
  | "lightest"
  | "heaviest"
  | "best-condition";

export type GearFilters = {
  search: string;
  setSearch: (v: string) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;
  categoryFilter: string | null;
  setCategoryFilter: (v: string | null) => void;
  conditionFilter: string | null;
  setConditionFilter: (v: string | null) => void;
  activeTags: string[];
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  filteredItems: GearItemRow[];
};

function matchesSearch(item: GearItemRow, q: string): boolean {
  const hay = [item.name, item.brand ?? "", item.model ?? ""]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function sortItems(items: GearItemRow[], key: SortKey): GearItemRow[] {
  const sorted = [...items];
  switch (key) {
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "lightest":
      sorted.sort(
        (a, b) => (a.weight ?? 9999) - (b.weight ?? 9999),
      );
      break;
    case "heaviest":
      sorted.sort(
        (a, b) => (b.weight ?? 0) - (a.weight ?? 0),
      );
      break;
    case "best-condition":
      sorted.sort(
        (a, b) =>
          (CONDITION_ORDER[a.condition ?? ""] ?? 99) -
          (CONDITION_ORDER[b.condition ?? ""] ?? 99),
      );
      break;
    case "newest":
    default:
      // Keep original order (server returns newest first)
      break;
  }
  return sorted;
}

export function useGearFilters(items: GearItemRow[]): GearFilters {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSort("newest");
    setCategoryFilter(null);
    setConditionFilter(null);
    setActiveTags([]);
  };

  const hasActiveFilters =
    search.length > 0 ||
    categoryFilter !== null ||
    conditionFilter !== null ||
    activeTags.length > 0;

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = items;

    // Text search
    if (q.length > 0) {
      result = result.filter((i) => matchesSearch(i, q));
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter(
        (i) => i.categories?.name === categoryFilter,
      );
    }

    // Condition filter
    if (conditionFilter) {
      result = result.filter((i) => i.condition === conditionFilter);
    }

    // Tag filters: AND between groups, OR within a group
    if (activeTags.length > 0) {
      const groupedTags = new Map<TagGroup, string[]>();
      for (const tag of activeTags) {
        const group = getTagGroup(tag);
        if (!group) continue;
        const arr = groupedTags.get(group);
        if (arr) arr.push(tag);
        else groupedTags.set(group, [tag]);
      }

      result = result.filter((item) => {
        for (const [, tags] of groupedTags) {
          // Item must have at least one tag from each active group
          if (!tags.some((t) => item.tags.includes(t))) {
            return false;
          }
        }
        return true;
      });
    }

    return sortItems(result, sort);
  }, [items, search, sort, categoryFilter, conditionFilter, activeTags]);

  return {
    search,
    setSearch,
    sort,
    setSort,
    categoryFilter,
    setCategoryFilter,
    conditionFilter,
    setConditionFilter,
    activeTags,
    toggleTag,
    clearFilters,
    hasActiveFilters,
    filteredItems,
  };
}
