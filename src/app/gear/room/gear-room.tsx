"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Backpack,
  Scale,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getGearIcon } from "../gear-icons";
import { CONDITION_LABELS } from "../schema";
import type { CategoryRow, GearItemRow } from "../gear-client";

/* ═══════════════════════════════════════════════
   Zone system — keyword routing (first match wins)
   ═══════════════════════════════════════════════ */

type ZoneId =
  | "pegboard"
  | "wardrobe"
  | "shoe_rack"
  | "hat_hooks"
  | "kitchen"
  | "hydration"
  | "bike_rack"
  | "ski_rack"
  | "paddle_rack"
  | "rope_rack"
  | "sleep"
  | "tent_corner"
  | "pack_wall"
  | "tech_station"
  | "food_box"
  | "camp_furniture"
  | "workbench";

type ZoneRule = { keywords: string[]; zone: ZoneId };

/**
 * Ordered keyword rules — first match wins.
 * Checked against lowercase(name + brand + categoryName).
 */
const ZONE_RULES: ZoneRule[] = [
  // Footwear
  { keywords: ["boot", "shoe", "trail runner", "sandal", "gaiter", "crampon", "approach shoe", "wading boot", "slipper", "flip flop", "camp shoe"], zone: "shoe_rack" },
  // Headwear & accessories
  { keywords: ["hat", "cap", "beanie", "balaclava", "buff", "bandana", "headband", "neck gaiter", "glove", "mitt", "sunglasses", "goggles", "watch", "wristband"], zone: "hat_hooks" },
  // Cycling
  { keywords: ["bike", "bicycle", "cycling", "cycle", "pedal", "derailleur", "handlebar", "saddle", "pannnier", "pannier", "bike light", "bike lock", "bike tool", "bike pump", "tube", "tire", "tyre", "cycling jersey", "cycling short", "cycling shoe", "clipless"], zone: "bike_rack" },
  // Skiing / snowboard
  { keywords: ["ski", "snowboard", "binding", "ski boot", "ski pole", "snow shoe", "snowshoe", "avalanche", "beacon", "probe", "shovel", "ski goggle", "ski helmet", "snow pant"], zone: "ski_rack" },
  // Paddle / water sports
  { keywords: ["kayak", "canoe", "paddle", "pfd", "life jacket", "dry bag", "dry suit", "wetsuit", "neoprene", "spray skirt", "throw bag", "snorkel", "fin", "surfboard", "sup ", "stand up paddle", "boat", "raft", "float"], zone: "paddle_rack" },
  // Climbing ropes & protection
  { keywords: ["rope", "cord", "sling", "runner", "quickdraw", "cam", "nut", "hex", "carabiner", "belay", "rappel", "descend", "ascend", "harness", "chalk"], zone: "rope_rack" },
  // Hydration
  { keywords: ["water bottle", "nalgene", "flask", "hydration", "water filter", "purifier", "katadyn", "sawyer", "bladder", "reservoir", "platypus", "collapsible bottle", "mug", "cup"], zone: "hydration" },
  // Sleep
  { keywords: ["sleeping bag", "quilt", "sleeping pad", "mattress", "air mattress", "pillow", "liner", "bivy", "bivvy", "sleep", "hammock underquilt", "hammock top"], zone: "sleep" },
  // Tent & shelter
  { keywords: ["tent", "tarp", "shelter", "footprint", "pole", "stake", "guy line", "hammock", "rain fly", "vestibule", "ground cloth", "bivy sack"], zone: "tent_corner" },
  // Packs & bags
  { keywords: ["backpack", "pack", "daypack", "rucksack", "duffel", "duffle", "stuff sack", "compression", "running vest", "hip pack", "fanny pack", "waist pack", "gear bag", "travel bag", "roller bag"], zone: "pack_wall" },
  // Kitchen / cooking
  { keywords: ["stove", "burner", "jetboil", "msr", "pot", "pan", "cookware", "cook set", "grill", "spatula", "tongs", "spork", "fork", "knife", "utensil", "cutting board", "plate", "bowl", "frying", "windscreen", "fuel", "canister", "lighter", "match", "fire steel", "firesteel"], zone: "kitchen" },
  // Food storage
  { keywords: ["food", "snack", "meal", "bar", "energy", "bear canister", "bear bag", "ursack", "cooler", "ice chest", "thermos", "food bag", "hang bag"], zone: "food_box" },
  // Electronics / tech
  { keywords: ["battery", "power bank", "charger", "solar", "panel", "gps", "garmin", "inreach", "camera", "gopro", "phone", "speaker", "bluetooth", "radio", "walkie", "satellite", "usb", "cable", "adapter", "drone", "action cam", "tripod", "headphone"], zone: "tech_station" },
  // Camp furniture
  { keywords: ["chair", "table", "furniture", "camp chair", "camp table", "stool", "cot", "bench", "lounger", "footrest", "camp bed", "lantern", "candle"], zone: "camp_furniture" },
  // Safety / pegboard (headlamps, first aid, etc.)
  { keywords: ["headlamp", "flashlight", "lantern", "light", "compass", "map", "whistle", "signal", "mirror", "first aid", "med kit", "emergency", "fire", "knife", "multi-tool", "leatherman", "repair", "patch", "duct tape", "saw", "axe", "hatchet", "mallet", "hammer", "binocular", "thermometer", "altimeter"], zone: "pegboard" },
  // Clothing (broadest — must be after more specific zones)
  { keywords: ["jacket", "shell", "rain jacket", "windbreaker", "shirt", "top", "jersey", "base layer", "fleece", "hoodie", "vest", "pant", "short", "sock", "underwear", "insulated", "down", "puffy", "rain pant", "soft shell", "hard shell", "mid layer", "thermal", "legging", "wrap", "poncho", "skirt", "dress", "sports bra", "compression"], zone: "wardrobe" },
];

