"use client";

import {
  Backpack,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Droplets,
  Loader2,
  Package,
  Plus,
  Scale,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getGearIcon } from "@/app/gear/gear-icons";
import type { BagData, TripItemData } from "./trip-detail";

const BAG_TYPE_ICONS: Record<string, typeof Backpack> = {
  backpack: Backpack,
  daypack: ShoppingBag,
  duffel: Briefcase,
  stuff_sack: Package,
  dry_bag: Droplets,
  hip_pack: ShoppingBag,
  other: Package,
};

const BAG_TYPE_COLORS: Record<string, { bg: string; accent: string; bar: string }> = {
  backpack: { bg: "bg-amber-500/10", accent: "text-amber-400", bar: "bg-amber-500" },
  daypack: { bg: "bg-sky-500/10", accent: "text-sky-400", bar: "bg-sky-500" },
  duffel: { bg: "bg-violet-500/10", accent: "text-violet-400", bar: "bg-violet-500" },
  stuff_sack: { bg: "bg-emerald-500/10", accent: "text-emerald-400", bar: "bg-emerald-500" },
  dry_bag: { bg: "bg-cyan-500/10", accent: "text-cyan-400", bar: "bg-cyan-500" },
  hip_pack: { bg: "bg-orange-500/10", accent: "text-orange-400", bar: "bg-orange-500" },
  other: { bg: "bg-g-raised", accent: "text-g-text-3", bar: "bg-g-text-3" },
};

type TripBagPackingProps = {
  items: TripItemData[];
  userBags: BagData[];
  activeBagIds: string[];
  onAddBag: (bagId: string) => void;
  onRemoveBag: (bagId: string) => void;
  onAssignBag: (tripItemId: string, bagId: string | null) => void;
};

