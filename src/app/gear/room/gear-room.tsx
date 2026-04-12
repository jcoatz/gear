"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Backpack,
  Lamp,
  Scale,
  Shirt,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { getGearIcon } from "../gear-icons";
import { CONDITION_LABELS } from "../schema";
import type { CategoryRow, GearItemRow } from "../gear-client";

/* ═══════════════════════════════════════════════
   Props & Types
   ═══════════════════════════════════════════════ */

type GearRoomProps = {
  items: GearItemRow[];
  categories: CategoryRow[];
  onSelectItem: (item: GearItemRow) => void;
};

type ZoneId =
  | "pegboard"
  | "shelves"
  | "wardrobe"
  | "floor"
  | "workbench"
  | "nightstand";

const CATEGORY_ZONE: Record<string, ZoneId> = {
  Safety: "pegboard",
  Navigation: "pegboard",
  Cooking: "shelves",
  Clothing: "wardrobe",
  "Tents & Shelters": "floor",
  "Sleep Systems": "nightstand",
  Other: "workbench",
};

const ZONE_ORDER: ZoneId[] = [
  "pegboard",
  "wardrobe",
  "shelves",
  "nightstand",
  "workbench",
  "floor",
];

const CONDITION_COLORS: Record<string, string> = {
  new: "#34d399",
  like_new: "#2dd4bf",
  good: "#38bdf8",
  fair: "#fbbf24",
  poor: "#f87171",
};

/* ═══════════════════════════════════════════════
   Stagger animation helpers
   ═══════════════════════════════════════════════ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 28 },
  },
};

/* Deterministic pseudo-random from item id for organic placement */
function seededRand(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return ((hash & 0x7fffffff) % 1000) / 1000;
}

/* ═══════════════════════════════════════════════
   Hover Tooltip
   ═══════════════════════════════════════════════ */

function ItemTooltip({ item }: { item: GearItemRow }) {
  const condLabel = item.condition
    ? CONDITION_LABELS[item.condition as keyof typeof CONDITION_LABELS]
    : null;
  const condColor = item.condition ? CONDITION_COLORS[item.condition] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="pointer-events-none absolute -top-2 left-1/2 z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap"
    >
      <div className="rounded-lg border border-g-border bg-g-card px-3 py-2 shadow-xl shadow-black/20 backdrop-blur-md">
        <p className="text-sm font-semibold text-g-text">{item.name}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-g-text-3">
          {item.brand ? <span>{item.brand}</span> : null}
          {item.weight != null ? (
            <span className="flex items-center gap-1">
              <Scale size={10} />
              {item.weight} kg
            </span>
          ) : null}
          {condLabel ? (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: condColor ?? undefined }}
              />
              {condLabel}
            </span>
          ) : null}
          {item.price != null ? (
            <span className="text-emerald-500">${item.price}</span>
          ) : null}
        </div>
      </div>
      {/* Arrow */}
      <div className="mx-auto h-2 w-2 -translate-y-px rotate-45 border-b border-r border-g-border bg-g-card" />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Interactive Item Wrapper
   ═══════════════════════════════════════════════ */