/** Category-based fallback when no keyword matches */
const CATEGORY_ZONE_FALLBACK: Record<string, ZoneId> = {
  Safety: "pegboard",
  Navigation: "pegboard",
  Cooking: "kitchen",
  Clothing: "wardrobe",
  "Tents & Shelters": "tent_corner",
  "Sleep Systems": "sleep",
  Other: "workbench",
};

function resolveZone(item: GearItemRow): ZoneId {
  const haystack = [item.name, item.brand ?? "", item.categories?.name ?? ""]
    .join(" ")
    .toLowerCase();

  for (const rule of ZONE_RULES) {
    for (const kw of rule.keywords) {
      if (haystack.includes(kw)) return rule.zone;
    }
  }

  const catName = item.categories?.name ?? "Other";
  return CATEGORY_ZONE_FALLBACK[catName] ?? "workbench";
}

/* ═══════════════════════════════════════════════
   Zone metadata
   ═══════════════════════════════════════════════ */

type ZoneMeta = {
  id: ZoneId;
  label: string;
  emoji: string;
  row: number; // layout row (0=top, 1=upper-mid, 2=lower-mid, 3=floor)
  col: "left" | "right" | "full" | "left-wide" | "right-narrow";
};

const ZONES: ZoneMeta[] = [
  // Row 0 — Wall-mounted (upper)
  { id: "pegboard",       label: "Pegboard",          emoji: "🔩", row: 0, col: "left" },
  { id: "hat_hooks",      label: "Hat & Accessory Hooks", emoji: "🧢", row: 0, col: "right" },
  // Row 1 — Wardrobe + Shoe rack + Pack wall
  { id: "wardrobe",       label: "Wardrobe",          emoji: "👔", row: 1, col: "left-wide" },
  { id: "pack_wall",      label: "Pack Wall",         emoji: "🎒", row: 1, col: "right-narrow" },
  // Row 2 — Shelves / mid-height
  { id: "kitchen",        label: "Kitchen Cupboard",  emoji: "🍳", row: 2, col: "left" },
  { id: "hydration",      label: "Hydration Station", emoji: "💧", row: 2, col: "right" },
  // Row 3 — Tables / racks
  { id: "rope_rack",      label: "Rope & Climbing Rack", emoji: "🧗", row: 3, col: "left" },
  { id: "tech_station",   label: "Charging Station",  emoji: "🔋", row: 3, col: "right" },
  // Row 4 — Specialty racks
  { id: "bike_rack",      label: "Bike Hooks",        emoji: "🚲", row: 4, col: "left" },
  { id: "ski_rack",       label: "Ski & Snow Rack",   emoji: "⛷️", row: 4, col: "right" },
  // Row 5 — Sleep + nightstand level
  { id: "sleep",          label: "Sleep Station",     emoji: "🌙", row: 5, col: "left" },
  { id: "food_box",       label: "Food Locker",       emoji: "🐻", row: 5, col: "right" },
  // Row 6 — Floor level
  { id: "tent_corner",    label: "Tent Corner",       emoji: "⛺", row: 6, col: "left" },
  { id: "paddle_rack",    label: "Paddle & Water Rack", emoji: "🛶", row: 6, col: "right" },
  // Row 7 — Bottom
  { id: "camp_furniture", label: "Camp Furniture",    emoji: "🪑", row: 7, col: "left" },
  { id: "shoe_rack",      label: "Shoe & Boot Rack",  emoji: "🥾", row: 7, col: "right" },
  // Catch-all
  { id: "workbench",      label: "Workbench",         emoji: "🔧", row: 8, col: "full" },
];

