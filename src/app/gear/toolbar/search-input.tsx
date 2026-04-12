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
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search gear..."
        className="h-9 w-full rounded-lg border border-white/[0.08] bg-stone-800/60 pl-9 pr-8 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500/30 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
