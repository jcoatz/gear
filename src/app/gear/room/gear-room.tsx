"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Backpack, Scale } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getGearIcon } from "../gear-icons";
import { CONDITION_LABELS } from "../schema";
import type { CategoryRow, GearItemRow } from "../gear-client";

/* ═══════════════════════════════════════════════
   Zone routing — keyword match, first wins
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

const ZONE_RULES: ZoneRule[] = [
  { keywords: ["boot", "shoe", "trail runner", "sandal", "gaiter", "crampon", "approach shoe", "wading boot", "slipper", "flip flop", "camp shoe"], zone: "shoe_rack" },
  { keywords: ["hat", "cap", "beanie", "balaclava", "buff", "bandana", "headband", "neck gaiter", "glove", "mitt", "sunglasses", "goggles", "watch", "wristband"], zone: "hat_hooks" },
  { keywords: ["bike", "bicycle", "cycling", "cycle", "pedal", "derailleur", "handlebar", "saddle", "pannnier", "pannier", "bike light", "bike lock", "bike tool", "bike pump", "tube", "tire", "tyre", "cycling jersey", "cycling short", "cycling shoe", "clipless"], zone: "bike_rack" },
  { keywords: ["ski", "snowboard", "binding", "ski boot", "ski pole", "snow shoe", "snowshoe", "avalanche", "beacon", "probe", "shovel", "ski goggle", "ski helmet", "snow pant"], zone: "ski_rack" },
  { keywords: ["kayak", "canoe", "paddle", "pfd", "life jacket", "dry bag", "dry suit", "wetsuit", "neoprene", "spray skirt", "throw bag", "snorkel", "fin", "surfboard", "sup ", "stand up paddle", "boat", "raft", "float"], zone: "paddle_rack" },
  { keywords: ["rope", "cord", "sling", "runner", "quickdraw", "cam", "nut", "hex", "carabiner", "belay", "rappel", "descend", "ascend", "harness", "chalk"], zone: "rope_rack" },
  { keywords: ["water bottle", "nalgene", "flask", "hydration", "water filter", "purifier", "katadyn", "sawyer", "bladder", "reservoir", "platypus", "collapsible bottle", "mug", "cup"], zone: "hydration" },
  { keywords: ["sleeping bag", "quilt", "sleeping pad", "mattress", "air mattress", "pillow", "liner", "bivy", "bivvy", "sleep", "hammock underquilt", "hammock top"], zone: "sleep" },
  { keywords: ["tent", "tarp", "shelter", "footprint", "pole", "stake", "guy line", "hammock", "rain fly", "vestibule", "ground cloth", "bivy sack"], zone: "tent_corner" },
  { keywords: ["backpack", "pack", "daypack", "rucksack", "duffel", "duffle", "stuff sack", "compression", "running vest", "hip pack", "fanny pack", "waist pack", "gear bag", "travel bag", "roller bag"], zone: "pack_wall" },
  { keywords: ["stove", "burner", "jetboil", "msr", "pot", "pan", "cookware", "cook set", "grill", "spatula", "tongs", "spork", "fork", "knife", "utensil", "cutting board", "plate", "bowl", "frying", "windscreen", "fuel", "canister", "lighter", "match", "fire steel", "firesteel"], zone: "kitchen" },
  { keywords: ["food", "snack", "meal", "bar", "energy", "bear canister", "bear bag", "ursack", "cooler", "ice chest", "thermos", "food bag", "hang bag"], zone: "food_box" },
  { keywords: ["battery", "power bank", "charger", "solar", "panel", "gps", "garmin", "inreach", "camera", "gopro", "phone", "speaker", "bluetooth", "radio", "walkie", "satellite", "usb", "cable", "adapter", "drone", "action cam", "tripod", "headphone"], zone: "tech_station" },
  { keywords: ["chair", "table", "furniture", "camp chair", "camp table", "stool", "cot", "bench", "lounger", "footrest", "camp bed", "lantern", "candle"], zone: "camp_furniture" },
  { keywords: ["headlamp", "flashlight", "lantern", "light", "compass", "map", "whistle", "signal", "mirror", "first aid", "med kit", "emergency", "fire", "knife", "multi-tool", "leatherman", "repair", "patch", "duct tape", "saw", "axe", "hatchet", "mallet", "hammer", "binocular", "thermometer", "altimeter"], zone: "pegboard" },
  { keywords: ["jacket", "shell", "rain jacket", "windbreaker", "shirt", "top", "jersey", "base layer", "fleece", "hoodie", "vest", "pant", "short", "sock", "underwear", "insulated", "down", "puffy", "rain pant", "soft shell", "hard shell", "mid layer", "thermal", "legging", "wrap", "poncho", "skirt", "dress", "sports bra", "compression"], zone: "wardrobe" },
];

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
  return CATEGORY_ZONE_FALLBACK[item.categories?.name ?? "Other"] ?? "workbench";
}

/* ═══════════════════════════════════════════════
   Zone visual config
   ═══════════════════════════════════════════════ */

