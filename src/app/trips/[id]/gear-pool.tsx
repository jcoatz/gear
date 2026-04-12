"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Loader2, Plus, Search, X } from "lucide-react";
import { getGearIcon } from "@/app/gear/gear-icons";
import type { GearPoolItem } from "./trip-detail";

type GearPoolProps = {
  gear: GearPoolItem[];
  search: string;
  onSearchChange: (v: string) => void;
  adding: string | null;
  onAdd: (id: string) => void;
};

function DraggableGearCard({
  item,
  adding,
  onAdd,
}: {
  item: GearPoolItem;
  adding: string | null;
  onAdd: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id });

  const Icon = getGearIcon(item.name, item.brand, item.categoryName);
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-white/[0.06] bg-stone-800/40 px-3 py-2.5 transition-all ${
        isDragging ? "opacity-30" : "hover:border-amber-500/20 hover:bg-stone-800/60"
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...listeners}
        {...attributes}
        className="cursor-grab touch-none text-stone-600 hover:text-stone-400 active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </button>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-stone-200">
          {item.name}
        </p>
        <div className="flex gap-2 text-[11px] text-stone-500">
          {item.brand ? <span>{item.brand}</span> : null}
          {item.weight != null ? <span>{item.weight} kg</span> : null}
        </div>
      </div>

      {/* Quick add button */}
      <button
        type="button"
        onClick={() => onAdd(item.id)}
        disabled={adding === item.id}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
      >
        {adding === item.id ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Plus size={14} />
        )}
      </button>
    </div>
  );
}

export function GearPool({
  gear,
  search,
  onSearchChange,
  adding,
  onAdd,
}: GearPoolProps) {
  return (
    <div className="flex flex-col rounded-xl border border-white/[0.06] bg-stone-900/60 backdrop-blur-md">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-200">
          Your Gear
          <span className="ml-2 text-stone-500">({gear.length})</span>
        </h2>
        <p className="mt-0.5 text-xs text-stone-500">
          Drag items into the trip bag, or click +
        </p>
      </div>

      {/* Search */}
      <div className="border-b border-white/[0.06] px-4 py-2">
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search gear..."
            className="h-8 w-full rounded-md border border-white/[0.06] bg-stone-800/40 pl-8 pr-7 text-xs text-stone-200 placeholder:text-stone-500 focus:border-amber-500/20 focus:outline-none"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
            >
              <X size={12} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1.5 overflow-y-auto p-3" style={{ maxHeight: "28rem" }}>
        {gear.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-500">
            {search ? "No matches" : "All gear is packed!"}
          </p>
        ) : (
          gear.map((item) => (
            <DraggableGearCard
              key={item.id}
              item={item}
              adding={adding}
              onAdd={onAdd}
            />
          ))
        )}
      </div>
    </div>
  );
}