/* ═══════════════════════════════════════════════
   Animation helpers
   ═══════════════════════════════════════════════ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 420, damping: 26 },
  },
};

function seededRand(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return ((hash & 0x7fffffff) % 1000) / 1000;
}

const CONDITION_COLORS: Record<string, string> = {
  new: "#34d399",
  like_new: "#2dd4bf",
  good: "#38bdf8",
  fair: "#fbbf24",
  poor: "#f87171",
};

/* ═══════════════════════════════════════════════
   Shared: Tooltip + Interactive Item Wrapper
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
      transition={{ duration: 0.12 }}
      className="pointer-events-none absolute -top-2 left-1/2 z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap"
    >
      <div className="rounded-lg border border-g-border bg-g-card px-3 py-2 shadow-xl shadow-black/20 backdrop-blur-md">
        <p className="text-sm font-semibold text-g-text">{item.name}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-g-text-3">
          {item.brand ? <span>{item.brand}</span> : null}
          {item.weight != null ? (
            <span className="flex items-center gap-1">
              <Scale size={10} /> {item.weight} kg
            </span>
          ) : null}
          {condLabel ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: condColor ?? undefined }} />
              {condLabel}
            </span>
          ) : null}
          {item.price != null ? <span className="text-emerald-500">${item.price}</span> : null}
        </div>
      </div>
      <div className="mx-auto h-2 w-2 -translate-y-px rotate-45 border-b border-r border-g-border bg-g-card" />
    </motion.div>
  );
}

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
      whileHover={{ y: liftDistance, transition: { type: "spring" as const, stiffness: 500, damping: 25 } }}
    >
      <AnimatePresence>{hovered ? <ItemTooltip item={item} /> : null}</AnimatePresence>
      {children}
      <motion.div
        className="pointer-events-none absolute inset-x-1 -bottom-1 h-3 rounded-full bg-black/10 blur-sm dark:bg-black/25"
        animate={{ scaleX: hovered ? 1.15 : 0.9, opacity: hovered ? 0.7 : 0.3 }}
        transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Zone Label
   ═══════════════════════════════════════════════ */