type ZoneConfig = {
  id: ZoneId;
  label: string;
  emoji: string;
  /** Accent color for the zone (tailwind class prefix) */
  accent: string;
  /** CSS gradient for the furniture thumbnail */
  gradient: string;
  /** Grid position hint (row, col) for overview layout */
  area: string;
};

const ZONE_CONFIG: ZoneConfig[] = [
  { id: "pegboard", label: "Pegboard", emoji: "🔩", accent: "amber", gradient: "from-amber-600/20 to-amber-800/10", area: "pegboard" },
  { id: "hat_hooks", label: "Hats & Accessories", emoji: "🧢", accent: "pink", gradient: "from-pink-500/15 to-pink-600/8", area: "hats" },
  { id: "wardrobe", label: "Wardrobe", emoji: "👔", accent: "amber", gradient: "from-amber-700/15 to-amber-900/8", area: "wardrobe" },
  { id: "shoe_rack", label: "Shoe Rack", emoji: "🥾", accent: "stone", gradient: "from-stone-500/15 to-stone-600/8", area: "shoes" },
  { id: "pack_wall", label: "Pack Wall", emoji: "🎒", accent: "orange", gradient: "from-orange-500/15 to-orange-600/8", area: "packs" },
  { id: "kitchen", label: "Kitchen Cupboard", emoji: "🍳", accent: "orange", gradient: "from-orange-600/15 to-orange-700/8", area: "kitchen" },
  { id: "hydration", label: "Hydration Station", emoji: "💧", accent: "sky", gradient: "from-sky-500/15 to-sky-600/8", area: "hydration" },
  { id: "rope_rack", label: "Climbing Rack", emoji: "🧗", accent: "rose", gradient: "from-rose-500/15 to-rose-600/8", area: "rope" },
  { id: "tech_station", label: "Charging Station", emoji: "🔋", accent: "violet", gradient: "from-violet-500/15 to-violet-600/8", area: "tech" },
  { id: "bike_rack", label: "Bike Hooks", emoji: "🚲", accent: "lime", gradient: "from-lime-500/15 to-lime-600/8", area: "bike" },
  { id: "ski_rack", label: "Ski Rack", emoji: "⛷️", accent: "cyan", gradient: "from-cyan-500/15 to-cyan-600/8", area: "ski" },
  { id: "paddle_rack", label: "Paddle Rack", emoji: "🛶", accent: "blue", gradient: "from-blue-500/15 to-blue-600/8", area: "paddle" },
  { id: "sleep", label: "Sleep Station", emoji: "🌙", accent: "indigo", gradient: "from-indigo-500/12 to-violet-500/8", area: "sleep" },
  { id: "food_box", label: "Food Locker", emoji: "🐻", accent: "amber", gradient: "from-amber-500/15 to-amber-600/8", area: "food" },
  { id: "tent_corner", label: "Tent Corner", emoji: "⛺", accent: "emerald", gradient: "from-emerald-500/15 to-emerald-600/8", area: "tent" },
  { id: "camp_furniture", label: "Camp Furniture", emoji: "🪑", accent: "amber", gradient: "from-amber-600/12 to-amber-700/6", area: "furniture" },
  { id: "workbench", label: "Workbench", emoji: "🔧", accent: "amber", gradient: "from-amber-700/12 to-amber-800/6", area: "workbench" },
];

/* ═══════════════════════════════════════════════
   Animation config
   ═══════════════════════════════════════════════ */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.93 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 450, damping: 26 },
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
  new: "#34d399", like_new: "#2dd4bf", good: "#38bdf8", fair: "#fbbf24", poor: "#f87171",
};

/* ═══════════════════════════════════════════════
   Mouse parallax hook
   ═══════════════════════════════════════════════ */

function useParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const raf = useRef(0);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMouse({ x, y });
    });
  }, []);

  const onLeave = useCallback(() => {
    if (raf.current) { cancelAnimationFrame(raf.current); raf.current = 0; }
    setMouse({ x: 0, y: 0 });
  }, []);

  return { ref, mouse, onMove, onLeave };
}

