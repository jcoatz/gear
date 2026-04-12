"use client";

import { Heart, Pencil, Scale, Settings, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "../actions";
import { CONDITION_LABELS } from "../schema";
import { getTagGroup, TAG_GROUP_COLORS_DARK } from "../tags";
import { getGearIcon } from "../gear-icons";
import type { CategoryRow, GearItemRow } from "../gear-client";
import { TagEditor } from "./tag-editor";
import { DeleteConfirm } from "./delete-confirm";
import { EditItem } from "./edit-item";

const CONDITION_PILL: Record<string, string> = {
  new: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  like_new: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  good: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  fair: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  poor: "bg-red-500/20 text-red-300 border-red-500/30",
};

type GearDetailOverlayProps = {
  item: GearItemRow | null;
  categories: CategoryRow[];
  onClose: () => void;
};

export function GearDetailOverlay({ item, categories, onClose }: GearDetailOverlayProps) {
  const router = useRouter();
  const [view, setView] = useState<"detail" | "tags" | "delete" | "edit">("detail");

  useEffect(() => {
    if (!item) return;
    setView("detail");
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [item, onClose]);

  if (!item) return null;

  const categoryName = item.categories?.name ?? "Uncategorized";
  const conditionKey = item.condition as keyof typeof CONDITION_LABELS | undefined;
  const conditionLabel = conditionKey
    ? CONDITION_LABELS[conditionKey] ?? item.condition
    : null;
  const conditionPill = item.condition
    ? CONDITION_PILL[item.condition] ?? ""
    : "";

  const ItemIcon = getGearIcon(item.name, item.brand, categoryName);

  function handleSaved() {
    setView("detail");
    router.refresh();
  }

  function handleDeleted() {
    onClose();
    router.refresh();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Detail card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div
          className="pointer-events-auto relative w-full max-w-md rounded-2xl border border-white/10 bg-stone-900/95 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
          >
            <X size={18} />
          </button>

          {view === "edit" ? (
            <EditItem
              item={item}
              categories={categories}
              onBack={() => setView("detail")}
              onSaved={handleSaved}
            />
          ) : view === "tags" ? (
            <TagEditor
              item={item}
              onBack={() => setView("detail")}
              onSaved={handleSaved}
            />
          ) : view === "delete" ? (
            <DeleteConfirm
              item={item}
              onBack={() => setView("detail")}
              onDeleted={handleDeleted}
            />
          ) : (
            <div className="p-6">
              {/* Wishlist toggle */}
              <button
                type="button"
                onClick={async () => {
                  await toggleWishlist(item.id, !item.wishlist);
                  router.refresh();
                }}
                className={`absolute top-4 right-14 z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  item.wishlist
                    ? "bg-red-500/20 text-red-400"
                    : "text-stone-500 hover:bg-stone-800 hover:text-red-400"
                }`}
              >
                <Heart size={16} fill={item.wishlist ? "currentColor" : "none"} />
              </button>

              {/* Icon + header */}
              <div className="mb-6 flex items-start gap-4 pr-16">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <ItemIcon size={28} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-stone-100">
                    {item.name}
                  </h2>
                  {(item.brand || item.model) ? (
                    <p className="mt-0.5 text-sm text-stone-400">
                      {[item.brand, item.model].filter(Boolean).join(" ")}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-xs text-stone-500">{categoryName}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {/* Condition + Weight */}
                <div className="flex flex-wrap gap-3">
                  {conditionLabel ? (
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${conditionPill}`}
                    >
                      {conditionLabel}
                    </span>
                  ) : null}
                  {item.weight != null ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 bg-stone-800/80 px-3 py-1 text-sm font-medium text-stone-200">
                      <Scale size={14} />
                      {item.weight} kg
                    </span>
                  ) : null}
                </div>

                {/* Tags */}
                {item.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => {
                      const group = getTagGroup(tag);
                      const colors = group
                        ? TAG_GROUP_COLORS_DARK[group]
                        : {
                            bg: "bg-stone-800",
                            text: "text-stone-300",
                            border: "border-stone-700",
                          };
                      return (
                        <span
                          key={tag}
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                ) : null}

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

              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => setView("edit")}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300 transition-colors hover:bg-amber-500/20"
                >
                  <Settings size={14} />
                  Edit item
                </button>
                <button
                  type="button"
                  onClick={() => setView("tags")}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-stone-800/60 px-3 py-2 text-sm text-stone-300 transition-colors hover:bg-stone-800 hover:text-stone-100"
                >
                  <Pencil size={14} />
                  Edit tags
                </button>
                <button
                  type="button"
                  onClick={() => setView("delete")}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20 ml-auto"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