function ZoneLabel({ emoji, label, count }: { emoji: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-sm">{emoji}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-g-text-3">{label}</span>
      <span className="rounded-full bg-g-raised px-2 py-0.5 text-[10px] font-medium text-g-text-4">{count}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

type GearRoomProps = {
  items: GearItemRow[];
  categories: CategoryRow[];
  onSelectItem: (item: GearItemRow) => void;
};

export function GearRoom({ items, categories, onSelectItem }: GearRoomProps) {
  const zoneMap = useMemo(() => {
    const map = new Map<ZoneId, GearItemRow[]>();
    for (const z of ZONES) map.set(z.id, []);
    for (const item of items) {
      const zid = resolveZone(item);
      const arr = map.get(zid);
      if (arr) arr.push(item);
      else map.set(zid, [item]);
    }
    return map;
  }, [items]);

  // Only render zones that have items
  const activeZones = useMemo(
    () => ZONES.filter((z) => (zoneMap.get(z.id)?.length ?? 0) > 0),
    [zoneMap],
  );

  // Group active zones by row for layout
  const rows = useMemo(() => {
    const rowMap = new Map<number, ZoneMeta[]>();
    for (const z of activeZones) {
      const arr = rowMap.get(z.row) ?? [];
      arr.push(z);
      rowMap.set(z.row, arr);
    }
    return [...rowMap.entries()].sort((a, b) => a[0] - b[0]);
  }, [activeZones]);

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-g-border">
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-g-raised">
            <Backpack size={32} className="text-g-text-3" />
          </div>
          <p className="font-medium text-g-text-2">Your gear room is empty</p>
          <p className="mt-1 text-sm text-g-text-3">Add some gear to see it displayed here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-g-border">
      <div className="relative min-h-[400px]">
        {/* Back wall */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, var(--g-card) 0%, color-mix(in oklch, var(--g-page), transparent 20%) 60%, color-mix(in oklch, var(--g-page), transparent 5%) 100%)`,
          }}
        />
        {/* Wall grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23888' fill-opacity='1'%3E%3Cpath d='M5 0h1L0 5V4zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Ambient window light */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-0 h-full w-[400px] opacity-[0.06] dark:opacity-[0.035]"
          style={{ background: "radial-gradient(ellipse at 0% 30%, rgba(255,220,150,1) 0%, transparent 70%)" }}
        />

        {/* Zone rows */}
        <div className="relative flex flex-col">
          {rows.map(([rowIdx, zonesInRow], ri) => (
            <div key={rowIdx}>
              {ri > 0 ? (
                <div className="mx-6 h-px bg-gradient-to-r from-transparent via-g-border to-transparent" />
              ) : null}
              <div className={`grid gap-0 ${zonesInRow.length === 1 ? "grid-cols-1" : "lg:grid-cols-2"}`}>
                {zonesInRow.map((zone) => (
                  <ZoneRenderer
                    key={zone.id}
                    zone={zone}
                    items={zoneMap.get(zone.id) ?? []}
                    onSelectItem={onSelectItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Wooden floor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background: `
              repeating-linear-gradient(90deg, transparent, transparent 119px, rgba(139,90,43,0.06) 119px, rgba(139,90,43,0.06) 120px),
              linear-gradient(180deg, transparent 0%, rgba(139,90,43,0.04) 30%, rgba(139,90,43,0.08) 100%)
            `,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Zone Renderer — dispatches to the right zone component
   ═══════════════════════════════════════════════ */

function ZoneRenderer({
  zone,
  items,
  onSelectItem,
}: {
  zone: ZoneMeta;
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
}) {
  const Component = ZONE_COMPONENTS[zone.id] ?? GenericZone;
  return <Component zone={zone} items={items} onSelectItem={onSelectItem} />;
}

type ZoneComponentProps = {
  zone: ZoneMeta;
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
};

/* ═══════════════════════════════════════════════
   PEGBOARD
   ═══════════════════════════════════════════════ */

function PegboardZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[140px] overflow-hidden rounded-xl border border-amber-800/10 dark:border-amber-700/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(180,130,70,0.08), rgba(160,110,60,0.04), rgba(180,130,70,0.08))" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.09) 3px, transparent 3px)", backgroundSize: "24px 24px", backgroundPosition: "12px 12px" }} />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative flex flex-wrap gap-x-2 gap-y-1 p-4 pt-2">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            const hookLen = 10 + seededRand(String(item.id)) * 8;
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center px-2">
                <div className="flex flex-col items-center">
                  <div className="w-[3px] rounded-b-full" style={{ height: hookLen, background: "linear-gradient(180deg, #94a3b8, #64748b)" }} />
                  <div className="h-[6px] w-[10px] rounded-b-full border-b-2 border-l-2 border-r-2 border-slate-400 dark:border-slate-500" />
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-g-border/60 bg-g-card shadow-md">
                  <Icon size={24} className="text-g-accent" />
                </div>
                <span className="mt-1.5 max-w-[72px] truncate text-center text-[11px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HAT & ACCESSORY HOOKS
   ═══════════════════════════════════════════════ */

function HatHooksZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[120px] overflow-hidden rounded-xl border border-g-border/60">
        {/* Wood strip at top with hooks */}
        <div className="h-3 bg-gradient-to-b from-amber-800/12 to-amber-800/4 dark:from-amber-700/8 dark:to-transparent" />
        {/* Hook strip */}
        <div className="mx-4 flex gap-1">
          {items.map((_, i) => (
            <div key={i} className="flex-1 flex justify-center">
              <div className="h-[6px] w-[3px] rounded-b bg-slate-400/60" />
            </div>
          ))}
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-x-3 gap-y-2 px-4 pb-4 pt-2">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-5} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-g-border/50 bg-g-card/80 shadow-md">
                  <Icon size={20} className="text-g-accent" />
                </div>
                <span className="mt-1 max-w-[60px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   WARDROBE
   ═══════════════════════════════════════════════ */

function WardrobeZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[160px] overflow-hidden rounded-xl border-2 border-amber-800/15 dark:border-amber-700/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(120,80,40,0.06), rgba(100,65,30,0.02) 20%, rgba(80,50,25,0.04))" }} />
        <div className="h-3 bg-gradient-to-b from-amber-800/10 to-transparent dark:from-amber-700/8" />
        {/* Chrome rail */}
        <div className="relative mx-5 mt-1 mb-2">
          <div className="h-[4px] rounded-full" style={{ background: "linear-gradient(90deg, #94a3b8, #cbd5e1 40%, #94a3b8)", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
          <div className="absolute -top-1 left-4 h-3 w-[6px] rounded-b bg-slate-400/60" />
          <div className="absolute -top-1 right-4 h-3 w-[6px] rounded-b bg-slate-400/60" />
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative flex flex-wrap items-start gap-x-1 gap-y-2 px-4 pb-4">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            const condColor = item.condition ? CONDITION_COLORS[item.condition] : null;
            const rotation = (seededRand(String(item.id)) - 0.5) * 4;
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-5} className="flex flex-col items-center">
                <svg width="32" height="14" viewBox="0 0 32 14" className="text-slate-400 dark:text-slate-500">
                  <path d="M16 0 L16 4 Q16 6 14 7 L4 12 Q2 13 2 11 L14 6 Q16 5 18 6 L30 11 Q30 13 28 12 L18 7 Q16 6 16 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div className="flex h-[72px] w-[48px] flex-col items-center justify-center rounded-b-xl border border-t-0 border-g-border/50 bg-g-card/80 shadow-md" style={{ transform: `rotate(${rotation}deg)` }}>
                  <Icon size={20} className="text-g-accent" />
                  {condColor ? <div className="mt-2 h-2 w-2 rounded-full" style={{ backgroundColor: condColor }} /> : null}
                </div>
                <span className="mt-1.5 max-w-[56px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
        <div className="h-2 bg-gradient-to-t from-amber-900/8 to-transparent dark:from-amber-900/5" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SHOE & BOOT RACK
   ═══════════════════════════════════════════════ */

function ShoeRackZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  // Split across 2 tiers
  const mid = Math.ceil(items.length / 2);
  const tiers = [items.slice(0, mid), items.slice(mid)].filter((t) => t.length > 0);

  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative overflow-hidden rounded-xl border-2 border-amber-800/12 dark:border-amber-700/8">
        {/* Side panels */}
        <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-amber-800/12 to-transparent dark:from-amber-700/8" />
        <div className="absolute inset-y-0 right-0 w-[5px] bg-gradient-to-l from-amber-800/12 to-transparent dark:from-amber-700/8" />

        {tiers.map((tier, ti) => (
          <div key={ti}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap items-end gap-3 px-5 pb-1 pt-3">
              {tier.map((item) => {
                const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
                const r = seededRand(String(item.id));
                const tilt = (r - 0.5) * 12;
                return (
                  <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-g-border/40 bg-g-card/60 shadow-md" style={{ transform: `rotate(${tilt}deg)` }}>
                      <Icon size={22} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="mt-1 max-w-[68px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
                  </RoomItem>
                );
              })}
            </motion.div>
            {/* Wire rack shelf */}
            <div className="mx-2 flex gap-[3px]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-[3px] flex-1 rounded-full bg-slate-400/20 dark:bg-slate-500/15" />
              ))}
            </div>
          </div>
        ))}
        <div className="h-2" />
        {/* Rack legs */}
        <div className="flex justify-between px-4 pb-1">
          <div className="h-4 w-[3px] rounded-b bg-slate-400/30" />
          <div className="h-4 w-[3px] rounded-b bg-slate-400/30" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PACK WALL — backpacks hung on wall hooks
   ═══════════════════════════════════════════════ */

function PackWallZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[140px] overflow-hidden rounded-xl border border-g-border/60">
        {/* Wall mount strip */}
        <div className="mx-4 mt-3 h-[4px] rounded bg-slate-400/25" />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-4 p-4">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-8} className="flex flex-col items-center">
                {/* Hook */}
                <div className="h-4 w-[3px] rounded-b bg-slate-500/50" />
                <div className="flex h-16 w-14 items-center justify-center rounded-xl border border-g-border/50 bg-g-card/70 shadow-lg">
                  <Icon size={26} className="text-g-accent" />
                </div>
                <span className="mt-1.5 max-w-[70px] truncate text-center text-[11px] font-semibold text-g-text-2">{item.name}</span>
                {item.weight != null ? <span className="text-[9px] text-g-text-4">{item.weight} kg</span> : null}
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   KITCHEN CUPBOARD
   ═══════════════════════════════════════════════ */

function KitchenZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  const mid = Math.ceil(items.length / 2);
  const shelves = [items.slice(0, mid), items.slice(mid)].filter((s) => s.length > 0);

  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative overflow-hidden rounded-xl border-2 border-amber-800/12 dark:border-amber-700/8">
        <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-amber-800/10 to-transparent dark:from-amber-700/6" />
        <div className="absolute inset-y-0 right-0 w-[6px] bg-gradient-to-l from-amber-800/10 to-transparent dark:from-amber-700/6" />
        {shelves.map((shelf, si) => (
          <div key={si}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative flex flex-wrap items-end gap-2 px-5 pb-1 pt-4">
              {shelf.map((item) => {
                const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
                const rotation = (seededRand(String(item.id)) - 0.5) * 6;
                return (
                  <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-8} className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-g-border/50 bg-g-card/80 shadow-md" style={{ transform: `rotate(${rotation}deg)` }}>
                      <Icon size={20} className="text-orange-500 dark:text-orange-400" />
                    </div>
                    <span className="mt-1 max-w-[64px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
                  </RoomItem>
                );
              })}
            </motion.div>
            <div className="relative mx-1">
              <div className="h-[6px]" style={{ background: "linear-gradient(180deg, rgba(160,110,50,0.20), rgba(140,90,40,0.15) 60%, rgba(120,75,35,0.10))", borderRadius: "0 0 2px 2px", boxShadow: "0 2px 6px rgba(100,70,30,0.12)" }} />
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: "rgba(200,160,100,0.15)" }} />
            </div>
          </div>
        ))}
        <div className="h-3" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HYDRATION STATION
   ═══════════════════════════════════════════════ */

function HydrationZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[100px] overflow-hidden rounded-xl border border-sky-500/15 dark:border-sky-400/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.04), rgba(56,189,248,0.02), rgba(14,165,233,0.04))" }} />
        {/* Drying rack */}
        <div className="mx-4 mt-3 h-[3px] rounded bg-slate-400/20" />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative flex flex-wrap items-end gap-3 p-4">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center">
                <div className="flex h-14 w-10 items-center justify-center rounded-lg border border-sky-500/20 bg-g-card/60 shadow-md dark:border-sky-400/15">
                  <Icon size={20} className="text-sky-500 dark:text-sky-400" />
                </div>
                <span className="mt-1 max-w-[60px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BIKE RACK — wall-mounted hooks
   ═══════════════════════════════════════════════ */

function BikeRackZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[120px] overflow-hidden rounded-xl border border-lime-600/15 dark:border-lime-500/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(132,204,22,0.04), transparent 50%, rgba(132,204,22,0.04))" }} />
        {/* Wall-mount rail */}
        <div className="mx-4 mt-3 h-[5px] rounded bg-slate-500/20" style={{ boxShadow: "0 2px 3px rgba(0,0,0,0.08)" }} />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-4 p-4">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-8} className="flex flex-col items-center">
                <div className="h-5 w-[3px] rounded-b bg-slate-400/40" />
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-lime-600/20 bg-g-card/60 shadow-md dark:border-lime-500/15">
                  <Icon size={24} className="text-lime-600 dark:text-lime-400" />
                </div>
                <span className="mt-1.5 max-w-[72px] truncate text-center text-[11px] font-semibold text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SKI & SNOW RACK — vertical slots
   ═══════════════════════════════════════════════ */

function SkiRackZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[120px] overflow-hidden rounded-xl border border-cyan-500/15 dark:border-cyan-400/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,182,212,0.04), transparent)" }} />
        {/* Top clamp rail */}
        <div className="mx-4 mt-3 mb-1 h-[4px] rounded bg-slate-500/25" />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap items-end gap-3 p-4">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            const r = seededRand(String(item.id));
            const lean = (r - 0.5) * 6;
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-5} className="flex flex-col items-center">
                <div className="flex h-[72px] w-10 items-center justify-center rounded-lg border border-cyan-500/20 bg-g-card/60 shadow-md dark:border-cyan-400/15" style={{ transform: `rotate(${lean}deg)` }}>
                  <Icon size={20} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="mt-1 max-w-[60px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
        {/* Bottom slot rail */}
        <div className="mx-4 mb-3 h-[3px] rounded bg-slate-500/20" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PADDLE & WATER RACK
   ═══════════════════════════════════════════════ */

function PaddleRackZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[100px] overflow-hidden rounded-xl border border-blue-500/15 dark:border-blue-400/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.04), transparent, rgba(59,130,246,0.04))" }} />
        {/* Wall brackets */}
        <div className="mx-4 mt-3 flex gap-6">
          <div className="h-[4px] w-12 rounded bg-slate-400/30" />
          <div className="h-[4px] w-12 rounded bg-slate-400/30" />
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-4 p-4">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            const lean = (seededRand(String(item.id)) - 0.5) * 10;
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center">
                <div className="flex h-16 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-g-card/50 shadow-md dark:border-blue-400/15" style={{ transform: `rotate(${lean}deg)` }}>
                  <Icon size={22} className="text-blue-500 dark:text-blue-400" />
                </div>
                <span className="mt-1.5 max-w-[70px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROPE & CLIMBING RACK
   ═══════════════════════════════════════════════ */

function RopeRackZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[100px] overflow-hidden rounded-xl border border-rose-500/15 dark:border-rose-400/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.04), transparent, rgba(244,63,94,0.04))" }} />
        {/* Racking pegs */}
        <div className="mx-4 mt-3 flex gap-4">
          {items.slice(0, 6).map((_, i) => (
            <div key={i} className="h-3 w-[4px] rounded-b bg-slate-500/40" />
          ))}
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3 p-4">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-7} className="flex flex-col items-center">
                <div className="flex h-13 w-13 items-center justify-center rounded-xl border border-rose-500/20 bg-g-card/60 shadow-md dark:border-rose-400/15">
                  <Icon size={22} className="text-rose-500 dark:text-rose-400" />
                </div>
                <span className="mt-1 max-w-[68px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TECH / CHARGING STATION
   ═══════════════════════════════════════════════ */

function TechStationZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[100px] overflow-hidden rounded-xl border border-violet-500/15 dark:border-violet-400/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.04), transparent, rgba(139,92,246,0.04))" }} />
        {/* Power strip */}
        <div className="mx-4 mt-3 flex items-center gap-2">
          <div className="h-[5px] flex-1 rounded bg-slate-600/20 dark:bg-slate-400/15" />
          {/* LED indicator */}
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3 p-4">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-violet-500/20 bg-g-card/60 shadow-md dark:border-violet-400/15">
                  <Icon size={20} className="text-violet-500 dark:text-violet-400" />
                </div>
                <span className="mt-1 max-w-[64px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLEEP STATION
   ═══════════════════════════════════════════════ */

function SleepZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative mt-1">
        {/* Bedside lamp */}
        <div className="absolute -top-1 right-4 z-10 flex flex-col items-center">
          <div className="h-5 w-8 rounded-t-full" style={{ background: "linear-gradient(180deg, rgba(251,191,36,0.25), rgba(251,191,36,0.10))", boxShadow: "0 0 20px rgba(251,191,36,0.12)" }} />
          <div className="h-4 w-[2px] bg-slate-400/40" />
          <div className="absolute top-6 h-16 w-24 opacity-30" style={{ background: "radial-gradient(ellipse, rgba(251,191,36,0.2), transparent 70%)" }} />
        </div>
        <div className="overflow-hidden rounded-xl border border-indigo-500/10 dark:border-indigo-400/10">
          <div className="relative min-h-[120px] p-4" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.03) 50%, rgba(99,102,241,0.05))" }}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3">
              {items.map((item) => {
                const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
                return (
                  <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6}>
                    <div className="flex items-center gap-2.5 rounded-xl border border-indigo-500/15 bg-g-card/60 px-3 py-2.5 shadow-md dark:border-indigo-400/10">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 dark:bg-indigo-500/15">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-g-text" style={{ maxWidth: 100 }}>{item.name}</p>
                        {item.weight != null ? <p className="text-[10px] text-g-text-4">{item.weight} kg</p> : null}
                      </div>
                    </div>
                  </RoomItem>
                );
              })}
            </motion.div>
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

/* ═══════════════════════════════════════════════
   FOOD BOX / BEAR LOCKER
   ═══════════════════════════════════════════════ */

function FoodBoxZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative min-h-[80px] overflow-hidden rounded-xl border-2 border-dashed border-amber-600/20 dark:border-amber-500/15">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(217,119,6,0.04), transparent, rgba(217,119,6,0.04))" }} />
        {/* Lid flaps */}
        <div className="flex">
          <div className="h-3 flex-1 border-b border-r border-amber-600/15 bg-amber-600/5 dark:border-amber-500/10 dark:bg-amber-500/3" />
          <div className="h-3 flex-1 border-b border-amber-600/15 bg-amber-600/5 dark:border-amber-500/10 dark:bg-amber-500/3" />
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3 p-4">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-5} className="flex flex-col items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-600/20 bg-g-card/60 shadow-md dark:border-amber-500/15">
                  <Icon size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <span className="mt-1 max-w-[60px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TENT CORNER
   ═══════════════════════════════════════════════ */

function TentCornerZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap items-end gap-4 mt-3">
        {items.map((item) => {
          const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
          const lean = (seededRand(String(item.id)) - 0.5) * 8;
          return (
            <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6}>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-emerald-500/15 bg-g-card/40 p-4 shadow-lg dark:border-emerald-400/10" style={{ transform: `rotate(${lean}deg)` }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <Icon size={30} />
                </div>
                <div className="text-center">
                  <p className="max-w-[90px] truncate text-xs font-semibold text-g-text">{item.name}</p>
                  {item.brand ? <p className="max-w-[90px] truncate text-[10px] text-g-text-3">{item.brand}</p> : null}
                  {item.weight != null ? (
                    <p className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-g-text-4">
                      <Scale size={9} /> {item.weight} kg
                    </p>
                  ) : null}
                </div>
              </div>
            </RoomItem>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CAMP FURNITURE
   ═══════════════════════════════════════════════ */

function CampFurnitureZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-4 mt-3">
        {items.map((item) => {
          const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
          return (
            <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6}>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-g-border/50 bg-g-card/40 p-3 shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                  <Icon size={22} />
                </div>
                <span className="max-w-[72px] truncate text-center text-[11px] font-medium text-g-text-2">{item.name}</span>
              </div>
            </RoomItem>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   WORKBENCH (catch-all)
   ═══════════════════════════════════════════════ */

function WorkbenchZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <div className="relative overflow-hidden rounded-xl border-2 border-amber-800/12 dark:border-amber-700/8 mt-3">
        <div className="relative min-h-[80px] p-4" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(139,90,43,0.04) 11px, rgba(139,90,43,0.04) 12px), linear-gradient(135deg, rgba(180,130,70,0.06), rgba(160,110,60,0.04) 50%, rgba(180,130,70,0.06))" }}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3">
            {items.map((item) => {
              const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
              const rotation = (seededRand(String(item.id)) - 0.5) * 10;
              return (
                <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-8}>
                  <div className="flex flex-col items-center gap-1 rounded-lg border border-g-border/40 bg-g-card/50 p-2.5 shadow-md" style={{ transform: `rotate(${rotation}deg)` }}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
                      <Icon size={20} />
                    </div>
                    <span className="max-w-[68px] truncate text-center text-[10px] font-semibold text-g-text-2">{item.name}</span>
                  </div>
                </RoomItem>
              );
            })}
          </motion.div>
        </div>
        <div className="h-[5px]" style={{ background: "linear-gradient(180deg, rgba(160,110,50,0.18), rgba(120,75,35,0.12))", boxShadow: "0 2px 4px rgba(100,70,30,0.10)" }} />
      </div>
      {/* Metal legs */}
      <div className="flex justify-between px-6">
        <div className="h-5 w-[3px] rounded-b bg-slate-400/30" />
        <div className="h-5 w-[3px] rounded-b bg-slate-400/30" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Generic fallback zone
   ═══════════════════════════════════════════════ */

function GenericZone({ zone, items, onSelectItem }: ZoneComponentProps) {
  return (
    <div className="relative p-6">
      <ZoneLabel emoji={zone.emoji} label={zone.label} count={items.length} />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3 mt-3">
        {items.map((item) => {
          const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
          return (
            <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-g-border/50 bg-g-card/60 shadow-md">
                <Icon size={20} className="text-g-accent" />
              </div>
              <span className="mt-1 max-w-[64px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
            </RoomItem>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Zone component registry
   ═══════════════════════════════════════════════ */

const ZONE_COMPONENTS: Record<ZoneId, (props: ZoneComponentProps) => React.ReactNode> = {
  pegboard: PegboardZone,
  hat_hooks: HatHooksZone,
  wardrobe: WardrobeZone,
  shoe_rack: ShoeRackZone,
  pack_wall: PackWallZone,
  kitchen: KitchenZone,
  hydration: HydrationZone,
  bike_rack: BikeRackZone,
  ski_rack: SkiRackZone,
  paddle_rack: PaddleRackZone,
  rope_rack: RopeRackZone,
  tech_station: TechStationZone,
  sleep: SleepZone,
  food_box: FoodBoxZone,
  tent_corner: TentCornerZone,
  camp_furniture: CampFurnitureZone,
  workbench: WorkbenchZone,
};
