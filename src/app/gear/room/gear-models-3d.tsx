"use client";

import { RoundedBox } from "@react-three/drei";
import type { GearItemRow } from "../gear-client";

/* ═══════════════════════════════════════════════════════════
   Zone resolution — which physical slot an item belongs to
   ═══════════════════════════════════════════════════════════ */

export type Zone3D =
  | "pegboard"
  | "wardrobe"
  | "pack_wall"
  | "shelf"
  | "floor_rack"
  | "sleep_corner"
  | "shoe_row"
  | "tent_floor"
  | "workbench";

type Rule = { kw: string[]; zone: Zone3D };

const RULES: Rule[] = [
  { kw: ["tent", "tarp", "shelter", "bivy", "rain fly"], zone: "tent_floor" },
  { kw: ["sleeping bag", "quilt", "sleeping pad", "pillow", "liner"], zone: "sleep_corner" },
  { kw: ["boot", "shoe", "sandal", "gaiter", "crampon", "trail runner"], zone: "shoe_row" },
  { kw: ["backpack", "pack", "daypack", "rucksack", "duffel", "duffle"], zone: "pack_wall" },
  { kw: ["jacket", "shell", "rain", "shirt", "jersey", "fleece", "hoodie", "vest", "coat"], zone: "wardrobe" },
  { kw: ["ski", "snowboard", "paddle", "kayak", "canoe", "bike", "bicycle"], zone: "floor_rack" },
  { kw: ["stove", "burner", "pot", "pan", "cook", "mug", "utensil", "spork", "lighter"], zone: "shelf" },
  { kw: ["water bottle", "flask", "nalgene", "hydration", "water filter", "bladder", "reservoir"], zone: "shelf" },
  { kw: ["charger", "power bank", "solar", "gps", "inreach", "camera", "headphone", "speaker"], zone: "shelf" },
  { kw: ["food", "bear canister", "bear bag", "cooler", "snack"], zone: "shelf" },
  { kw: ["hat", "cap", "beanie", "buff", "glove", "mitt", "sunglasses", "goggles"], zone: "pegboard" },
  { kw: ["headlamp", "flashlight", "lantern", "compass", "knife", "multi-tool", "leatherman", "first aid", "rope", "sling", "carabiner", "harness", "chalk"], zone: "pegboard" },
];

const CATEGORY_FALLBACK: Record<string, Zone3D> = {
  "Tents & Shelters": "tent_floor",
  "Sleep Systems": "sleep_corner",
  Clothing: "wardrobe",
  Cooking: "shelf",
  Navigation: "pegboard",
  Safety: "pegboard",
  Other: "workbench",
};

export function resolveZone3D(item: GearItemRow): Zone3D {
  const hay = [item.name, item.brand ?? "", item.categories?.name ?? ""]
    .join(" ")
    .toLowerCase();
  for (const r of RULES) {
    for (const k of r.kw) {
      if (hay.includes(k)) return r.zone;
    }
  }
  return CATEGORY_FALLBACK[item.categories?.name ?? "Other"] ?? "workbench";
}

/* ═══════════════════════════════════════════════════════════
   Species resolver — which procedural model to draw
   ═══════════════════════════════════════════════════════════ */

export type Species =
  | "pack" | "tent" | "sleeping_bag" | "jacket" | "boot" | "bottle"
  | "stove" | "pot" | "ski" | "paddle" | "bike" | "rope" | "hat"
  | "headlamp" | "knife" | "food_can" | "lantern" | "block";