export function TripBagPacking({
  items,
  userBags,
  activeBagIds,
  onAddBag,
  onRemoveBag,
  onAssignBag,
}: TripBagPackingProps) {
  const [expanded, setExpanded] = useState(true);
  const [showBagPicker, setShowBagPicker] = useState(false);

  const activeBags = useMemo(
    () => userBags.filter((b) => activeBagIds.includes(b.id)),
    [userBags, activeBagIds],
  );

  const availableBags = useMemo(
    () => userBags.filter((b) => !activeBagIds.includes(b.id)),
    [userBags, activeBagIds],
  );

  // Items grouped by bag
  const bagItems = useMemo(() => {
    const map = new Map<string | null, TripItemData[]>();
    for (const item of items) {
      const key = item.bagId;
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    return map;
  }, [items]);

  const unassigned = bagItems.get(null) ?? [];

  if (activeBags.length === 0 && availableBags.length === 0) return null;

  return (
    <div className="rounded-xl border border-g-border bg-g-card backdrop-blur-md overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-g-raised/50"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
          <Backpack size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-g-text">
            Pack into Bags
            {activeBags.length > 0 ? (
              <span className="ml-2 rounded-full bg-g-raised px-2 py-0.5 text-[11px] font-medium text-g-text-3">
                {activeBags.length} bag{activeBags.length !== 1 ? "s" : ""}
              </span>
            ) : null}
          </p>
          <p className="text-[11px] text-g-text-3">
            Assign gear to your bags and track capacity
          </p>
        </div>
        {expanded ? (
          <ChevronDown size={16} className="text-g-text-3" />
        ) : (
          <ChevronRight size={16} className="text-g-text-3" />
        )}
      </button>

      {expanded ? (
        <div className="border-t border-g-border/50 p-4 space-y-4">
          {/* Active bags */}
          {activeBags.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {activeBags.map((bag) => (
                <BagCard
                  key={bag.id}
                  bag={bag}
                  items={bagItems.get(bag.id) ?? []}
                  allItems={items}
                  onRemoveBag={onRemoveBag}
                  onAssignBag={onAssignBag}
                />
              ))}
            </div>
          ) : null}

          {/* Unassigned items */}
          {unassigned.length > 0 && activeBags.length > 0 ? (
            <div className="rounded-lg border border-dashed border-g-border p-3">
              <p className="text-xs font-medium text-g-text-3 mb-2">
                Unassigned items ({unassigned.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {unassigned.map((item) => (
                  <UnassignedChip
                    key={item.tripItemId}
                    item={item}
                    bags={activeBags}
                    onAssign={onAssignBag}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Add bag button */}
          <div className="flex items-center gap-2">
            {showBagPicker ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-g-border bg-g-raised p-2">
                {availableBags.length > 0 ? (
                  availableBags.map((bag) => {
                    const BagIcon = BAG_TYPE_ICONS[bag.bag_type] ?? Package;
                    const colors = BAG_TYPE_COLORS[bag.bag_type] ?? BAG_TYPE_COLORS.other;
                    return (
                      <button
                        key={bag.id}
                        type="button"
                        onClick={() => {
                          onAddBag(bag.id);
                          if (availableBags.length <= 1) setShowBagPicker(false);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-g-border bg-g-card px-3 py-1.5 text-xs font-medium text-g-text-2 transition-colors hover:border-g-border-active"
                      >
                        <BagIcon size={12} className={colors.accent} />
                        {bag.name}
                        {bag.volume_liters ? <span className="text-g-text-4">{bag.volume_liters}L</span> : null}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-g-text-3 px-2">
                    All bags added.{" "}
                    <Link href="/bags" className="text-g-accent hover:underline">
                      Create more
                    </Link>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowBagPicker(false)}
                  className="flex h-6 w-6 items-center justify-center rounded text-g-text-4 hover:text-g-text-2"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowBagPicker(true)}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-g-border px-3 py-1.5 text-xs font-medium text-g-text-3 transition-colors hover:border-g-border-active hover:text-g-text-2"
              >
                <Plus size={12} />
                Add a bag to this trip
              </button>
            )}
            {activeBags.length === 0 ? (
              <Link
                href="/bags"
                className="text-xs text-g-accent hover:underline"
              >
                Manage bags
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Individual bag card with fill meter ── */

function BagCard({
  bag,
  items,
  allItems,
  onRemoveBag,
  onAssignBag,
}: {
  bag: BagData;
  items: TripItemData[];
  allItems: TripItemData[];
  onRemoveBag: (bagId: string) => void;
  onAssignBag: (tripItemId: string, bagId: string | null) => void;
}) {
  const [showAssign, setShowAssign] = useState(false);
  const BagIcon = BAG_TYPE_ICONS[bag.bag_type] ?? Package;
  const colors = BAG_TYPE_COLORS[bag.bag_type] ?? BAG_TYPE_COLORS.other;

  const contentWeight = items.reduce((s, i) => s + (i.weight ?? 0), 0);
  const totalWeight = contentWeight + (bag.own_weight_kg ?? 0);
  const weightPercent = bag.max_weight_kg
    ? Math.min((totalWeight / bag.max_weight_kg) * 100, 100)
    : null;
  const overWeight = bag.max_weight_kg != null && totalWeight > bag.max_weight_kg;

  const unassignedItems = allItems.filter((i) => i.bagId === null);

  return (
    <div className={`rounded-xl border ${overWeight ? "border-red-500/30" : "border-g-border"} bg-g-card/80 overflow-hidden`}>
      {/* Bag header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.accent}`}>
          <BagIcon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-g-text truncate">{bag.name}</p>
          <div className="flex gap-2 text-[11px] text-g-text-3">
            {bag.volume_liters ? <span>{bag.volume_liters}L</span> : null}
            {bag.brand ? <span>{bag.brand}</span> : null}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className={`font-semibold ${overWeight ? "text-red-400" : "text-g-text-2"}`}>
            {totalWeight.toFixed(1)}
          </span>
          {bag.max_weight_kg ? (
            <span className="text-g-text-4">/ {bag.max_weight_kg} kg</span>
          ) : (
            <span className="text-g-text-4">kg</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemoveBag(bag.id)}
          className="shrink-0 flex h-6 w-6 items-center justify-center rounded text-g-text-4 hover:text-g-error-text transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Weight fill bar */}
      {weightPercent != null ? (
        <div className="px-4">
          <div className="h-2 rounded-full bg-g-raised overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overWeight
                  ? "bg-red-500"
                  : weightPercent >= 80
                    ? "bg-amber-500"
                    : colors.bar
              }`}
              style={{ width: `${weightPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-0.5 text-[10px] text-g-text-4">
            <span>{items.length} item{items.length !== 1 ? "s" : ""}</span>
            <span>
              {overWeight
                ? `${(totalWeight - bag.max_weight_kg!).toFixed(1)} kg over!`
                : `${(bag.max_weight_kg! - totalWeight).toFixed(1)} kg remaining`}
            </span>
          </div>
        </div>
      ) : (
        <div className="px-4 text-[10px] text-g-text-4">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Items in this bag */}
      {items.length > 0 ? (
        <div className="flex flex-col gap-0.5 px-3 py-2">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categoryName);
            return (
              <div
                key={item.tripItemId}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-g-raised/50 transition-colors group/bi"
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${colors.bg} ${colors.accent}`}>
                  <Icon size={12} />
                </div>
                <span className="flex-1 truncate text-g-text-2">{item.name}</span>
                {item.weight != null ? (
                  <span className="text-g-text-4 shrink-0">
                    <Scale size={9} className="inline mr-0.5" />
                    {item.weight} kg
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => onAssignBag(item.tripItemId, null)}
                  className="shrink-0 text-g-text-4 opacity-0 group-hover/bi:opacity-100 hover:text-g-error-text transition-all"
                  title="Unassign from bag"
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-3 text-center text-xs text-g-text-4">
          No items assigned yet
        </div>
      )}

      {/* Quick assign button */}
      {unassignedItems.length > 0 ? (
        <div className="border-t border-g-border/50 px-3 py-2">
          {showAssign ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-g-text-3">Assign item:</span>
                <button
                  type="button"
                  onClick={() => setShowAssign(false)}
                  className="text-g-text-4 hover:text-g-text-2"
                >
                  <X size={10} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {unassignedItems.map((item) => (
                  <button
                    key={item.tripItemId}
                    type="button"
                    onClick={() => {
                      onAssignBag(item.tripItemId, bag.id);
                    }}
                    className="flex items-center gap-1 rounded-md border border-g-border bg-g-raised px-2 py-0.5 text-[11px] text-g-text-2 hover:border-g-border-active transition-colors"
                  >
                    <Plus size={8} />
                    {item.name}
                    {item.weight != null ? (
                      <span className="text-g-text-4">{item.weight}kg</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAssign(true)}
              className="flex items-center gap-1 text-[11px] text-g-accent hover:underline"
            >
              <Plus size={10} />
              Assign items
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ── Unassigned item chip ── */

function UnassignedChip({
  item,
  bags,
  onAssign,
}: {
  item: TripItemData;
  bags: BagData[];
  onAssign: (tripItemId: string, bagId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md border border-g-border bg-g-card px-2 py-1 text-[11px] text-g-text-2 transition-colors hover:border-g-border-active"
      >
        {item.name}
        {item.weight != null ? (
          <span className="text-g-text-4">{item.weight}kg</span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute top-full left-0 z-10 mt-1 rounded-lg border border-g-border bg-g-card shadow-lg p-1 min-w-[140px]">
          {bags.map((bag) => {
            const BagIcon = BAG_TYPE_ICONS[bag.bag_type] ?? Package;
            const colors = BAG_TYPE_COLORS[bag.bag_type] ?? BAG_TYPE_COLORS.other;
            return (
              <button
                key={bag.id}
                type="button"
                onClick={() => {
                  onAssign(item.tripItemId, bag.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-g-text-2 hover:bg-g-raised transition-colors"
              >
                <BagIcon size={12} className={colors.accent} />
                {bag.name}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