/* ═══════════════════════════════════════════════
   Tooltip
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
      className="pointer-events-none absolute -top-2 left-1/2 z-[60] -translate-x-1/2 -translate-y-full whitespace-nowrap"
    >
      <div className="rounded-lg border border-g-border bg-g-card px-3 py-2 shadow-xl shadow-black/25 backdrop-blur-xl">
        <p className="text-sm font-semibold text-g-text">{item.name}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-g-text-3">
          {item.brand ? <span>{item.brand}</span> : null}
          {item.weight != null ? (
            <span className="flex items-center gap-1"><Scale size={10} /> {item.weight} kg</span>
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

/* ═══════════════════════════════════════════════
   Interactive item wrapper (used in detail view)
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
      whileHover={{ y: liftDistance, transition: { type: "spring" as const, stiffness: 500, damping: 25 } }}
    >
      <AnimatePresence>{hovered ? <ItemTooltip item={item} /> : null}</AnimatePresence>
      {children}
      <motion.div
        className="pointer-events-none absolute inset-x-1 -bottom-1 h-3 rounded-full bg-black/10 blur-sm dark:bg-black/30"
        animate={{ scaleX: hovered ? 1.2 : 0.85, opacity: hovered ? 0.8 : 0.25 }}
        transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
      />
    </motion.div>
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
  const { ref: parallaxRef, mouse, onMove, onLeave } = useParallax();
  const [openZone, setOpenZone] = useState<ZoneId | null>(null);

  const zoneMap = useMemo(() => {
    const map = new Map<ZoneId, GearItemRow[]>();
    for (const z of ZONE_CONFIG) map.set(z.id, []);
    for (const item of items) {
      const zid = resolveZone(item);
      map.get(zid)!.push(item);
    }
    return map;
  }, [items]);

  const activeZones = useMemo(
    () => ZONE_CONFIG.filter((z) => (zoneMap.get(z.id)?.length ?? 0) > 0),
    [zoneMap],
  );

  const openZoneConfig = openZone ? ZONE_CONFIG.find((z) => z.id === openZone) : null;
  const openZoneItems = openZone ? (zoneMap.get(openZone) ?? []) : [];

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
    <div
      ref={parallaxRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden rounded-2xl border border-g-border"
    >
      {/* ── Room backdrop ── */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Back wall */}
        <div
          className="absolute inset-0 transition-transform duration-[1200ms] ease-out"
          style={{
            background: `linear-gradient(170deg, var(--g-card) 0%, color-mix(in oklch, var(--g-page), transparent 15%) 55%, color-mix(in oklch, var(--g-page), transparent 3%) 100%)`,
            transform: `translate3d(${mouse.x * -3}px, ${mouse.y * -2}px, 0)`,
          }}
        />

        {/* Wall texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23888' fill-opacity='1'%3E%3Cpath d='M5 0h1L0 5V4zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Dynamic spotlight — follows mouse */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 600px 500px at ${50 + mouse.x * 25}% ${40 + mouse.y * 20}%, rgba(255,220,150,0.08) 0%, transparent 70%)`,
            opacity: 0.8 + Math.abs(mouse.x) * 0.2,
          }}
        />

        {/* Window light (left wall) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 top-[10%] h-[60%] w-[200px] opacity-[0.05] dark:opacity-[0.03] transition-transform duration-[1200ms]"
          style={{
            background: "linear-gradient(135deg, rgba(255,240,200,1) 0%, transparent 80%)",
            transform: `translate3d(${mouse.x * -6}px, ${mouse.y * -4}px, 0)`,
          }}
        />
        {/* Window cross */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[40px] top-[18%] opacity-[0.04] dark:opacity-[0.025] transition-transform duration-[1200ms]"
          style={{ transform: `translate3d(${mouse.x * -6}px, ${mouse.y * -4}px, 0)` }}
        >
          <div className="h-[120px] w-[80px] rounded-t-xl border-2 border-current text-amber-600" />
          <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-current text-amber-600" />
          <div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-current text-amber-600" />
        </div>

        {/* Floating dust particles */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-amber-200/30 dark:bg-amber-200/15"
              style={{
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                left: `${10 + (i * 7.3) % 80}%`,
                top: `${5 + (i * 11.7) % 85}%`,
                animation: `dust-float ${6 + (i % 4) * 2}s ease-in-out ${i * 0.7}s infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* Wooden floor at bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 transition-transform duration-[1200ms]"
          style={{
            background: `
              repeating-linear-gradient(90deg, transparent, transparent 149px, rgba(139,90,43,0.07) 149px, rgba(139,90,43,0.07) 150px),
              linear-gradient(180deg, transparent 0%, rgba(139,90,43,0.05) 40%, rgba(139,90,43,0.1) 100%)
            `,
            transform: `translate3d(${mouse.x * 4}px, ${mouse.y * 2}px, 0)`,
          }}
        />
      </div>

      {/* Dust animation keyframes */}
      <style>{`
        @keyframes dust-float {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { transform: translate3d(${12}px, ${-20}px, 0) scale(0.6); opacity: 0.1; }
        }
      `}</style>

      {/* ── Content layer ── */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {openZone && openZoneConfig ? (
            /* ── DETAIL VIEW ── */
            <motion.div
              key={`detail-${openZone}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ZoneDetailView
                zone={openZoneConfig}
                items={openZoneItems}
                onSelectItem={onSelectItem}
                onBack={() => setOpenZone(null)}
                mouse={mouse}
              />
            </motion.div>
          ) : (
            /* ── OVERVIEW ── */
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-5 sm:p-6"
            >
              {/* Room title */}
              <div className="mb-5 flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-g-text-3">
                  Gear Room
                </h3>
                <span className="rounded-full bg-g-raised px-2 py-0.5 text-[10px] font-medium text-g-text-4">
                  {items.length} items · {activeZones.length} zones
                </span>
              </div>

              {/* Furniture grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                style={{
                  transform: `translate3d(${mouse.x * 3}px, ${mouse.y * 2}px, 0)`,
                  transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                {activeZones.map((zone) => (
                  <FurnitureCard
                    key={zone.id}
                    zone={zone}
                    items={zoneMap.get(zone.id) ?? []}
                    onClick={() => setOpenZone(zone.id)}
                    mouse={mouse}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FURNITURE CARD (overview hotspot)
   ═══════════════════════════════════════════════ */

function FurnitureCard({
  zone,
  items,
  onClick,
  mouse,
}: {
  zone: ZoneConfig;
  items: GearItemRow[];
  onClick: () => void;
  mouse: { x: number; y: number };
}) {
  const [hovered, setHovered] = useState(false);
  const previewItems = items.slice(0, 4);
  const totalWeight = items.reduce((s, i) => s + (i.weight ?? 0), 0);

  return (
    <motion.div
      variants={itemVariants}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="group/card relative cursor-pointer"
    >
      <motion.div
        className={`relative overflow-hidden rounded-xl border transition-colors duration-200 ${
          hovered ? "border-g-border-active shadow-lg" : "border-g-border/60"
        }`}
        animate={{
          scale: hovered ? 1.03 : 1,
          y: hovered ? -4 : 0,
        }}
        transition={{ type: "spring" as const, stiffness: 500, damping: 28 }}
      >
        {/* Furniture surface gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${zone.gradient}`} />

        {/* Glow on hover */}
        {hovered ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-g-accent/[0.04]"
          />
        ) : null}

        <div className="relative p-4">
          {/* Top row: emoji + count */}
          <div className="flex items-start justify-between">
            <span className="text-2xl drop-shadow-sm">{zone.emoji}</span>
            <span className="rounded-full bg-g-raised/80 px-2 py-0.5 text-[11px] font-bold text-g-text backdrop-blur-sm">
              {items.length}
            </span>
          </div>

          {/* Label */}
          <p className="mt-2 text-sm font-semibold text-g-text">{zone.label}</p>

          {/* Preview icons row */}
          <div className="mt-2.5 flex items-center gap-1.5">
            {previewItems.map((item) => {
              const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
              return (
                <div
                  key={item.id}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-g-border/40 bg-g-card/60 shadow-sm backdrop-blur-sm"
                >
                  <Icon size={14} className="text-g-text-2" />
                </div>
              );
            })}
            {items.length > 4 ? (
              <span className="rounded-md bg-g-raised/60 px-1.5 py-0.5 text-[10px] font-medium text-g-text-3">
                +{items.length - 4}
              </span>
            ) : null}
          </div>

          {/* Weight summary */}
          {totalWeight > 0 ? (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-g-text-4">
              <Scale size={10} />
              {totalWeight.toFixed(1)} kg total
            </p>
          ) : null}
        </div>

        {/* Bottom "open" indicator */}
        <div
          className={`flex items-center justify-center border-t py-1.5 text-[10px] font-medium uppercase tracking-wider transition-all duration-200 ${
            hovered
              ? "border-g-border-active bg-g-accent/[0.06] text-g-accent"
              : "border-g-border/40 text-g-text-4"
          }`}
        >
          {hovered ? "Open" : "Click to explore"}
        </div>
      </motion.div>

      {/* Card shadow */}
      <motion.div
        className="pointer-events-none absolute inset-x-2 -bottom-2 h-4 rounded-full bg-black/8 blur-md dark:bg-black/20"
        animate={{ scaleX: hovered ? 1.1 : 0.9, opacity: hovered ? 0.6 : 0.2 }}
        transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   ZONE DETAIL VIEW (expanded)
   ═══════════════════════════════════════════════ */

function ZoneDetailView({
  zone,
  items,
  onSelectItem,
  onBack,
  mouse,
}: {
  zone: ZoneConfig;
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
  onBack: () => void;
  mouse: { x: number; y: number };
}) {
  const Component = ZONE_DETAIL_RENDERERS[zone.id] ?? DefaultZoneDetail;

  return (
    <div className="min-h-[300px]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-g-border/50 px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-g-text-3 transition-colors hover:bg-g-raised hover:text-g-text"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xl">{zone.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-g-text">{zone.label}</h3>
          <p className="text-xs text-g-text-3">{items.length} items</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-g-border bg-g-card px-3 py-1.5 text-xs font-medium text-g-text-3 transition-colors hover:bg-g-raised hover:text-g-text"
        >
          Back to room
        </button>
      </div>

      {/* Zone-specific content */}
      <div
        style={{
          transform: `translate3d(${mouse.x * 2}px, ${mouse.y * 1}px, 0)`,
          transition: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <Component items={items} onSelectItem={onSelectItem} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Zone Detail Renderers
   Each zone has its own visual treatment
   ═══════════════════════════════════════════════ */

type DetailProps = {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
};

/* ── Pegboard ── */
function PegboardDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[160px] overflow-hidden rounded-xl border border-amber-800/10 dark:border-amber-700/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(180,130,70,0.08), rgba(160,110,60,0.04), rgba(180,130,70,0.08))" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.09) 3px, transparent 3px)", backgroundSize: "24px 24px", backgroundPosition: "12px 12px" }} />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative flex flex-wrap gap-x-3 gap-y-2 p-5">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            const hookLen = 10 + seededRand(String(item.id)) * 10;
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center px-2">
                <div className="flex flex-col items-center">
                  <div className="w-[3px] rounded-b-full" style={{ height: hookLen, background: "linear-gradient(180deg, #94a3b8, #64748b)" }} />
                  <div className="h-[6px] w-[10px] rounded-b-full border-b-2 border-l-2 border-r-2 border-slate-400 dark:border-slate-500" />
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-g-border/60 bg-g-card shadow-lg">
                  <Icon size={24} className="text-g-accent" />
                </div>
                <span className="mt-1.5 max-w-[80px] truncate text-center text-[11px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Wardrobe ── */
function WardrobeDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[180px] overflow-hidden rounded-xl border-2 border-amber-800/15 dark:border-amber-700/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(120,80,40,0.06), rgba(100,65,30,0.02) 20%, rgba(80,50,25,0.04))" }} />
        <div className="h-3 bg-gradient-to-b from-amber-800/10 to-transparent dark:from-amber-700/8" />
        <div className="relative mx-5 mt-1 mb-2">
          <div className="h-[4px] rounded-full" style={{ background: "linear-gradient(90deg, #94a3b8, #cbd5e1 40%, #94a3b8)", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
          <div className="absolute -top-1 left-4 h-3 w-[6px] rounded-b bg-slate-400/60" />
          <div className="absolute -top-1 right-4 h-3 w-[6px] rounded-b bg-slate-400/60" />
          <div className="absolute -top-1 left-1/2 h-3 w-[6px] -translate-x-1/2 rounded-b bg-slate-400/60" />
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative flex flex-wrap items-start gap-x-2 gap-y-3 px-4 pb-5">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            const condColor = item.condition ? CONDITION_COLORS[item.condition] : null;
            const rotation = (seededRand(String(item.id)) - 0.5) * 5;
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-5} className="flex flex-col items-center">
                <svg width="32" height="14" viewBox="0 0 32 14" className="text-slate-400 dark:text-slate-500">
                  <path d="M16 0 L16 4 Q16 6 14 7 L4 12 Q2 13 2 11 L14 6 Q16 5 18 6 L30 11 Q30 13 28 12 L18 7 Q16 6 16 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div className="flex h-[76px] w-[52px] flex-col items-center justify-center rounded-b-xl border border-t-0 border-g-border/50 bg-g-card/80 shadow-lg" style={{ transform: `rotate(${rotation}deg)` }}>
                  <Icon size={22} className="text-g-accent" />
                  {condColor ? <div className="mt-2 h-2 w-2 rounded-full" style={{ backgroundColor: condColor }} /> : null}
                </div>
                <span className="mt-1.5 max-w-[60px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
        <div className="h-2 bg-gradient-to-t from-amber-900/8 to-transparent dark:from-amber-900/5" />
      </div>
    </div>
  );
}

/* ── Shoe Rack ── */
function ShoeRackDetail({ items, onSelectItem }: DetailProps) {
  const mid = Math.ceil(items.length / 2);
  const tiers = [items.slice(0, mid), items.slice(mid)].filter((t) => t.length > 0);
  return (
    <div className="relative p-6">
      <div className="relative overflow-hidden rounded-xl border-2 border-amber-800/12 dark:border-amber-700/8">
        <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-amber-800/12 to-transparent dark:from-amber-700/8" />
        <div className="absolute inset-y-0 right-0 w-[5px] bg-gradient-to-l from-amber-800/12 to-transparent dark:from-amber-700/8" />
        {tiers.map((tier, ti) => (
          <div key={ti}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap items-end gap-3 px-5 pb-1 pt-4">
              {tier.map((item) => {
                const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
                const tilt = (seededRand(String(item.id)) - 0.5) * 12;
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
            <div className="mx-2 flex gap-[3px]">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="h-[3px] flex-1 rounded-full bg-slate-400/20 dark:bg-slate-500/15" />
              ))}
            </div>
          </div>
        ))}
        <div className="h-3" />
      </div>
    </div>
  );
}

/* ── Kitchen Cupboard ── */
function KitchenDetail({ items, onSelectItem }: DetailProps) {
  const mid = Math.ceil(items.length / 2);
  const shelves = [items.slice(0, mid), items.slice(mid)].filter((s) => s.length > 0);
  return (
    <div className="relative p-6">
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
            </div>
          </div>
        ))}
        <div className="h-3" />
      </div>
    </div>
  );
}