const SPECIES_RULES: { kw: string[]; species: Species }[] = [
  { kw: ["tent", "tarp", "shelter"], species: "tent" },
  { kw: ["sleeping bag", "quilt", "pad", "mattress", "pillow"], species: "sleeping_bag" },
  { kw: ["backpack", "pack", "daypack", "rucksack", "duffel", "duffle"], species: "pack" },
  { kw: ["jacket", "shell", "shirt", "jersey", "fleece", "hoodie", "vest", "coat"], species: "jacket" },
  { kw: ["boot", "shoe", "sandal", "trail runner"], species: "boot" },
  { kw: ["bottle", "nalgene", "flask", "bladder", "reservoir"], species: "bottle" },
  { kw: ["stove", "burner"], species: "stove" },
  { kw: ["pot", "pan", "cookware", "mug", "cup"], species: "pot" },
  { kw: ["ski", "snowboard"], species: "ski" },
  { kw: ["paddle", "kayak", "canoe"], species: "paddle" },
  { kw: ["bike", "bicycle"], species: "bike" },
  { kw: ["rope", "sling", "cord", "runner", "chalk"], species: "rope" },
  { kw: ["hat", "cap", "beanie", "buff"], species: "hat" },
  { kw: ["headlamp", "flashlight"], species: "headlamp" },
  { kw: ["lantern", "candle"], species: "lantern" },
  { kw: ["knife", "multi-tool", "leatherman", "compass", "gps", "first aid"], species: "knife" },
  { kw: ["food", "bear canister", "bear bag", "snack", "bar", "meal"], species: "food_can" },
];

export function resolveSpecies(item: GearItemRow): Species {
  const hay = [item.name, item.brand ?? "", item.categories?.name ?? ""]
    .join(" ")
    .toLowerCase();
  for (const r of SPECIES_RULES) {
    for (const k of r.kw) if (hay.includes(k)) return r.species;
  }
  return "block";
}

/* ═══════════════════════════════════════════════════════════
   Color palette — stable per item via id hash
   ═══════════════════════════════════════════════════════════ */

const FABRIC = ["#4a6b45", "#8b5a2b", "#2f4a5a", "#b56b3b", "#5a4a3a", "#7a6a4a", "#3a5a4a", "#a84a2b", "#556b2f", "#6a3b5c"];
const PLASTIC = ["#e06a3a", "#3a88b8", "#4a9a5a", "#d4a838", "#9a4a8a", "#b8443a"];
const METAL = ["#7a7a7a", "#5a5a5a", "#8a8a8a"];
const LEATHER = ["#5a3a1a", "#3a2a1a", "#6a4a2a"];

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickColor(id: string, palette: string[]) {
  return palette[hash(id) % palette.length];
}

export function seededOffset(id: string, salt: number, range: number) {
  const v = (hash(id + String(salt)) % 1000) / 1000;
  return (v - 0.5) * 2 * range;
}

/* ═══════════════════════════════════════════════════════════
   MODELS — each component is rooted at its natural anchor
   (hanging: hook at origin; sitting: base on y=0)
   ═══════════════════════════════════════════════════════════ */

const FABRIC_MAT = { roughness: 0.85, metalness: 0.02 };
const PLASTIC_MAT = { roughness: 0.35, metalness: 0.1 };
const METAL_MAT = { roughness: 0.25, metalness: 0.8 };
const LEATHER_MAT = { roughness: 0.7, metalness: 0.05 };

export function Pack({ id }: { id: string }) {
  // Anchor: origin at top hook; pack hangs below
  const color = pickColor(id, FABRIC);
  const accent = pickColor(id + "a", FABRIC);
  return (
    <group>
      {/* Hook strap */}
      <mesh position={[0, -0.05, 0]}>
        <torusGeometry args={[0.05, 0.012, 8, 16]} />
        <meshStandardMaterial color="#222" {...METAL_MAT} />
      </mesh>
      {/* Main body */}
      <RoundedBox args={[0.34, 0.52, 0.22]} radius={0.06} smoothness={3} position={[0, -0.4, 0]} castShadow>
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </RoundedBox>
      {/* Top lid */}
      <RoundedBox args={[0.3, 0.1, 0.22]} radius={0.04} smoothness={3} position={[0, -0.12, 0.02]} castShadow>
        <meshStandardMaterial color={accent} {...FABRIC_MAT} />
      </RoundedBox>
      {/* Front pocket */}
      <RoundedBox args={[0.22, 0.22, 0.04]} radius={0.04} smoothness={3} position={[0, -0.48, 0.13]} castShadow>
        <meshStandardMaterial color={accent} {...FABRIC_MAT} />
      </RoundedBox>
      {/* Side straps */}
      <mesh position={[-0.1, -0.18, 0.12]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.04, 0.32, 0.012]} />
        <meshStandardMaterial color="#222" {...FABRIC_MAT} />
      </mesh>
      <mesh position={[0.1, -0.18, 0.12]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.04, 0.32, 0.012]} />
        <meshStandardMaterial color="#222" {...FABRIC_MAT} />
      </mesh>
    </group>
  );
}

