"use client";

import { Scale, X } from "lucide-react";
import { useEffect } from "react";
import { CATEGORY_ICONS } from "../catalog";
import { CONDITION_LABELS } from "../schema";
import type { GearItemRow } from "../gear-client";

const CONDITION_PILL: Record<string, string> = {
  new: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  like_new: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  good: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  fair: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  poor: "bg-red-500/20 text-red-300 border-red-500/30",
};

type GearRoomDetailProps = {
  item: GearItemRow | null;
  onClose: () => void;
};

export function GearRoomDetail({ item, onClose }: GearRoomDetailProps) {
  useEffect(() => {
    if (!item) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [item, onClose]);

  if (!item) return null;

  const categoryName = item.categories?.name ?? "Uncategorized";
  const CategoryIcon = CATEGORY_ICONS[categoryName];
  const conditionKey = item.condition as keyof typeof CONDITION_LABELS | undefined;
  const conditionLabel = conditionKey ? CONDITION_LABELS[conditionKey] ?? item.condition : null;
  const conditionPill = item.condition ? CONDITION_PILL[item.condition] ?? "" : "";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Detail card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div
          className="pointer-events-auto relative w-full max-w-md rounded-2xl border border-white/10 bg-stone-900/95 p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-6 pr-8">
            <h2 className="text-xl font-bold text-stone-100">{item.name}</h2>
            {(item.brand || item.model) ? (
              <p className="mt-1 text-sm text-stone-400">
                {[item.brand, item.model].filter(Boolean).join(" ")}
              </p>
            ) : null}
          </div>

          {/* Details grid */}
          <div className="space-y-4">
            {/* Category */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                {CategoryIcon ? <CategoryIcon size={18} /> : null}
              </div>
              <div>
                <p className="text-xs text-stone-500">Category</p>
                <p className="text-sm font-medium text-stone-200">{categoryName}</p>
              </div>
            </div>

            {/* Condition + Weight row */}
            <div className="flex flex-wrap gap-4">
              {conditionLabel ? (
                <div>
                  <p className="mb-1 text-xs text-stone-500">Condition</p>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${conditionPill}`}
                  >
                    {conditionLabel}
                  </span>
                </div>
              ) : null}
              {item.weight != null ? (
                <div>
                  <p className="mb-1 text-xs text-stone-500">Weight</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 bg-stone-800/80 px-3 py-1 text-sm font-medium text-stone-200">
                    <Scale size={14} />
                    {item.weight} kg
                  </span>
                </div>
              ) : null}
            </div>

            {/* Notes */}
            {item.notes ? (
              <div>
                <p className="mb-1 text-xs text-stone-500">Notes</p>
                <p className="whitespace-pre-wrap rounded-lg bg-stone-800/50 p-3 text-sm text-stone-300">
                  {item.notes}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
