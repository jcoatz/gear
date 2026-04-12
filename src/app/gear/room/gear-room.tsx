"use client";

import {
  Backpack,
  Flame,
  Shirt,
  Compass,
  ShieldAlert,
  Moon,
  Package,
  Tent,
  Scale,
} from "lucide-react";
import { useMemo } from "react";
import { getGearIcon } from "../gear-icons";
import { CONDITION_LABELS } from "../schema";
import type { CategoryRow, GearItemRow } from "../gear-client";
import { useCardTilt } from "./use-card-tilt";

type GearRoomProps = {
  items: GearItemRow[];
  categories: CategoryRow[];
  onSelectItem: (item: GearItemRow) => void;
};

/* ── Category → furniture zone mapping ── */
type ZoneId = "pegboard" | "shelves" | "wardrobe" | "floor" | "workbench" | "nightstand";

const CATEGORY_ZONE: Record<string, ZoneId> = {
  Safety: "pegboard",
  Navigation: "pegboard",
  Cooking: "shelves",
  Clothing: "wardrobe",
  "Tents & Shelters": "floor",
  "Sleep Systems": "nightstand",
  Other: "workbench",
};

const ZONE_ORDER: ZoneId[] = ["pegboard", "wardrobe", "shelves", "nightstand", "workbench", "floor"];

const ZONE_META: Record<
  ZoneId,
  { label: string; description: string }
> = {
  pegboard: { label: "Pegboard Wall", description: "Safety & navigation gear" },
  shelves: { label: "Kitchen Shelf", description: "Cooking & food prep" },
  wardrobe: { label: "Wardrobe", description: "Clothing & layers" },
  floor: { label: "Gear Corner", description: "Tents, shelters & big items" },
  workbench: { label: "Workbench", description: "Tools & accessories" },
  nightstand: { label: "Sleep Station", description: "Bags, pads & pillows" },
};

const CONDITION_DOTS: Record<string, string> = {
  new: "bg-emerald-400",
  like_new: "bg-teal-400",
  good: "bg-sky-400",
  fair: "bg-amber-400",
  poor: "bg-red-400",
};

