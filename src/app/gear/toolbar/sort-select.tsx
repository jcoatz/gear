"use client";

import { ArrowUpDown } from "lucide-react";
import type { SortKey } from "../use-gear-filters";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "lightest", label: "Lightest" },
  { value: "heaviest", label: "Heaviest" },
  { value: "best-condition", label: "Best condition" },
];

type SortSelectProps = {
  value: SortKey;
  onChange: (v: SortKey) => void;
};

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative shrink-0">
      <ArrowUpDown
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="h-9 appearance-none rounded-lg border border-white/[0.08] bg-stone-800/60 pl-9 pr-8 text-sm text-stone-300 focus:border-amber-500/30 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
