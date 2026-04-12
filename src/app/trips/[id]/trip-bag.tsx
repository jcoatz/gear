"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Backpack,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  GripVertical,
  Scale,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getGearIcon } from "@/app/gear/gear-icons";
import type { TripItemData } from "./trip-detail";

type TripBagProps = {
  items: TripItemData[];
  packedWeight: number;
  totalWeight: number;
  targetWeight: number | null;
  onTogglePacked: (tripItemId: string, packed: boolean) => void;
  onRemove: (gearItemId: string) => void;
  onReorder: (orderedIds: string[]) => void;
};

type CategoryGroup = {
  name: string;
  items: TripItemData[];
  totalWeight: number;
  packedWeight: number;
  packedCount: number;
};

const CATEGORY_ORDER = [
  "Tents & Shelters",
  "Sleep Systems",
  "Clothing",
  "Cooking",
  "Navigation",
  "Safety",
  "Other",
];

function getCategorySort(name: string): number {
  const idx = CATEGORY_ORDER.indexOf(name);
  return idx >= 0 ? idx : CATEGORY_ORDER.length;
}

export function TripBag({
  items,
  packedWeight,
  totalWeight,
  targetWeight,
  onTogglePacked,
  onRemove,
  onReorder,
}: TripBagProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "trip-bag" });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const progress = targetWeight
    ? Math.min((totalWeight / targetWeight) * 100, 100)
    : null;

  // Group items by category
  const groups = useMemo(() => {
    const map = new Map<string, TripItemData[]>();
    for (const item of items) {
      const cat = item.categoryName ?? "Uncategorised";
      const arr = map.get(cat) ?? [];
      arr.push(item);
      map.set(cat, arr);
    }

    const result: CategoryGroup[] = [];
    for (const [name, groupItems] of map) {
      result.push({
        name,
        items: groupItems,
        totalWeight: groupItems.reduce((s, i) => s + (i.weight ?? 0), 0),
        packedWeight: groupItems.filter((i) => i.packed).reduce((s, i) => s + (i.weight ?? 0), 0),
        packedCount: groupItems.filter((i) => i.packed).length,
      });
    }

    result.sort((a, b) => getCategorySort(a.name) - getCategorySort(b.name));
    return result;
  }, [items]);

  const totalPacked = items.filter((i) => i.packed).length;

  function toggleCollapsed(cat: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border-2 transition-colors ${
        isOver
          ? "border-amber-500/40 bg-amber-500/[0.05]"
          : "border-g-border bg-g-card"
      } backdrop-blur-md`}
    >
      {/* Header */}
      <div className="border-b border-g-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-g-text">
            <Backpack size={16} className="text-g-accent" />
            Trip Bag
            <span className="text-g-text-3">({items.length})</span>
          </h2>
          {items.length > 0 ? (
            <span className="text-xs text-g-text-3">
              {totalPacked}/{items.length} packed
            </span>
          ) : null}
        </div>

        {/* Overall packed progress */}
        {items.length > 0 ? (
          <div className="mt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-g-raised">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${items.length > 0 ? (totalPacked / items.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Weight progress bar */}
        {progress != null ? (
          <div className="mt-2">
            <div className="mb-1 flex justify-between text-[10px] text-g-text-3">
              <span>{totalWeight.toFixed(1)} kg</span>
              <span>{targetWeight} kg target</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-g-raised">
              <div
                className={`h-full rounded-full transition-all ${
                  progress >= 100 ? "bg-red-500" : progress >= 80 ? "bg-amber-500" : "bg-sky-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Items grouped by category */}
      <div className="overflow-y-auto" style={{ maxHeight: "32rem" }}>
        {items.length === 0 ? (
          <div className="p-3">
            <div
              className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed py-12 text-center transition-colors ${
                isOver
                  ? "border-amber-500/30 text-amber-300"
                  : "border-g-border text-g-text-3"
              }`}
            >
              <Backpack size={28} />
              <p className="text-sm">
                {isOver ? "Drop to add!" : "Drag gear here to pack"}
              </p>
            </div>
          </div>
        ) : (
          groups.map((group) => {
            const isCollapsed = collapsed.has(group.name);
            const groupProgress = group.items.length > 0
              ? (group.packedCount / group.items.length) * 100
              : 0;
            const allPacked = group.packedCount === group.items.length;

            return (
              <div key={group.name} className="border-b border-g-border/50 last:border-b-0">
                {/* Category header */}
                <button
                  type="button"
                  onClick={() => toggleCollapsed(group.name)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-g-raised/50"
                >
                  {isCollapsed ? (
                    <ChevronRight size={14} className="shrink-0 text-g-text-4" />
                  ) : (
                    <ChevronDown size={14} className="shrink-0 text-g-text-4" />
                  )}

                  <span className="flex-1 text-xs font-bold uppercase tracking-wider text-g-text-3">
                    {group.name}
                  </span>

                  {/* Per-category stats */}
                  <span className="flex items-center gap-2 text-[11px] text-g-text-4">
                    <span className={allPacked ? "text-emerald-400" : ""}>
                      {group.packedCount}/{group.items.length}
                    </span>
                    {group.totalWeight > 0 ? (
                      <span className="flex items-center gap-0.5">
                        <Scale size={9} />
                        {group.totalWeight.toFixed(1)}
                      </span>
                    ) : null}
                  </span>

                  {/* Mini progress */}
                  <div className="w-10 h-1 rounded-full bg-g-raised overflow-hidden shrink-0">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        allPacked ? "bg-emerald-500" : "bg-g-accent"
                      }`}
                      style={{ width: `${groupProgress}%` }}
                    />
                  </div>
                </button>

                {/* Category items */}
                {!isCollapsed ? (
                  <SortableContext
                    items={group.items.map((i) => i.tripItemId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-1 px-3 pb-2">
                      {group.items.map((item) => (
                        <SortableBagItem
                          key={item.tripItemId}
                          item={item}
                          onTogglePacked={onTogglePacked}
                          onRemove={onRemove}
                        />
                      ))}
                    </div>
                  </SortableContext>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Footer summary */}
      {items.length > 0 ? (
        <div className="border-t border-g-border px-4 py-2.5 text-xs text-g-text-3">
          <span className="text-g-text-2">{packedWeight.toFixed(1)} kg</span>{" "}
          packed of {totalWeight.toFixed(1)} kg total
          <span className="mx-1.5 text-g-text-4">·</span>
          {groups.length} {groups.length === 1 ? "category" : "categories"}
        </div>
      ) : null}
    </div>
  );
}

/* ── Individual bag item ── */

function SortableBagItem({
  item,
  onTogglePacked,
  onRemove,
}: {
  item: TripItemData;
  onTogglePacked: (tripItemId: string, packed: boolean) => void;
  onRemove: (gearItemId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.tripItemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <BagItem
        item={item}
        onTogglePacked={onTogglePacked}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function BagItem({
  item,
  onTogglePacked,
  onRemove,
  dragHandleProps,
}: {
  item: TripItemData;
  onTogglePacked: (tripItemId: string, packed: boolean) => void;
  onRemove: (gearItemId: string) => void;
  dragHandleProps?: Record<string, unknown>;
}) {
  const Icon = getGearIcon(item.name, item.brand, item.categoryName);
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-2 py-2.5 transition-all ${
        item.packed
          ? "border-emerald-500/20 bg-emerald-500/[0.05]"
          : "border-g-border bg-g-raised"
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none text-g-text-4 hover:text-g-text-3 active:cursor-grabbing"
        {...dragHandleProps}
      >
        <GripVertical size={14} />
      </button>

      {/* Pack toggle */}
      <button
        type="button"
        onClick={() => onTogglePacked(item.tripItemId, !item.packed)}
        className={`shrink-0 transition-colors ${
          item.packed
            ? "text-emerald-400"
            : "text-g-text-4 hover:text-g-text-2"
        }`}
      >
        {item.packed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            item.packed ? "text-g-text-2 line-through" : "text-g-text"
          }`}
        >
          {item.name}
        </p>
        <div className="flex gap-2 text-[11px] text-g-text-3">
          {item.brand ? <span>{item.brand}</span> : null}
          {item.weight != null ? (
            <span className="flex items-center gap-0.5">
              <Scale size={9} />
              {item.weight} kg
            </span>
          ) : null}
        </div>
      </div>

      {/* Remove with confirm */}
      {confirmRemove ? (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onRemove(item.gearItemId)}
            className="rounded-md bg-red-500/20 px-2 py-0.5 text-[11px] font-medium text-red-400 hover:bg-red-500/30"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={() => setConfirmRemove(false)}
            className="rounded-md px-1.5 py-0.5 text-[11px] text-g-text-4 hover:text-g-text-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmRemove(true)}
          className="shrink-0 text-g-text-4 transition-colors hover:text-g-error-text"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