export function Tent({ id }: { id: string }) {
  // Anchor: base on y=0
  const color = pickColor(id, ["#4a6b45", "#d4a838", "#b8553a", "#3a5a7a", "#6a5a3a"]);
  return (
    <group>
      {/* Body — use a cone-like shape via cylinder with low radial segments */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0, 0.48, 0.56, 4, 1]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      {/* Door flap */}
      <mesh position={[0, 0.18, 0.34]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[0.3, 0.38]} />
        <meshStandardMaterial color="#222" side={2} {...FABRIC_MAT} />
      </mesh>
      {/* Guy lines hint — tiny stakes */}
      <mesh position={[0.5, 0.01, 0]}>
        <boxGeometry args={[0.01, 0.02, 0.01]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      <mesh position={[-0.5, 0.01, 0]}>
        <boxGeometry args={[0.01, 0.02, 0.01]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
    </group>
  );
}

export function SleepingBag({ id }: { id: string }) {
  // Anchor: base; rolled horizontally
  const color = pickColor(id, ["#b8553a", "#4a6b45", "#3a5a7a", "#d4a838", "#8a4a6a"]);
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.48, 20]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      {/* End caps */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.24, 0.13, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
        <meshStandardMaterial color="#1a1a1a" {...FABRIC_MAT} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.24, 0.13, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
        <meshStandardMaterial color="#1a1a1a" {...FABRIC_MAT} />
      </mesh>
      {/* Strap */}
      <mesh position={[0, 0.13, 0]}>
        <torusGeometry args={[0.14, 0.008, 6, 18]} />
        <meshStandardMaterial color="#111" {...FABRIC_MAT} />
      </mesh>
    </group>
  );
}

export function Jacket({ id }: { id: string }) {
  // Anchor: origin at hook; jacket hangs below
  const color = pickColor(id, FABRIC);
  return (
    <group>
      {/* Hanger hook */}
      <mesh position={[0, -0.02, 0]}>
        <torusGeometry args={[0.025, 0.006, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#888" {...METAL_MAT} />
      </mesh>
      {/* Hanger bar */}
      <mesh position={[0, -0.11, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.36, 0.008, 0.015]} />
        <meshStandardMaterial color="#555" {...METAL_MAT} />
      </mesh>
      {/* Shoulders triangle fabric */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.26, 0.34, 0.45, 8, 1, true]} />
        <meshStandardMaterial color={color} side={2} {...FABRIC_MAT} />
      </mesh>
      {/* Sleeves */}
      <mesh position={[-0.18, -0.28, 0]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.06, 0.08, 0.34, 10]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      <mesh position={[0.18, -0.28, 0]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.06, 0.08, 0.34, 10]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      {/* Zipper stripe */}
      <mesh position={[0, -0.22, 0.17]}>
        <boxGeometry args={[0.01, 0.42, 0.005]} />
        <meshStandardMaterial color="#111" {...FABRIC_MAT} />
      </mesh>
    </group>
  );
}

export function Boot({ id }: { id: string }) {
  // Anchor: base on y=0
  const color = pickColor(id, LEATHER);
  return (
    <group>
      {/* Sole */}
      <RoundedBox args={[0.1, 0.04, 0.28]} radius={0.018} smoothness={3} position={[0, 0.02, 0]} castShadow>
        <meshStandardMaterial color="#111" {...LEATHER_MAT} />
      </RoundedBox>
      {/* Foot */}
      <RoundedBox args={[0.095, 0.09, 0.26]} radius={0.03} smoothness={3} position={[0, 0.09, 0.01]} castShadow>
        <meshStandardMaterial color={color} {...LEATHER_MAT} />
      </RoundedBox>
      {/* Ankle */}
      <mesh position={[0, 0.2, -0.08]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.16, 14]} />
        <meshStandardMaterial color={color} {...LEATHER_MAT} />
      </mesh>
      {/* Laces (stripe) */}
      <mesh position={[0, 0.14, 0.08]}>
        <boxGeometry args={[0.04, 0.08, 0.002]} />
        <meshStandardMaterial color="#eee" />
      </mesh>
    </group>
  );
}

export function Bottle({ id }: { id: string }) {
  // Anchor: base
  const color = pickColor(id, PLASTIC);
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.24, 18]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.04, 14]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
      <mesh position={[0, 0.29, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.018, 14]} />
        <meshStandardMaterial color="#222" {...PLASTIC_MAT} />
      </mesh>
      {/* Label stripe */}
      <mesh position={[0, 0.12, 0.051]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
}