/* ── Hydration ── */
function HydrationDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[100px] overflow-hidden rounded-xl border border-sky-500/15 dark:border-sky-400/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.04), rgba(56,189,248,0.02), rgba(14,165,233,0.04))" }} />
        <div className="mx-4 mt-3 h-[3px] rounded bg-slate-400/20" />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative flex flex-wrap items-end gap-4 p-5">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center">
                <div className="flex h-16 w-11 items-center justify-center rounded-xl border border-sky-500/20 bg-g-card/60 shadow-md dark:border-sky-400/15">
                  <Icon size={20} className="text-sky-500 dark:text-sky-400" />
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

/* ── Sleep Station ── */
function SleepDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="absolute -top-1 right-10 z-10 flex flex-col items-center">
        <div className="h-5 w-8 rounded-t-full" style={{ background: "linear-gradient(180deg, rgba(251,191,36,0.25), rgba(251,191,36,0.10))", boxShadow: "0 0 24px rgba(251,191,36,0.12)" }} />
        <div className="h-4 w-[2px] bg-slate-400/40" />
        <div className="absolute top-6 h-20 w-28 opacity-30" style={{ background: "radial-gradient(ellipse, rgba(251,191,36,0.2), transparent 70%)" }} />
      </div>
      <div className="overflow-hidden rounded-xl border border-indigo-500/10 dark:border-indigo-400/10">
        <div className="relative min-h-[140px] p-5" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.03) 50%, rgba(99,102,241,0.05))" }}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3">
            {items.map((item) => {
              const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
              return (
                <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6}>
                  <div className="flex items-center gap-3 rounded-xl border border-indigo-500/15 bg-g-card/60 px-4 py-3 shadow-lg dark:border-indigo-400/10">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 dark:bg-indigo-500/15">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-g-text" style={{ maxWidth: 120 }}>{item.name}</p>
                      {item.brand ? <p className="truncate text-[11px] text-g-text-3" style={{ maxWidth: 120 }}>{item.brand}</p> : null}
                      {item.weight != null ? <p className="text-[10px] text-g-text-4">{item.weight} kg</p> : null}
                    </div>
                  </div>
                </RoomItem>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ── Tent Corner ── */
function TentCornerDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap items-end gap-5">
        {items.map((item) => {
          const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
          const lean = (seededRand(String(item.id)) - 0.5) * 8;
          return (
            <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6}>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-500/15 bg-g-card/40 p-4 shadow-xl dark:border-emerald-400/10" style={{ transform: `rotate(${lean}deg)` }}>
                <div className="flex h-18 w-18 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <Icon size={34} />
                </div>
                <div className="text-center">
                  <p className="max-w-[100px] truncate text-sm font-semibold text-g-text">{item.name}</p>
                  {item.brand ? <p className="max-w-[100px] truncate text-[11px] text-g-text-3">{item.brand}</p> : null}
                  {item.weight != null ? (
                    <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-g-text-4">
                      <Scale size={10} /> {item.weight} kg
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

/* ── Bike Rack ── */
function BikeRackDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[120px] overflow-hidden rounded-xl border border-lime-600/15 dark:border-lime-500/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(132,204,22,0.04), transparent 50%, rgba(132,204,22,0.04))" }} />
        <div className="mx-4 mt-3 h-[5px] rounded bg-slate-500/20" style={{ boxShadow: "0 2px 3px rgba(0,0,0,0.08)" }} />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-4 p-5">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-8} className="flex flex-col items-center">
                <div className="h-5 w-[3px] rounded-b bg-slate-400/40" />
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-lime-600/20 bg-g-card/60 shadow-lg dark:border-lime-500/15">
                  <Icon size={26} className="text-lime-600 dark:text-lime-400" />
                </div>
                <span className="mt-1.5 max-w-[80px] truncate text-center text-[11px] font-semibold text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Ski Rack ── */
function SkiRackDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[120px] overflow-hidden rounded-xl border border-cyan-500/15 dark:border-cyan-400/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,182,212,0.04), transparent)" }} />
        <div className="mx-4 mt-3 mb-1 h-[4px] rounded bg-slate-500/25" />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap items-end gap-4 p-5">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            const lean = (seededRand(String(item.id)) - 0.5) * 6;
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-5} className="flex flex-col items-center">
                <div className="flex h-[80px] w-11 items-center justify-center rounded-lg border border-cyan-500/20 bg-g-card/60 shadow-lg dark:border-cyan-400/15" style={{ transform: `rotate(${lean}deg)` }}>
                  <Icon size={22} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="mt-1 max-w-[64px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
        <div className="mx-4 mb-3 h-[3px] rounded bg-slate-500/20" />
      </div>
    </div>
  );
}

/* ── Paddle Rack ── */
function PaddleRackDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[100px] overflow-hidden rounded-xl border border-blue-500/15 dark:border-blue-400/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.04), transparent, rgba(59,130,246,0.04))" }} />
        <div className="mx-4 mt-3 flex gap-6">
          <div className="h-[4px] w-12 rounded bg-slate-400/30" />
          <div className="h-[4px] w-12 rounded bg-slate-400/30" />
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-4 p-5">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            const lean = (seededRand(String(item.id)) - 0.5) * 10;
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center">
                <div className="flex h-16 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-g-card/50 shadow-lg dark:border-blue-400/15" style={{ transform: `rotate(${lean}deg)` }}>
                  <Icon size={22} className="text-blue-500 dark:text-blue-400" />
                </div>
                <span className="mt-1.5 max-w-[72px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Rope / Climbing Rack ── */
function RopeRackDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[100px] overflow-hidden rounded-xl border border-rose-500/15 dark:border-rose-400/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.04), transparent, rgba(244,63,94,0.04))" }} />
        <div className="mx-4 mt-3 flex gap-4">
          {items.slice(0, 8).map((_, i) => (
            <div key={i} className="h-3 w-[4px] rounded-b bg-slate-500/40" />
          ))}
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-4 p-5">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-7} className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-rose-500/20 bg-g-card/60 shadow-lg dark:border-rose-400/15">
                  <Icon size={22} className="text-rose-500 dark:text-rose-400" />
                </div>
                <span className="mt-1 max-w-[72px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Tech / Charging Station ── */
function TechStationDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[100px] overflow-hidden rounded-xl border border-violet-500/15 dark:border-violet-400/10">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.04), transparent, rgba(139,92,246,0.04))" }} />
        <div className="mx-4 mt-3 flex items-center gap-2">
          <div className="h-[5px] flex-1 rounded bg-slate-600/20 dark:bg-slate-400/15" />
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3 p-5">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center">
                <div className="flex h-13 w-13 items-center justify-center rounded-lg border border-violet-500/20 bg-g-card/60 shadow-md dark:border-violet-400/15">
                  <Icon size={20} className="text-violet-500 dark:text-violet-400" />
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

