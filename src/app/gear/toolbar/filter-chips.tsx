"use client";

import type { GearFilters } from "../use-gear-filters";
import type { CategoryRow } from "../gear-client";
import { TAG_GROUPS, TAG_GROUP_COLORS_DARK } from "../tags";
import { GEAR_CONDITIONS, CONDITION_LABELS } from "../schema";

type FilterChipsProps = {
  filters: GearFilters;
  categories: CategoryRow[];
};

export function FilterChips({ filters, categories }: FilterChipsProps) {
  return (
    <div className="space-y-3 rounded-xl border border-g-border bg-g-card p-4 backdrop-blur-md">
      {/* Category chips */}
      <div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-g-text-3">
          Category
        </p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const active = filters.categoryFilter === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  filters.setCategoryFilter(active ? null : cat.name)
                }
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-g-border-active bg-g-accent-surface text-g-accent"
                    : "border-g-border bg-g-raised text-g-text-3 hover:bg-g-raised hover:text-g-text-2"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition chips */}
      <div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-g-text-3">
          Condition
        </p>
        <div className="flex flex-wrap gap-1.5">
          {GEAR_CONDITIONS.map((c) => {
            const active = filters.conditionFilter === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() =>
                  filters.setConditionFilter(active ? null : c)
                }
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-g-border-active bg-g-accent-surface text-g-accent"
                    : "border-g-border bg-g-raised text-g-text-3 hover:bg-g-raised hover:text-g-text-2"
                }`}
              >
                {CONDITION_LABELS[c]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag group chips */}
      {TAG_GROUPS.map((group) => {
        const colors = TAG_GROUP_COLORS_DARK[group.group];
        return (
          <div key={group.group}>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-g-text-3">
              {group.group}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.tags.map((tag) => {
                const active = filters.activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => filters.toggleTag(tag)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                      active
                        ? `${colors.border} ${colors.bg} ${colors.text}`
                        : "border-g-border bg-g-raised text-g-text-3 hover:bg-g-raised hover:text-g-text-2"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
