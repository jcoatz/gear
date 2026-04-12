"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  Backpack,
  Check,
  CheckCircle2,
  Circle,
  Scale,
  Trash2,
} from "lucide-react";
import { getGearIcon } from "@/app/gear/gear-icons";
import type { TripItemData } from "./trip-detail";

type TripBagProps = {
  items: TripItemData[];
  packedWeight: number;
  totalWeight: number;
  targetWeight: number | null;
  onTogglePacked: (tripItemId: string, packed: boolean) => void;
  onRemove: (gearItemId: string) => void;
};

export function TripBag({
  items,
  packedWeight,
  totalWeight,
  targetWeight,
  onTogglePacked,
  onRemove,
}: TripBagProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "trip-bag" });

  const progress = targetWeight
    ? Math.min((totalWeight / targetWeight) * 100, 100)
    : null;

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
              {items.filter((i) => i.packed).length}/{items.length} packed
            </span>
          ) : null}
        </div>

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
                  progress >= 100 ? "bg-red-500" : progress >= 80 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1 overflow-y-auto p-3" style={{ maxHeight: "28rem" }}>
        {items.length === 0 ? (
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
        ) : (
          items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categoryName);
            return (
              <div
                key={item.tripItemId}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
                  item.packed
                    ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                    : "border-g-border bg-g-raised"
                }`}
              >
                {/* Pack toggle */}
                <button
                  type="button"
                  onClick={() =>
                    onTogglePacked(item.tripItemId, !item.packed)
                  }
                  className={`shrink-0 transition-colors ${
                    item.packed
                      ? "text-emerald-400"
                      : "text-g-text-4 hover:text-g-text-2"
                  }`}
                >
                  {item.packed ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Circle size={18} />
                  )}
                </button>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
                  <Icon size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      item.packed
                        ? "text-g-text-2 line-through"
                        : "text-g-text"
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

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => onRemove(item.gearItemId)}
                  className="shrink-0 text-g-text-4 transition-colors hover:text-g-error-text"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Packed weight summary */}
      {items.length > 0 ? (
        <div className="border-t border-g-border px-4 py-2.5 text-xs text-g-text-3">
          <span className="text-g-text-2">{packedWeight.toFixed(1)} kg</span>{" "}
          packed of {totalWeight.toFixed(1)} kg total
        </div>
      ) : null}
    </div>
  );
}
