"use client";

import { Backpack } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORY_ICONS } from "../catalog";
import type { CategoryRow, GearItemRow } from "../gear-client";
import { GearRoomCard } from "./gear-room-card";
import { GearRoomDetail } from "./gear-room-detail";

type GearRoomProps = {
  items: GearItemRow[];
  categories: CategoryRow[];
};

const ROOM_BG = [
  // Overhead warm light
  "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(251,191,36,0.07) 0%, transparent 70%)",
  // Pegboard dot pattern
  "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
  // Base
  "rgb(28, 25, 23)",
].join(", ");

export function GearRoom({ items, categories }: GearRoomProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<GearItemRow | null>(null);

  // Group items by category
  const grouped = useMemo(() => {
    const map = new Map<string, GearItemRow[]>();
    for (const item of items) {
      const key = item.categories?.name ?? "Other";
      const arr = map.get(key);
      if (arr) arr.push(item);
      else map.set(key, [item]);
    }
    // Sort categories to match DB order
    const catOrder = categories.map((c) => c.name);
    const sorted = new Map<string, GearItemRow[]>();
    for (const name of catOrder) {
      const arr = map.get(name);
      if (arr) sorted.set(name, arr);
    }
    // Add "Other" / uncategorized at the end
    const other = map.get("Other");
    if (other && !sorted.has("Other")) sorted.set("Other", other);
    return sorted;
  }, [items, categories]);

  // Categories that have items
  const activeCats = useMemo(
    () => Array.from(grouped.keys()),
    [grouped],
  );

  // Filtered items for single-category view
  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return null;
    return grouped.get(activeCategory) ?? [];
  }, [activeCategory, grouped]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: ROOM_BG,
        backgroundSize: "100% 100%, 20px 20px, 100% 100%",
        minHeight: "32rem",
      }}
    >
      {/* Category nav */}
      <nav className="sticky top-0 z-30 flex items-center gap-2 overflow-x-auto border-b border-white/[0.06] bg-stone-900/80 px-4 py-3 backdrop-blur-md scrollbar-thin scrollbar-thumb-stone-700">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === "all"
              ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
              : "border-stone-700/50 bg-stone-800/60 text-stone-400 hover:bg-stone-800 hover:text-stone-300"
          }`}
        >
          All
          <span className="ml-1 rounded-full bg-stone-800/80 px-1.5 text-xs">
            {items.length}
          </span>
        </button>
        {activeCats.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const count = grouped.get(cat)?.length ?? 0;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
                  : "border-stone-700/50 bg-stone-800/60 text-stone-400 hover:bg-stone-800 hover:text-stone-300"
              }`}
            >
              {Icon ? <Icon size={14} /> : null}
              {cat}
              <span className="ml-1 rounded-full bg-stone-800/80 px-1.5 text-xs">
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <div className="px-4 py-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-800/80">
              <Backpack size={32} className="text-stone-500" />
            </div>
            <div>
              <p className="font-medium text-stone-300">Your gear shed is empty</p>
              <p className="mt-1 text-sm text-stone-500">
                Add some gear to see it displayed here.
              </p>
            </div>
          </div>
        ) : filteredItems ? (
          /* Single category view */
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredItems.map((item) => (
              <GearRoomCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        ) : (
          /* All categories — lane view */
          <div className="space-y-8">
            {activeCats.map((cat) => {
              const catItems = grouped.get(cat)!;
              const Icon = CATEGORY_ICONS[cat];
              return (
                <section key={cat}>
                  {/* Lane header */}
                  <div className="mb-3 flex items-center gap-2 px-1">
                    {Icon ? (
                      <Icon size={18} className="text-amber-400/80" />
                    ) : null}
                    <h2 className="font-semibold text-stone-200">{cat}</h2>
                    <span className="text-sm text-stone-500">
                      ({catItems.length})
                    </span>
                  </div>
                  {/* Lane backlight + items grid */}
                  <div className="relative">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -inset-x-2 rounded-xl bg-gradient-to-b from-amber-500/[0.03] to-transparent"
                    />
                    <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {catItems.map((item) => (
                        <GearRoomCard
                          key={item.id}
                          item={item}
                          onClick={() => setSelectedItem(item)}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail overlay */}
      <GearRoomDetail
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