function RoomItem({
  item,
  onClick,
  children,
  className = "",
  liftDistance = -10,
}: {
  item: GearItemRow;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  liftDistance?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className={`relative cursor-pointer ${className}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      whileHover={{ y: liftDistance, transition: { type: "spring", stiffness: 500, damping: 25 } }}
    >
      <AnimatePresence>{hovered ? <ItemTooltip item={item} /> : null}</AnimatePresence>
      {children}
      {/* Drop shadow that grows on hover */}
      <motion.div
        className="pointer-events-none absolute inset-x-1 -bottom-1 h-3 rounded-full bg-black/10 blur-sm dark:bg-black/25"
        animate={{
          scaleX: hovered ? 1.15 : 0.9,
          opacity: hovered ? 0.7 : 0.3,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Main GearRoom
   ═══════════════════════════════════════════════ */

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
          <p className="font-medium text-g-text-2">Your gear room is empty</p>
          <p className="mt-1 text-sm text-g-text-3">
            Add some gear to see it displayed here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-g-border">
      {/* ── Room shell ── */}
      <div className="relative min-h-[600px]">
        {/* Back wall */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg,
                var(--g-card) 0%,
                color-mix(in oklch, var(--g-page), transparent 20%) 70%,
                color-mix(in oklch, var(--g-page), transparent 5%) 100%
              )`,
          }}
        />

        {/* Wall texture — subtle plaster/paper grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23888' fill-opacity='1'%3E%3Cpath d='M5 0h1L0 5V4zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient window light from left side */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-0 h-full w-[400px] opacity-[0.07] dark:opacity-[0.04]"
          style={{
            background:
              "radial-gradient(ellipse at 0% 30%, rgba(255,220,150,1) 0%, transparent 70%)",
          }}
        />

        {/* ── Upper row: Pegboard + Wardrobe ── */}
        <div className="relative grid gap-0 lg:grid-cols-2">
          <PegboardZone items={zones.get("pegboard")!} onSelectItem={onSelectItem} />
          <WardrobeZone items={zones.get("wardrobe")!} onSelectItem={onSelectItem} />
        </div>

        {/* Wall/shelf divider line */}
        <div className="relative mx-6 h-px bg-gradient-to-r from-transparent via-g-border to-transparent" />

        {/* ── Middle row: Shelves + Nightstand ── */}
        <div className="relative grid gap-0 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ShelfUnit items={zones.get("shelves")!} onSelectItem={onSelectItem} />
          </div>
          <div className="lg:col-span-2">
            <NightstandZone items={zones.get("nightstand")!} onSelectItem={onSelectItem} />
          </div>
        </div>

        {/* ── Floor line ── */}
        <div className="relative mx-4">
          <div className="h-[2px] bg-gradient-to-r from-amber-800/20 via-amber-700/30 to-amber-800/20 dark:from-amber-800/10 dark:via-amber-700/15 dark:to-amber-800/10" />
        </div>

        {/* ── Floor row: Workbench + Floor corner ── */}
        <div className="relative grid gap-0 lg:grid-cols-2">
          <WorkbenchZone items={zones.get("workbench")!} onSelectItem={onSelectItem} />
          <FloorZone items={zones.get("floor")!} onSelectItem={onSelectItem} />
        </div>

        {/* Wooden floor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          style={{
            background: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 119px,
                rgba(139,90,43,0.06) 119px,
                rgba(139,90,43,0.06) 120px
              ),
              linear-gradient(
                180deg,
                transparent 0%,
                rgba(139,90,43,0.04) 30%,
                rgba(139,90,43,0.08) 100%
              )
            `,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PEGBOARD ZONE
   ═══════════════════════════════════════════════ */

function PegboardZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  return (
    <div className="relative p-6">
      {/* Zone label */}
      <ZoneLabel icon="pegboard" label="Pegboard" count={items.length} />

      {/* Pegboard panel */}
      <div className="relative mt-3 min-h-[160px] overflow-hidden rounded-xl border border-amber-800/10 dark:border-amber-700/10">
        {/* Board background — warm brown with hole grid */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(180,130,70,0.08) 0%,
                rgba(160,110,60,0.05) 50%,
                rgba(180,130,70,0.08) 100%
              )
            `,
          }}
        />
        {/* Pegboard holes */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.1) 3px, transparent 3px)`,
            backgroundSize: "24px 24px",
            backgroundPosition: "12px 12px",
          }}
        />

        {/* Hung items */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative flex flex-wrap gap-x-2 gap-y-1 p-4 pt-2"
        >
          {items.map((item) => (
            <PegboardItem key={item.id} item={item} onClick={() => onSelectItem(item)} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function PegboardItem({ item, onClick }: { item: GearItemRow; onClick: () => void }) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  const r = seededRand(String(item.id));
  const hookLen = 10 + r * 8;

  return (
    <RoomItem item={item} onClick={onClick} liftDistance={-6} className="flex flex-col items-center px-2">
      {/* Metal hook */}
      <div className="flex flex-col items-center">
        <div
          className="w-[3px] rounded-b-full"
          style={{
            height: hookLen,
            background: "linear-gradient(180deg, #94a3b8 0%, #64748b 100%)",
          }}
        />
        <div className="h-[6px] w-[10px] rounded-b-full border-b-2 border-l-2 border-r-2 border-slate-400 dark:border-slate-500" />
      </div>
      {/* Item body */}
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-g-border/60 bg-g-card shadow-md transition-all">
        <Icon size={24} className="text-g-accent" />
      </div>
      <span className="mt-1.5 max-w-[72px] truncate text-center text-[11px] font-medium text-g-text-2">
        {item.name}
      </span>
    </RoomItem>
  );
}

/* ═══════════════════════════════════════════════
   WARDROBE ZONE
   ═══════════════════════════════════════════════ */

function WardrobeZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  return (
    <div className="relative p-6">
      <ZoneLabel icon="wardrobe" label="Wardrobe" count={items.length} />

      {/* Wardrobe frame */}
      <div className="relative mt-3 min-h-[160px] overflow-hidden rounded-xl border-2 border-amber-800/15 dark:border-amber-700/10">
        {/* Wood frame effect */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(120,80,40,0.06) 0%,
                rgba(100,65,30,0.02) 20%,
                rgba(80,50,25,0.04) 100%
              )
            `,
          }}
        />

        {/* Top shelf/molding */}
        <div className="h-3 bg-gradient-to-b from-amber-800/10 to-transparent dark:from-amber-700/8" />

        {/* Rail */}
        <div className="relative mx-5 mt-1 mb-2">
          <div
            className="h-[4px] rounded-full"
            style={{
              background: "linear-gradient(90deg, #94a3b8 0%, #cbd5e1 40%, #94a3b8 100%)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
          />
          {/* Rail brackets */}
          <div className="absolute -top-1 left-4 h-3 w-[6px] rounded-b bg-slate-400/60" />
          <div className="absolute -top-1 right-4 h-3 w-[6px] rounded-b bg-slate-400/60" />
        </div>

        {/* Hanging clothes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative flex flex-wrap items-start gap-x-1 gap-y-2 px-4 pb-4"
        >
          {items.map((item) => (
            <HangerItem key={item.id} item={item} onClick={() => onSelectItem(item)} />
          ))}
        </motion.div>

        {/* Floor of wardrobe — darker */}
        <div className="h-2 bg-gradient-to-t from-amber-900/8 to-transparent dark:from-amber-900/5" />
      </div>
    </div>
  );
}

function HangerItem({ item, onClick }: { item: GearItemRow; onClick: () => void }) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  const condColor = item.condition ? CONDITION_COLORS[item.condition] : null;
  const r = seededRand(String(item.id));
  const rotation = (r - 0.5) * 4; // slight random tilt

  return (
    <RoomItem item={item} onClick={onClick} liftDistance={-5} className="flex flex-col items-center">
      {/* Hanger */}
      <svg width="32" height="14" viewBox="0 0 32 14" className="text-slate-400 dark:text-slate-500">
        <path
          d="M16 0 L16 4 Q16 6 14 7 L4 12 Q2 13 2 11 L14 6 Q16 5 18 6 L30 11 Q30 13 28 12 L18 7 Q16 6 16 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Garment */}
      <div
        className="flex h-[72px] w-[48px] flex-col items-center justify-center rounded-b-xl border border-t-0 border-g-border/50 bg-g-card/80 shadow-md transition-all"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <Icon size={20} className="text-g-accent" />
        {condColor ? (
          <div
            className="mt-2 h-2 w-2 rounded-full"
            style={{ backgroundColor: condColor }}
          />
        ) : null}
      </div>
      <span className="mt-1.5 max-w-[56px] truncate text-center text-[10px] font-medium text-g-text-2">
        {item.name}
      </span>
    </RoomItem>
  );
}

/* ═══════════════════════════════════════════════
   SHELF UNIT
   ═══════════════════════════════════════════════ */

function ShelfUnit({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  // Distribute across 2 shelves
  const mid = Math.ceil(items.length / 2);
  const shelves = items.length > 0
    ? [items.slice(0, mid), items.slice(mid)].filter((s) => s.length > 0)
    : [];

  return (
    <div className="relative p-6">
      <ZoneLabel icon="shelf" label="Kitchen Shelf" count={items.length} />

      {/* Shelf unit frame */}
      <div className="relative mt-3 overflow-hidden rounded-xl border-2 border-amber-800/12 dark:border-amber-700/8">
        {/* Side panels */}
        <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-amber-800/10 to-transparent dark:from-amber-700/6" />
        <div className="absolute inset-y-0 right-0 w-[6px] bg-gradient-to-l from-amber-800/10 to-transparent dark:from-amber-700/6" />

        {shelves.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-sm text-g-text-3">
            Empty shelf
          </div>
        ) : (
          shelves.map((shelf, si) => (
            <div key={si}>
              {/* Items on this shelf */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative flex flex-wrap items-end gap-2 px-5 pb-1 pt-4"
              >
                {shelf.map((item) => (
                  <ShelfItem key={item.id} item={item} onClick={() => onSelectItem(item)} />
                ))}
              </motion.div>

              {/* Shelf plank — wooden with depth */}
              <div className="relative mx-1">
                <div
                  className="h-[6px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(160,110,50,0.20) 0%, rgba(140,90,40,0.15) 60%, rgba(120,75,35,0.10) 100%)",
                    borderRadius: "0 0 2px 2px",
                    boxShadow: "0 2px 6px rgba(100,70,30,0.12)",
                  }}
                />
                {/* Shelf edge highlight */}
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: "rgba(200,160,100,0.15)" }}
                />
              </div>
            </div>
          ))
        )}

        {/* Bottom of shelf unit */}
        <div className="h-3" />
      </div>
    </div>
  );
}

function ShelfItem({ item, onClick }: { item: GearItemRow; onClick: () => void }) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  const r = seededRand(String(item.id));
  const rotation = (r - 0.5) * 6;

  return (
    <RoomItem item={item} onClick={onClick} liftDistance={-8} className="flex flex-col items-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg border border-g-border/50 bg-g-card/80 shadow-md transition-all"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <Icon size={20} className="text-g-accent" />
      </div>
      <span className="mt-1 max-w-[64px] truncate text-center text-[10px] font-medium text-g-text-2">
        {item.name}
      </span>
    </RoomItem>
  );
}

/* ═══════════════════════════════════════════════
   NIGHTSTAND ZONE
   ═══════════════════════════════════════════════ */

function NightstandZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  return (
    <div className="relative p-6">
      <ZoneLabel icon="nightstand" label="Sleep Station" count={items.length} />

      <div className="relative mt-3">
        {/* Lamp */}
        <div className="absolute -top-1 right-4 z-10 flex flex-col items-center">
          {/* Lamp shade */}
          <div
            className="h-5 w-8 rounded-t-full"
            style={{
              background: "linear-gradient(180deg, rgba(251,191,36,0.25) 0%, rgba(251,191,36,0.10) 100%)",
              boxShadow: "0 0 20px rgba(251,191,36,0.15)",
            }}
          />
          {/* Lamp stem */}
          <div className="h-4 w-[2px] bg-slate-400/40" />
          {/* Lamp glow on surface */}
          <div
            className="absolute top-6 h-16 w-24 opacity-40"
            style={{
              background: "radial-gradient(ellipse, rgba(251,191,36,0.2) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Nightstand surface */}
        <div className="overflow-hidden rounded-xl border border-indigo-500/10 dark:border-indigo-400/10">
          {/* Surface */}
          <div
            className="relative min-h-[120px] p-4"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(99,102,241,0.04) 0%,
                  rgba(139,92,246,0.03) 50%,
                  rgba(99,102,241,0.05) 100%
                )
              `,
            }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-3"
            >
              {items.map((item) => (
                <NightstandItem key={item.id} item={item} onClick={() => onSelectItem(item)} />
              ))}
            </motion.div>

            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-g-text-4">No sleep gear yet</p>
            ) : null}
          </div>

          {/* Nightstand legs */}
          <div className="flex justify-between px-4">
            <div className="h-3 w-[3px] rounded-b bg-amber-800/15 dark:bg-amber-700/10" />
            <div className="h-3 w-[3px] rounded-b bg-amber-800/15 dark:bg-amber-700/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NightstandItem({ item, onClick }: { item: GearItemRow; onClick: () => void }) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);

  return (
    <RoomItem item={item} onClick={onClick} liftDistance={-6}>
      <div className="flex items-center gap-2.5 rounded-xl border border-indigo-500/15 bg-g-card/60 px-3 py-2.5 shadow-md transition-all hover:border-indigo-400/25 dark:border-indigo-400/10 dark:hover:border-indigo-400/20">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 dark:bg-indigo-500/15">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-g-text" style={{ maxWidth: 100 }}>
            {item.name}
          </p>
          {item.weight != null ? (
            <p className="text-[10px] text-g-text-4">{item.weight} kg</p>
          ) : null}
        </div>
      </div>
    </RoomItem>
  );
}

/* ═══════════════════════════════════════════════
   WORKBENCH ZONE
   ═══════════════════════════════════════════════ */

function WorkbenchZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  return (
    <div className="relative p-6">
      <ZoneLabel icon="workbench" label="Workbench" count={items.length} />

      <div className="relative mt-3">
        {/* Bench top */}
        <div className="overflow-hidden rounded-xl border-2 border-amber-800/12 dark:border-amber-700/8">
          {/* Wood grain surface */}
          <div
            className="relative min-h-[100px] p-4"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 11px,
                  rgba(139,90,43,0.04) 11px,
                  rgba(139,90,43,0.04) 12px
                ),
                linear-gradient(135deg,
                  rgba(180,130,70,0.06) 0%,
                  rgba(160,110,60,0.04) 50%,
                  rgba(180,130,70,0.06) 100%
                )
              `,
            }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-3"
            >
              {items.map((item) => (
                <WorkbenchItem key={item.id} item={item} onClick={() => onSelectItem(item)} />
              ))}
            </motion.div>

            {items.length === 0 ? (
              <p className="py-4 text-center text-sm text-g-text-4">Empty workbench</p>
            ) : null}
          </div>

          {/* Bench edge */}
          <div
            className="h-[5px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(160,110,50,0.18) 0%, rgba(120,75,35,0.12) 100%)",
              boxShadow: "0 2px 4px rgba(100,70,30,0.10)",
            }}
          />
        </div>

        {/* Metal legs */}
        <div className="flex justify-between px-6">
          <div className="h-6 w-[3px] rounded-b bg-slate-400/30" />
          <div className="h-6 w-[3px] rounded-b bg-slate-400/30" />
        </div>
      </div>
    </div>
  );
}

function WorkbenchItem({ item, onClick }: { item: GearItemRow; onClick: () => void }) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  const r = seededRand(String(item.id));
  const rotation = (r - 0.5) * 10;

  return (
    <RoomItem item={item} onClick={onClick} liftDistance={-8}>
      <div
        className="flex flex-col items-center gap-1 rounded-lg border border-g-border/40 bg-g-card/50 p-2.5 shadow-md transition-all hover:bg-g-card/80 hover:shadow-lg"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
          <Icon size={20} />
        </div>
        <span className="max-w-[68px] truncate text-center text-[10px] font-semibold text-g-text-2">
          {item.name}
        </span>
      </div>
    </RoomItem>
  );
}

/* ═══════════════════════════════════════════════
   FLOOR ZONE
   ═══════════════════════════════════════════════ */

function FloorZone({
  items,
  onSelectItem,
}: {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  return (
    <div className="relative p-6">
      <ZoneLabel icon="floor" label="Gear Corner" count={items.length} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-3 flex flex-wrap items-end gap-4"
      >
        {items.map((item, i) => (
          <FloorItem
            key={item.id}
            item={item}
            index={i}
            onClick={() => onSelectItem(item)}
          />
        ))}

        {items.length === 0 ? (
          <p className="w-full py-8 text-center text-sm text-g-text-4">
            No tents or shelters yet
          </p>
        ) : null}
      </motion.div>
    </div>
  );
}

function FloorItem({
  item,
  index,
  onClick,
}: {
  item: GearItemRow;
  index: number;
  onClick: () => void;
}) {
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  const r = seededRand(String(item.id));
  const lean = (r - 0.5) * 8;

  return (
    <RoomItem item={item} onClick={onClick} liftDistance={-6}>
      <div
        className="flex flex-col items-center gap-1.5 rounded-xl border border-g-border/50 bg-g-card/40 p-4 shadow-lg transition-all hover:bg-g-card/70 hover:shadow-xl"
        style={{ transform: `rotate(${lean}deg)` }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-g-accent-surface text-g-accent">
          <Icon size={30} />
        </div>
        <div className="text-center">
          <p className="max-w-[90px] truncate text-xs font-semibold text-g-text">
            {item.name}
          </p>
          {item.brand ? (
            <p className="max-w-[90px] truncate text-[10px] text-g-text-3">
              {item.brand}
            </p>
          ) : null}
          {item.weight != null ? (
            <p className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-g-text-4">
              <Scale size={9} /> {item.weight} kg
            </p>
          ) : null}
        </div>
      </div>
    </RoomItem>
  );
}

/* ═══════════════════════════════════════════════
   Zone Label
   ═══════════════════════════════════════════════ */

const ZONE_ICONS: Record<string, { emoji: string; color: string }> = {
  pegboard: { emoji: "🔩", color: "text-slate-400" },
  wardrobe: { emoji: "👔", color: "text-amber-400" },
  shelf: { emoji: "🍳", color: "text-orange-400" },
  nightstand: { emoji: "🌙", color: "text-indigo-400" },
  workbench: { emoji: "🔧", color: "text-amber-400" },
  floor: { emoji: "⛺", color: "text-emerald-400" },
};

function ZoneLabel({ icon, label, count }: { icon: string; label: string; count: number }) {
  const z = ZONE_ICONS[icon];
  return (
    <div className="flex items-center gap-2">
      {z ? <span className="text-sm">{z.emoji}</span> : null}
      <span className="text-xs font-bold uppercase tracking-wider text-g-text-3">
        {label}
      </span>
      {count > 0 ? (
        <span className="rounded-full bg-g-raised px-2 py-0.5 text-[10px] font-medium text-g-text-4">
          {count}
        </span>
      ) : null}
    </div>
  );
}