export function GearRoom({ items, categories, onSelectItem }: GearRoomProps) {
  const zones = useMemo(() => {
    const map = new Map<ZoneId, GearItemRow[]>();
    for (const z of ZONE_ORDER) map.set(z, []);
    for (const item of items) {
      const catName = item.categories?.name ?? "Other";
      const zone = CATEGORY_ZONE[catName] ?? "workbench";
      map.get(zone)!.push(item);
    }
    return map;
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-g-border">
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-g-raised">
            <Backpack size={32} className="text-g-text-3" />
          </div>
          <div>
            <p className="font-medium text-g-text-2">Your gear room is empty</p>
            <p className="mt-1 text-sm text-g-text-3">
              Add some gear to see it displayed here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-g-border bg-gradient-to-b from-g-card to-g-page">
      {/* Room scene */}
      <div className="relative">
        {/* Wall texture — subtle dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, var(--g-dot) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex flex-col gap-0">
          {/* ── Upper wall: Pegboard + Wardrobe side by side ── */}
          <div className="grid gap-0 lg:grid-cols-2">
            <PegboardZone
              items={zones.get("pegboard")!}
              onSelectItem={onSelectItem}
            />
            <WardrobeZone
              items={zones.get("wardrobe")!}
              onSelectItem={onSelectItem}
            />
          </div>

          {/* ── Mid wall: Shelves + Nightstand ── */}
          <div className="grid gap-0 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ShelfZone
                items={zones.get("shelves")!}
                onSelectItem={onSelectItem}
              />
            </div>
            <NightstandZone
              items={zones.get("nightstand")!}
              onSelectItem={onSelectItem}
            />
          </div>

          {/* ── Floor level: Workbench + Floor corner ── */}
          <div className="grid gap-0 lg:grid-cols-2">
            <WorkbenchZone
              items={zones.get("workbench")!}
              onSelectItem={onSelectItem}
            />
            <FloorZone
              items={zones.get("floor")!}
              onSelectItem={onSelectItem}
            />
          </div>
        </div>

        {/* Floor gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-amber-900/10 dark:from-amber-900/5 to-transparent"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Individual Zone Components
   ═══════════════════════════════════════════════ */

function ZoneLabel({ label, count }: { label: string; count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-g-text-3">
        {label}
      </span>
      <span className="rounded-full bg-g-raised px-1.5 py-0.5 text-[10px] text-g-text-4">
        {count}
      </span>
    </div>
  );
}

/* ── Pegboard: dotted background, items "hung" on hooks ── */
function PegboardZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="relative border-b border-r border-g-border/50 p-5">
      {/* Pegboard holes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
        style={{
          backgroundImage: `radial-gradient(circle, var(--g-text-4, rgba(120,113,108,0.3)) 2px, transparent 2px)`,
          backgroundSize: "28px 28px",
          backgroundPosition: "14px 14px",
        }}
      />
      <div className="relative">
        <ZoneLabel label="Pegboard" count={items.length} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <HungItem key={item.id} item={item} onClick={() => onSelectItem(item)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HungItem({ item, onClick }: { item: GearItemRow; onClick: () => void }) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/hung flex flex-col items-center gap-1.5 rounded-lg p-3 transition-all hover:bg-white/[0.05] dark:hover:bg-white/[0.05]"
    >
      {/* Hook */}
      <div className="h-3 w-0.5 rounded-full bg-g-text-4/50" />
      {/* Item circle */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-g-border bg-g-card shadow-md transition-transform group-hover/hung:scale-110">
        <Icon size={22} className="text-g-accent" />
      </div>
      <p className="text-[11px] font-medium text-g-text-2 text-center leading-tight truncate max-w-full">
        {item.name}
      </p>
      {item.weight != null ? (
        <span className="text-[9px] text-g-text-4">{item.weight} kg</span>
      ) : null}
    </button>
  );
}

/* ── Wardrobe: tall container with rail and hanging clothes ── */
function WardrobeZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="relative border-b border-g-border/50 p-5">
      <ZoneLabel label="Wardrobe" count={items.length} />
      {/* Wardrobe frame */}
      <div className="rounded-xl border border-g-border bg-g-card/30 overflow-hidden">
        {/* Rail */}
        <div className="relative mx-4 mt-3 mb-1">
          <div className="h-0.5 rounded-full bg-g-text-4/40" />
        </div>
        {/* Hanging items */}
        <div className="flex flex-wrap gap-1 px-3 pb-4 pt-1">
          {items.map((item) => (
            <HangerItem key={item.id} item={item} onClick={() => onSelectItem(item)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HangerItem({ item, onClick }: { item: GearItemRow; onClick: () => void }) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  const dot = item.condition ? CONDITION_DOTS[item.condition] ?? "" : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/hang flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-2 transition-all hover:bg-white/[0.05] dark:hover:bg-white/[0.05]"
    >
      {/* Hanger hook */}
      <div className="flex flex-col items-center">
        <div className="h-2 w-0.5 bg-g-text-4/40" />
        <div className="h-1.5 w-4 rounded-b-full border-b border-l border-r border-g-text-4/40" />
      </div>
      {/* Garment */}
      <div className="flex h-14 w-10 flex-col items-center justify-center rounded-b-lg border border-t-0 border-g-border/60 bg-g-card/50 transition-transform group-hover/hang:scale-105">
        <Icon size={18} className="text-g-accent" />
        {dot ? <div className={`mt-1 h-1.5 w-1.5 rounded-full ${dot}`} /> : null}
      </div>
      <p className="mt-1 text-[10px] text-g-text-3 text-center leading-tight truncate max-w-[72px]">
        {item.name}
      </p>
    </button>
  );
}

/* ── Shelves: horizontal shelf lines with items sitting on them ── */
function ShelfZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  if (items.length === 0) return null;
  // Split items across 2 shelves
  const mid = Math.ceil(items.length / 2);
  const shelves = [items.slice(0, mid), items.slice(mid)].filter((s) => s.length > 0);

  return (
    <div className="relative border-b border-r border-g-border/50 p-5">
      <ZoneLabel label="Kitchen Shelf" count={items.length} />
      <div className="space-y-1">
        {shelves.map((shelf, si) => (
          <div key={si}>
            {/* Items on shelf */}
            <div className="flex flex-wrap gap-2 px-2 pb-1">
              {shelf.map((item) => (
                <ShelfItem key={item.id} item={item} onClick={() => onSelectItem(item)} />
              ))}
            </div>
            {/* Shelf plank */}
            <div className="h-1.5 rounded-sm bg-gradient-to-b from-amber-800/20 to-amber-900/10 dark:from-amber-700/15 dark:to-amber-800/8 shadow-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ShelfItem({ item, onClick }: { item: GearItemRow; onClick: () => void }) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/shelf flex flex-col items-center gap-1 rounded-lg px-2 pt-2 pb-0.5 transition-all hover:bg-white/[0.05] dark:hover:bg-white/[0.05]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-g-border/60 bg-g-card/60 shadow-sm transition-transform group-hover/shelf:scale-110 group-hover/shelf:-translate-y-1">
        <Icon size={18} className="text-g-accent" />
      </div>
      <p className="text-[10px] text-g-text-3 text-center leading-tight truncate max-w-[64px]">
        {item.name}
      </p>
    </button>
  );
}

/* ── Nightstand / Sleep station ── */
function NightstandZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="relative border-b border-g-border/50 p-5">
      <ZoneLabel label="Sleep Station" count={items.length} />
      {/* Bed / surface */}
      <div className="rounded-xl border border-g-border bg-gradient-to-br from-indigo-500/[0.04] to-violet-500/[0.04] dark:from-indigo-500/[0.03] dark:to-violet-500/[0.03] p-4">
        <div className="flex flex-wrap gap-3">
          {items.map((item) => (
            <SleepItem key={item.id} item={item} onClick={() => onSelectItem(item)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SleepItem({ item, onClick }: { item: GearItemRow; onClick: () => void }) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/sleep flex items-center gap-2.5 rounded-xl border border-g-border/60 bg-g-card/40 px-3 py-2.5 transition-all hover:bg-g-card/70 hover:border-g-border"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-indigo-500/10 text-indigo-400 transition-transform group-hover/sleep:scale-110">
        <Icon size={16} />
      </div>
      <div className="min-w-0 text-left">
        <p className="text-xs font-medium text-g-text truncate max-w-[100px]">{item.name}</p>
        {item.weight != null ? (
          <p className="text-[10px] text-g-text-4">{item.weight} kg</p>
        ) : null}
      </div>
    </button>
  );
}

/* ── Workbench: flat surface with tools laid out ── */
function WorkbenchZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="relative border-b border-r border-g-border/50 p-5">
      <ZoneLabel label="Workbench" count={items.length} />
      {/* Bench surface */}
      <div className="rounded-xl border border-g-border bg-gradient-to-b from-amber-800/[0.06] to-amber-900/[0.03] dark:from-amber-700/[0.04] dark:to-amber-800/[0.02] p-4">
        <div className="flex flex-wrap gap-2.5">
          {items.map((item) => (
            <BenchItem key={item.id} item={item} onClick={() => onSelectItem(item)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BenchItem({ item, onClick }: { item: GearItemRow; onClick: () => void }) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  const { ref, style, hovering, handlers } = useCardTilt(8, 1.08);
  return (
    <div ref={ref} style={style} {...handlers}>
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-1 rounded-lg border border-g-border/40 bg-g-card/30 p-2.5 transition-all hover:bg-g-card/60 hover:border-g-border"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
          <Icon size={18} />
        </div>
        <p className="text-[10px] font-medium text-g-text-2 text-center leading-tight truncate max-w-[68px]">
          {item.name}
        </p>
      </button>
    </div>
  );
}

/* ── Floor: big items like tents/packs leaning against the wall ── */
function FloorZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="relative border-b border-g-border/50 p-5">
      <ZoneLabel label="Gear Corner" count={items.length} />
      <div className="flex flex-wrap gap-3">
        {items.map((item, i) => (
          <FloorItem
            key={item.id}
            item={item}
            lean={i % 3 === 0 ? -3 : i % 3 === 1 ? 2 : 0}
            onClick={() => onSelectItem(item)}
          />
        ))}
      </div>
    </div>
  );
}

function FloorItem({
  item,
  lean,
  onClick,
}: {
  item: GearItemRow;
  lean: number;
  onClick: () => void;
}) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/floor flex flex-col items-center gap-1.5 rounded-xl border border-g-border/50 bg-g-card/30 p-3 transition-all hover:bg-g-card/60 hover:border-g-border hover:shadow-lg"
      style={{ transform: `rotate(${lean}deg)` }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-g-accent-surface text-g-accent transition-transform group-hover/floor:scale-110 group-hover/floor:rotate-0">
        <Icon size={28} />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-g-text truncate max-w-[80px]">{item.name}</p>
        {item.brand ? (
          <p className="text-[10px] text-g-text-4 truncate max-w-[80px]">{item.brand}</p>
        ) : null}
        {item.weight != null ? (
          <p className="text-[10px] text-g-text-4 flex items-center justify-center gap-0.5">
            <Scale size={8} /> {item.weight} kg
          </p>
        ) : null}
      </div>
    </button>
  );
}