/* ── Hat Hooks ── */
function HatHooksDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[120px] overflow-hidden rounded-xl border border-pink-500/15 dark:border-pink-400/10">
        <div className="h-3 bg-gradient-to-b from-amber-800/10 to-transparent dark:from-amber-700/6" />
        <div className="mx-4 flex gap-6">
          {items.slice(0, 8).map((_, i) => (
            <div key={i} className="h-[8px] w-[3px] rounded-b bg-slate-400/50" />
          ))}
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-x-4 gap-y-3 px-5 pb-5 pt-3">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-5} className="flex flex-col items-center">
                <div className="flex h-13 w-13 items-center justify-center rounded-full border border-pink-500/20 bg-g-card/80 shadow-lg dark:border-pink-400/15">
                  <Icon size={20} className="text-pink-500 dark:text-pink-400" />
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

/* ── Pack Wall ── */
function PackWallDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[140px] overflow-hidden rounded-xl border border-orange-500/15 dark:border-orange-400/10">
        <div className="mx-4 mt-3 h-[4px] rounded bg-slate-400/25" />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-5 p-5">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-8} className="flex flex-col items-center">
                <div className="h-5 w-[3px] rounded-b bg-slate-500/50" />
                <div className="flex h-[72px] w-16 items-center justify-center rounded-xl border border-orange-500/15 bg-g-card/70 shadow-xl dark:border-orange-400/10">
                  <Icon size={28} className="text-orange-500 dark:text-orange-400" />
                </div>
                <span className="mt-1.5 max-w-[76px] truncate text-center text-[11px] font-semibold text-g-text-2">{item.name}</span>
                {item.weight != null ? <span className="text-[9px] text-g-text-4">{item.weight} kg</span> : null}
              </RoomItem>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Food Box ── */
function FoodBoxDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative min-h-[80px] overflow-hidden rounded-xl border-2 border-dashed border-amber-600/20 dark:border-amber-500/15">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(217,119,6,0.04), transparent, rgba(217,119,6,0.04))" }} />
        <div className="flex">
          <div className="h-3 flex-1 border-b border-r border-amber-600/15 bg-amber-600/5 dark:border-amber-500/10 dark:bg-amber-500/[0.03]" />
          <div className="h-3 flex-1 border-b border-amber-600/15 bg-amber-600/5 dark:border-amber-500/10 dark:bg-amber-500/[0.03]" />
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3 p-5">
          {items.map((item) => {
            const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
            return (
              <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-5} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-600/20 bg-g-card/60 shadow-md dark:border-amber-500/15">
                  <Icon size={20} className="text-amber-600 dark:text-amber-400" />
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

/* ── Camp Furniture ── */
function CampFurnitureDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-4">
        {items.map((item) => {
          const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
          return (
            <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6}>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-g-border/50 bg-g-card/40 p-4 shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                  <Icon size={24} />
                </div>
                <span className="max-w-[80px] truncate text-center text-[11px] font-semibold text-g-text-2">{item.name}</span>
              </div>
            </RoomItem>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ── Workbench (catch-all) ── */
function WorkbenchDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <div className="relative overflow-hidden rounded-xl border-2 border-amber-800/12 dark:border-amber-700/8">
        <div className="relative min-h-[80px] p-5" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(139,90,43,0.04) 11px, rgba(139,90,43,0.04) 12px), linear-gradient(135deg, rgba(180,130,70,0.06), rgba(160,110,60,0.04) 50%, rgba(180,130,70,0.06))" }}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3">
            {items.map((item) => {
              const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
              const rotation = (seededRand(String(item.id)) - 0.5) * 10;
              return (
                <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-8}>
                  <div className="flex flex-col items-center gap-1 rounded-lg border border-g-border/40 bg-g-card/50 p-3 shadow-md" style={{ transform: `rotate(${rotation}deg)` }}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
                      <Icon size={22} />
                    </div>
                    <span className="max-w-[72px] truncate text-center text-[10px] font-semibold text-g-text-2">{item.name}</span>
                  </div>
                </RoomItem>
              );
            })}
          </motion.div>
        </div>
        <div className="h-[5px]" style={{ background: "linear-gradient(180deg, rgba(160,110,50,0.18), rgba(120,75,35,0.12))", boxShadow: "0 2px 4px rgba(100,70,30,0.10)" }} />
      </div>
    </div>
  );
}

/* ── Default fallback ── */
function DefaultZoneDetail({ items, onSelectItem }: DetailProps) {
  return (
    <div className="relative p-6">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3">
        {items.map((item) => {
          const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
          return (
            <RoomItem key={item.id} item={item} onClick={() => onSelectItem(item)} liftDistance={-6} className="flex flex-col items-center">
              <div className="flex h-13 w-13 items-center justify-center rounded-xl border border-g-border/50 bg-g-card/60 shadow-md">
                <Icon size={22} className="text-g-accent" />
              </div>
              <span className="mt-1 max-w-[68px] truncate text-center text-[10px] font-medium text-g-text-2">{item.name}</span>
            </RoomItem>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Zone renderer registry
   ═══════════════════════════════════════════════ */

const ZONE_DETAIL_RENDERERS: Record<ZoneId, (props: DetailProps) => React.ReactNode> = {
  pegboard: PegboardDetail,
  hat_hooks: HatHooksDetail,
  wardrobe: WardrobeDetail,
  shoe_rack: ShoeRackDetail,
  pack_wall: PackWallDetail,
  kitchen: KitchenDetail,
  hydration: HydrationDetail,
  bike_rack: BikeRackDetail,
  ski_rack: SkiRackDetail,
  paddle_rack: PaddleRackDetail,
  rope_rack: RopeRackDetail,
  tech_station: TechStationDetail,
  sleep: SleepDetail,
  food_box: FoodBoxDetail,
  tent_corner: TentCornerDetail,
  camp_furniture: CampFurnitureDetail,
  workbench: WorkbenchDetail,
};