export function Stove({ id: _id }: { id: string }) {
  return (
    <group>
      <mesh position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 20]} />
        <meshStandardMaterial color="#222" {...METAL_MAT} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.06, 0.065, 0.04, 20]} />
        <meshStandardMaterial color="#444" {...METAL_MAT} />
      </mesh>
      {/* Pot supports */}
      {[0, 120, 240].map((deg) => (
        <mesh
          key={deg}
          rotation={[0, (deg * Math.PI) / 180, 0]}
          position={[0, 0.08, 0]}
        >
          <boxGeometry args={[0.09, 0.015, 0.012]} />
          <meshStandardMaterial color="#888" {...METAL_MAT} />
        </mesh>
      ))}
    </group>
  );
}

export function Pot({ id }: { id: string }) {
  const color = pickColor(id, ["#aaa", "#888", "#c0c0c0"]);
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.085, 0.1, 20]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      <mesh position={[0.11, 0.08, 0]}>
        <torusGeometry args={[0.03, 0.008, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#333" {...METAL_MAT} />
      </mesh>
      <mesh position={[-0.11, 0.08, 0]}>
        <torusGeometry args={[0.03, 0.008, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#333" {...METAL_MAT} />
      </mesh>
    </group>
  );
}

export function Ski({ id }: { id: string }) {
  // Standing upright, base at y=0
  const color = pickColor(id, ["#1a2a4a", "#3a1a4a", "#4a1a1a", "#1a4a3a"]);
  return (
    <group>
      <mesh position={[-0.04, 0.8, 0]} castShadow rotation={[0, 0, -0.02]}>
        <boxGeometry args={[0.09, 1.6, 0.012]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
      <mesh position={[0.04, 0.8, 0]} castShadow rotation={[0, 0, 0.02]}>
        <boxGeometry args={[0.09, 1.6, 0.012]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
      {/* Bindings */}
      <mesh position={[0, 0.7, 0.015]}>
        <boxGeometry args={[0.2, 0.08, 0.02]} />
        <meshStandardMaterial color="#111" {...PLASTIC_MAT} />
      </mesh>
    </group>
  );
}

export function Paddle({ id }: { id: string }) {
  const color = pickColor(id, ["#e06a3a", "#3a88b8", "#4a9a5a", "#d4a838"]);
  return (
    <group>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 1.4, 12]} />
        <meshStandardMaterial color="#222" {...METAL_MAT} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.16, 0.26, 0.015]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.16, 0.26, 0.015]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
    </group>
  );
}

export function Bike({ id }: { id: string }) {
  const color = pickColor(id, ["#1a4a7a", "#4a1a1a", "#111", "#4a2a1a"]);
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      {/* Wheels */}
      <mesh position={[-0.4, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.3, 0.025, 10, 28]} />
        <meshStandardMaterial color="#111" {...PLASTIC_MAT} />
      </mesh>
      <mesh position={[0.4, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.3, 0.025, 10, 28]} />
        <meshStandardMaterial color="#111" {...PLASTIC_MAT} />
      </mesh>
      {/* Frame triangle */}
      <mesh position={[0, 0.42, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 10]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      <mesh position={[-0.15, 0.5, 0]} rotation={[0, 0, 1.0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.55, 10]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      <mesh position={[0.1, 0.42, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.015, 0.015, 0.55, 10]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      {/* Seat */}
      <mesh position={[-0.18, 0.72, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.05]} />
        <meshStandardMaterial color="#111" {...LEATHER_MAT} />
      </mesh>
      {/* Handlebar */}
      <mesh position={[0.25, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.24, 10]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
    </group>
  );
}

export function RopeCoil({ id }: { id: string }) {
  const color = pickColor(id, ["#d4a838", "#e06a3a", "#4a9a5a", "#3a88b8"]);
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.12, 0.04, 10, 24]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[0.12, 0.04, 10, 24]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
    </group>
  );
}

export function Hat({ id }: { id: string }) {
  const color = pickColor(id, FABRIC);
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.08, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      <mesh position={[0, -0.002, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.008, 22]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
    </group>
  );
}

export function Headlamp({ id: _id }: { id: string }) {
  return (
    <group>
      <mesh castShadow>
        <torusGeometry args={[0.08, 0.012, 8, 18]} />
        <meshStandardMaterial color="#222" {...FABRIC_MAT} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.06, 0.04, 0.03]} />
        <meshStandardMaterial
          color="#eee"
          emissive="#ffcc88"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

export function Knife({ id: _id }: { id: string }) {
  return (
    <group>
      {/* Handle */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.028, 0.08, 0.012]} />
        <meshStandardMaterial color="#5a3a1a" {...LEATHER_MAT} />
      </mesh>
      {/* Blade */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.022, 0.08, 0.008]} />
        <meshStandardMaterial color="#ccc" {...METAL_MAT} />
      </mesh>
    </group>
  );
}

