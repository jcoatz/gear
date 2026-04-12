"use client";

import { Search, X } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (v: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative flex-1">
      <Search
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-g-text-3"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search gear..."
        className="h-9 w-full rounded-lg border border-g-input-border bg-g-input pl-9 pr-8 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-g-text-3 hover:text-g-text-2"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