export function FoodCan({ id }: { id: string }) {
  const color = pickColor(id, ["#d4a838", "#4a6b45", "#3a88b8"]);
  return (
    <group>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.22, 20]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.115, 0.115, 0.02, 20]} />
        <meshStandardMaterial color="#222" {...PLASTIC_MAT} />
      </mesh>
    </group>
  );
}

export function Lantern({ id: _id }: { id: string }) {
  return (
    <group>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.02, 14]} />
        <meshStandardMaterial color="#444" {...METAL_MAT} />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
        <meshStandardMaterial
          color="#ffd88a"
          emissive="#ffb050"
          emissiveIntensity={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.055, 0.03, 0.02, 14]} />
        <meshStandardMaterial color="#444" {...METAL_MAT} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.03, 0.006, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#444" {...METAL_MAT} />
      </mesh>
    </group>
  );
}

export function Block({ id }: { id: string }) {
  const color = pickColor(id, FABRIC);
  return (
    <RoundedBox args={[0.2, 0.16, 0.14]} radius={0.02} smoothness={3} position={[0, 0.08, 0]} castShadow>
      <meshStandardMaterial color={color} {...FABRIC_MAT} />
    </RoundedBox>
  );
}

/* ═══════════════════════════════════════════════════════════
   Species dispatcher
   ═══════════════════════════════════════════════════════════ */

export function GearMesh({
  species,
  id,
}: {
  species: Species;
  id: string;
}) {
  switch (species) {
    case "pack": return <Pack id={id} />;
    case "tent": return <Tent id={id} />;
    case "sleeping_bag": return <SleepingBag id={id} />;
    case "jacket": return <Jacket id={id} />;
    case "boot": return <Boot id={id} />;
    case "bottle": return <Bottle id={id} />;
    case "stove": return <Stove id={id} />;
    case "pot": return <Pot id={id} />;
    case "ski": return <Ski id={id} />;
    case "paddle": return <Paddle id={id} />;
    case "bike": return <Bike id={id} />;
    case "rope": return <RopeCoil id={id} />;
    case "hat": return <Hat id={id} />;
    case "headlamp": return <Headlamp id={id} />;
    case "knife": return <Knife id={id} />;
    case "food_can": return <FoodCan id={id} />;
    case "lantern": return <Lantern id={id} />;
    default: return <Block id={id} />;
  }
}

/** Natural "standing height" of each species for placement math */
export const SPECIES_HEIGHT: Record<Species, number> = {
  pack: 0.55,
  tent: 0.56,
  sleeping_bag: 0.28,
  jacket: 0.5,
  boot: 0.27,
  bottle: 0.3,
  stove: 0.1,
  pot: 0.11,
  ski: 1.6,
  paddle: 1.4,
  bike: 0.7,
  rope: 0.1,
  hat: 0.1,
  headlamp: 0.1,
  knife: 0.16,
  food_can: 0.24,
  lantern: 0.3,
  block: 0.16,
};

/** Whether this species anchors at a hook (hanging) vs its base (standing) */
export const HANGING: Set<Species> = new Set<Species>([
  "pack",
  "jacket",
  "rope",
  "hat",
  "headlamp",
  "knife",
]);
