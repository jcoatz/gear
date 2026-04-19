"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
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
   Shared materials
   ═══════════════════════════════════════════════════════════ */

const FABRIC_MAT = { roughness: 0.88, metalness: 0.02 };
const PLASTIC_MAT = { roughness: 0.38, metalness: 0.08 };
const METAL_MAT = { roughness: 0.28, metalness: 0.82 };
const LEATHER_MAT = { roughness: 0.72, metalness: 0.05 };
const RUBBER_MAT = { roughness: 0.95, metalness: 0.02 };

/* ═══════════════════════════════════════════════════════════
   MODELS — each component rooted at its natural anchor
   (hanging: hook at origin; sitting: base on y=0)
   ═══════════════════════════════════════════════════════════ */

export function Pack({ id }: { id: string }) {
  const color = pickColor(id, FABRIC);
  const accent = pickColor(id + "a", FABRIC);
  const strapColor = "#1e1e1e";
  return (
    <group>
      {/* Haul loop at top */}
      <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.008, 8, 14, Math.PI]} />
        <meshStandardMaterial color={strapColor} {...FABRIC_MAT} />
      </mesh>
      {/* Main body — tall rounded bag */}
      <RoundedBox args={[0.36, 0.58, 0.24]} radius={0.08} smoothness={4} position={[0, -0.36, 0]} castShadow>
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </RoundedBox>
      {/* Top lid with buckle */}
      <RoundedBox args={[0.32, 0.12, 0.24]} radius={0.05} smoothness={4} position={[0, -0.1, 0.015]} castShadow>
        <meshStandardMaterial color={accent} {...FABRIC_MAT} />
      </RoundedBox>
      {/* Lid buckle */}
      <mesh position={[0, -0.15, 0.14]}>
        <boxGeometry args={[0.05, 0.025, 0.01]} />
        <meshStandardMaterial color="#0a0a0a" {...PLASTIC_MAT} />
      </mesh>
      {/* Front stretch pocket */}
      <RoundedBox args={[0.24, 0.24, 0.05]} radius={0.04} smoothness={3} position={[0, -0.44, 0.135]} castShadow>
        <meshStandardMaterial color={accent} {...FABRIC_MAT} />
      </RoundedBox>
      {/* Side compression straps */}
      {[-0.125, 0.125].map((x) => (
        <mesh key={x} position={[x, -0.28, 0.125]}>
          <boxGeometry args={[0.022, 0.5, 0.006]} />
          <meshStandardMaterial color={strapColor} {...FABRIC_MAT} />
        </mesh>
      ))}
      {/* Shoulder straps hanging in front */}
      {[-0.08, 0.08].map((x) => (
        <group key={x}>
          <mesh position={[x, -0.14, 0.14]} rotation={[0.12, 0, x > 0 ? -0.08 : 0.08]}>
            <boxGeometry args={[0.055, 0.14, 0.02]} />
            <meshStandardMaterial color={strapColor} {...FABRIC_MAT} />
          </mesh>
          <mesh position={[x * 1.8, -0.32, 0.16]} rotation={[0, 0, x > 0 ? -0.16 : 0.16]}>
            <boxGeometry args={[0.05, 0.32, 0.018]} />
            <meshStandardMaterial color={strapColor} {...FABRIC_MAT} />
          </mesh>
        </group>
      ))}
      {/* Sternum strap */}
      <mesh position={[0, -0.28, 0.16]}>
        <boxGeometry args={[0.16, 0.012, 0.006]} />
        <meshStandardMaterial color={strapColor} {...FABRIC_MAT} />
      </mesh>
      {/* Sternum buckle */}
      <mesh position={[0, -0.28, 0.168]}>
        <boxGeometry args={[0.035, 0.025, 0.008]} />
        <meshStandardMaterial color="#0a0a0a" {...PLASTIC_MAT} />
      </mesh>
      {/* Logo dot */}
      <mesh position={[0, -0.2, 0.121]}>
        <circleGeometry args={[0.018, 12]} />
        <meshStandardMaterial color="#f0e4c8" {...FABRIC_MAT} />
      </mesh>
    </group>
  );
}

export function Tent({ id }: { id: string }) {
  // A-frame tent via extruded triangle prism
  const color = pickColor(id, ["#4a6b45", "#d4a838", "#b8553a", "#3a5a7a", "#6a5a3a"]);
  const flyColor = pickColor(id + "fly", ["#2a3a28", "#6a4a22", "#7a3a22", "#2a3a4a"]);
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.52, 0);
    shape.lineTo(0.52, 0);
    shape.lineTo(0, 0.52);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 1.0,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 1,
    });
    g.translate(0, 0, -0.5);
    return g;
  }, []);
  return (
    <group>
      {/* Rain fly (outer A-frame) */}
      <mesh geometry={geom} castShadow receiveShadow scale={[1.05, 1.02, 1.02]} position={[0, 0.002, 0]}>
        <meshStandardMaterial color={flyColor} {...FABRIC_MAT} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner tent body */}
      <mesh geometry={geom} castShadow scale={[0.92, 0.95, 0.98]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color={color} {...FABRIC_MAT} side={THREE.DoubleSide} />
      </mesh>
      {/* Ridge pole along top */}
      <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.04, 8]} />
        <meshStandardMaterial color="#dcdcdc" {...METAL_MAT} />
      </mesh>
      {/* Door (D-shape panel on one end) */}
      <mesh position={[0, 0.18, 0.501]}>
        <planeGeometry args={[0.4, 0.36]} />
        <meshStandardMaterial color="#1a1a1a" {...FABRIC_MAT} />
      </mesh>
      {/* Zipper line on door */}
      <mesh position={[0, 0.18, 0.502]}>
        <boxGeometry args={[0.006, 0.34, 0.002]} />
        <meshStandardMaterial color="#b8b8b8" {...METAL_MAT} />
      </mesh>
      {/* Guy line stakes at 4 corners */}
      {[
        [0.62, -0.55],
        [-0.62, -0.55],
        [0.62, 0.55],
        [-0.62, 0.55],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.01, z]}>
          <coneGeometry args={[0.01, 0.04, 6]} />
          <meshStandardMaterial color="#c0c0c0" {...METAL_MAT} />
        </mesh>
      ))}
      {/* Guy lines (subtle white strings) */}
      {[
        [0.52, 0, 0.62, 0.01, -0.55],
        [-0.52, 0, -0.62, 0.01, -0.55],
      ].map(([x1, y1, x2, y2, z2], i) => {
        const mid = [(x1 + x2) / 2, (y1 + y2) / 2, z2 / 2] as const;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return (
          <mesh
            key={i}
            position={[mid[0], mid[1], mid[2]]}
            rotation={[0, 0, angle]}
          >
            <cylinderGeometry args={[0.002, 0.002, len, 4]} />
            <meshStandardMaterial color="#e8d8a8" />
          </mesh>
        );
      })}
    </group>
  );
}

export function SleepingBag({ id }: { id: string }) {
  const color = pickColor(id, ["#b8553a", "#4a6b45", "#3a5a7a", "#d4a838", "#8a4a6a"]);
  const strapColor = "#1a1a1a";
  return (
    <group>
      {/* Main roll */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.5, 24]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      {/* Quilted ring rings to suggest padding */}
      {[-0.15, 0, 0.15].map((x) => (
        <mesh key={x} position={[x, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.142, 0.006, 6, 28]} />
          <meshStandardMaterial color={color} {...FABRIC_MAT} />
        </mesh>
      ))}
      {/* End caps (darker) */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.251, 0.14, 0]}>
        <cylinderGeometry args={[0.145, 0.145, 0.015, 24]} />
        <meshStandardMaterial color="#1a1a1a" {...FABRIC_MAT} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.251, 0.14, 0]}>
        <cylinderGeometry args={[0.145, 0.145, 0.015, 24]} />
        <meshStandardMaterial color="#1a1a1a" {...FABRIC_MAT} />
      </mesh>
      {/* Compression strap */}
      <mesh position={[0.08, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.144, 0.144, 0.022, 24, 1, true]} />
        <meshStandardMaterial color={strapColor} {...FABRIC_MAT} side={THREE.DoubleSide} />
      </mesh>
      {/* Strap buckle */}
      <mesh position={[0.08, 0.28, 0]}>
        <boxGeometry args={[0.028, 0.018, 0.012]} />
        <meshStandardMaterial color="#0a0a0a" {...PLASTIC_MAT} />
      </mesh>
    </group>
  );
}

export function Jacket({ id }: { id: string }) {
  const color = pickColor(id, FABRIC);
  const trim = "#141414";
  // Jacket body as flat trapezoid panel
  const bodyGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.18, 0); // left shoulder
    shape.lineTo(0.18, 0); // right shoulder
    shape.lineTo(0.22, -0.46); // right hem
    shape.lineTo(-0.22, -0.46); // left hem
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 2,
    });
  }, []);
  return (
    <group>
      {/* Hanger hook */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.022, 0.005, 6, 14, Math.PI]} />
        <meshStandardMaterial color="#aaa" {...METAL_MAT} />
      </mesh>
      {/* Hanger triangle */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.38, 0.01, 0.015]} />
        <meshStandardMaterial color="#888" {...METAL_MAT} />
      </mesh>
      <mesh position={[-0.18, -0.055, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.06, 0.01, 0.015]} />
        <meshStandardMaterial color="#888" {...METAL_MAT} />
      </mesh>
      <mesh position={[0.18, -0.055, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.06, 0.01, 0.015]} />
        <meshStandardMaterial color="#888" {...METAL_MAT} />
      </mesh>
      {/* Jacket body */}
      <mesh geometry={bodyGeom} position={[0, -0.08, -0.03]} castShadow>
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, -0.08, 0.02]}>
        <torusGeometry args={[0.06, 0.018, 10, 18, Math.PI]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      {/* Sleeves — angled cylinders from shoulders */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh
            position={[s * 0.22, -0.22, 0]}
            rotation={[0, 0, s * 0.38]}
            castShadow
          >
            <cylinderGeometry args={[0.065, 0.055, 0.38, 14]} />
            <meshStandardMaterial color={color} {...FABRIC_MAT} />
          </mesh>
          {/* Cuff */}
          <mesh
            position={[s * 0.34, -0.4, 0]}
            rotation={[0, 0, s * 0.38]}
          >
            <cylinderGeometry args={[0.057, 0.057, 0.025, 14]} />
            <meshStandardMaterial color={trim} {...FABRIC_MAT} />
          </mesh>
        </group>
      ))}
      {/* Zipper */}
      <mesh position={[0, -0.28, 0.035]}>
        <boxGeometry args={[0.008, 0.4, 0.003]} />
        <meshStandardMaterial color="#d8d8d8" {...METAL_MAT} />
      </mesh>
      {/* Zipper pull */}
      <mesh position={[0, -0.48, 0.04]}>
        <boxGeometry args={[0.014, 0.022, 0.005]} />
        <meshStandardMaterial color="#888" {...METAL_MAT} />
      </mesh>
      {/* Chest pocket stitching */}
      <mesh position={[0.09, -0.2, 0.033]}>
        <boxGeometry args={[0.08, 0.06, 0.002]} />
        <meshStandardMaterial color={trim} {...FABRIC_MAT} />
      </mesh>
    </group>
  );
}

export function Boot({ id }: { id: string }) {
  const color = pickColor(id, LEATHER);
  const sole = "#0f0f0f";
  const laceColor = "#f0e4c8";
  return (
    <group>
      {/* Outsole (toe-to-heel rubber, lugged profile) */}
      <RoundedBox args={[0.11, 0.035, 0.3]} radius={0.015} smoothness={3} position={[0, 0.018, 0]} castShadow>
        <meshStandardMaterial color={sole} {...RUBBER_MAT} />
      </RoundedBox>
      {/* Midsole (lighter trim) */}
      <RoundedBox args={[0.112, 0.018, 0.3]} radius={0.008} smoothness={3} position={[0, 0.045, 0]}>
        <meshStandardMaterial color="#dcdcdc" {...RUBBER_MAT} />
      </RoundedBox>
      {/* Toe box (rounded front) */}
      <mesh position={[0, 0.075, 0.1]} castShadow>
        <sphereGeometry args={[0.055, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} {...LEATHER_MAT} />
      </mesh>
      {/* Forefoot vamp */}
      <RoundedBox args={[0.1, 0.065, 0.2]} radius={0.025} smoothness={3} position={[0, 0.09, 0.02]} castShadow>
        <meshStandardMaterial color={color} {...LEATHER_MAT} />
      </RoundedBox>
      {/* Heel counter (rising back of boot) */}
      <RoundedBox args={[0.1, 0.14, 0.11]} radius={0.03} smoothness={3} position={[0, 0.12, -0.08]} castShadow>
        <meshStandardMaterial color={color} {...LEATHER_MAT} />
      </RoundedBox>
      {/* Ankle shaft (top cylinder, slightly tapered) */}
      <mesh position={[0, 0.21, -0.06]} castShadow>
        <cylinderGeometry args={[0.055, 0.062, 0.11, 16]} />
        <meshStandardMaterial color={color} {...LEATHER_MAT} />
      </mesh>
      {/* Collar padding */}
      <mesh position={[0, 0.26, -0.06]}>
        <torusGeometry args={[0.055, 0.012, 8, 18]} />
        <meshStandardMaterial color="#2a1a10" {...FABRIC_MAT} />
      </mesh>
      {/* Tongue */}
      <mesh position={[0, 0.16, 0.03]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.06, 0.14, 0.014]} />
        <meshStandardMaterial color="#3a2a1a" {...LEATHER_MAT} />
      </mesh>
      {/* Laces — 4 horizontal bands */}
      {[0.11, 0.15, 0.19, 0.23].map((y, i) => (
        <mesh key={i} position={[0, y, 0.035]}>
          <boxGeometry args={[0.065, 0.006, 0.003]} />
          <meshStandardMaterial color={laceColor} {...FABRIC_MAT} />
        </mesh>
      ))}
      {/* Lace eyelets */}
      {[0.11, 0.15, 0.19, 0.23].flatMap((y, i) =>
        [-0.033, 0.033].map((x) => (
          <mesh key={`${i}-${x}`} position={[x, y, 0.04]}>
            <torusGeometry args={[0.004, 0.0015, 4, 8]} />
            <meshStandardMaterial color="#888" {...METAL_MAT} />
          </mesh>
        )),
      )}
    </group>
  );
}

export function Bottle({ id }: { id: string }) {
  const color = pickColor(id, PLASTIC);
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.048, 0.052, 0.24, 24]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
      {/* Shoulder */}
      <mesh position={[0, 0.245, 0]}>
        <cylinderGeometry args={[0.028, 0.048, 0.025, 24]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.025, 0.028, 0.03, 18]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.295, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.032, 0.022, 20]} />
        <meshStandardMaterial color="#1a1a1a" {...PLASTIC_MAT} />
      </mesh>
      {/* Cap ridges */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.295, 0]}
          rotation={[0, (i * Math.PI) / 6, 0]}
        >
          <boxGeometry args={[0.066, 0.02, 0.003]} />
          <meshStandardMaterial color="#0a0a0a" {...PLASTIC_MAT} />
        </mesh>
      ))}
      {/* Label wrap (full circumference band) */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.053, 0.053, 0.11, 24, 1, true]} />
        <meshStandardMaterial color="#f0e4c8" {...PLASTIC_MAT} side={THREE.DoubleSide} />
      </mesh>
      {/* Label accent stripe */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.0535, 0.0535, 0.012, 24, 1, true]} />
        <meshStandardMaterial color={color} {...PLASTIC_MAT} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Stove({ id: _id }: { id: string }) {
  return (
    <group>
      {/* Fuel canister base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.1, 24]} />
        <meshStandardMaterial color="#b8442a" {...PLASTIC_MAT} />
      </mesh>
      {/* Canister top rim */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.058, 0.055, 0.008, 24]} />
        <meshStandardMaterial color="#8a2a1a" {...METAL_MAT} />
      </mesh>
      {/* Canister label band */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.0565, 0.0565, 0.03, 24, 1, true]} />
        <meshStandardMaterial color="#f0e4c8" {...PLASTIC_MAT} side={THREE.DoubleSide} />
      </mesh>
      {/* Valve stem */}
      <mesh position={[0, 0.115, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.025, 12]} />
        <meshStandardMaterial color="#3a3a3a" {...METAL_MAT} />
      </mesh>
      {/* Valve knob */}
      <mesh position={[0.04, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.02, 10]} />
        <meshStandardMaterial color="#c04830" {...PLASTIC_MAT} />
      </mesh>
      {/* Burner body */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.022, 0.03, 0.025, 16]} />
        <meshStandardMaterial color="#2a2a2a" {...METAL_MAT} />
      </mesh>
      {/* Burner disk (flame head) */}
      <mesh position={[0, 0.155, 0]} castShadow>
        <cylinderGeometry args={[0.048, 0.04, 0.012, 20]} />
        <meshStandardMaterial color="#3a3a3a" {...METAL_MAT} />
      </mesh>
      {/* 3 folding pot supports */}
      {[0, 120, 240].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <group key={deg} rotation={[0, rad, 0]}>
            <mesh position={[0.045, 0.17, 0]} rotation={[0, 0, -0.25]}>
              <boxGeometry args={[0.08, 0.006, 0.008]} />
              <meshStandardMaterial color="#c0c0c0" {...METAL_MAT} />
            </mesh>
            {/* End notch bent up */}
            <mesh position={[0.085, 0.185, 0]} rotation={[0, 0, 0.6]}>
              <boxGeometry args={[0.02, 0.006, 0.008]} />
              <meshStandardMaterial color="#c0c0c0" {...METAL_MAT} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function Pot({ id }: { id: string }) {
  const color = pickColor(id, ["#b8b8b8", "#9a9a9a", "#c8c8c8"]);
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.095, 0.088, 0.12, 24]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      {/* Bottom rim/heat ring */}
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[0.088, 0.088, 0.008, 24]} />
        <meshStandardMaterial color="#6a6a6a" {...METAL_MAT} />
      </mesh>
      {/* Top rim */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.097, 0.097, 0.008, 24]} />
        <meshStandardMaterial color="#6a6a6a" {...METAL_MAT} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.128, 0]} castShadow>
        <cylinderGeometry args={[0.094, 0.092, 0.015, 24]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      {/* Lid knob */}
      <mesh position={[0, 0.144, 0]}>
        <sphereGeometry args={[0.014, 12, 10]} />
        <meshStandardMaterial color="#1a1a1a" {...PLASTIC_MAT} />
      </mesh>
      {/* Two folding handles */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.1, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.024, 0.004, 8, 14, Math.PI]} />
            <meshStandardMaterial color="#1a1a1a" {...PLASTIC_MAT} />
          </mesh>
          {/* Handle hinge */}
          <mesh position={[s * 0.099, 0.08, 0]}>
            <boxGeometry args={[0.006, 0.02, 0.02]} />
            <meshStandardMaterial color="#6a6a6a" {...METAL_MAT} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Ski({ id }: { id: string }) {
  const color = pickColor(id, ["#1a2a4a", "#3a1a4a", "#4a1a1a", "#1a4a3a", "#0a2a2a"]);
  const accent = pickColor(id + "a", ["#e06a3a", "#d4a838", "#4a9a5a", "#e8d8a8"]);
  // Ski profile — shaped with tip curl, waist, tail
  const skiGeom = useMemo(() => {
    const shape = new THREE.Shape();
    // Start at base-left of tail
    shape.moveTo(-0.048, 0);
    shape.lineTo(0.048, 0);
    shape.lineTo(0.05, 0.08); // tail bulge
    shape.lineTo(0.038, 0.8); // taper to waist
    shape.lineTo(0.052, 1.5); // shovel
    shape.quadraticCurveTo(0.02, 1.62, 0.0, 1.6); // tip curl
    shape.quadraticCurveTo(-0.02, 1.62, -0.052, 1.5);
    shape.lineTo(-0.038, 0.8);
    shape.lineTo(-0.05, 0.08);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelSize: 0.004,
      bevelThickness: 0.004,
      bevelSegments: 1,
    });
  }, []);
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.055, 0, 0]} rotation={[0, 0, s * 0.015]}>
          <mesh geometry={skiGeom} castShadow>
            <meshStandardMaterial color={color} {...PLASTIC_MAT} />
          </mesh>
          {/* Graphic stripe */}
          <mesh position={[0, 0.8, 0.019]}>
            <boxGeometry args={[0.02, 1.2, 0.001]} />
            <meshStandardMaterial color={accent} {...PLASTIC_MAT} />
          </mesh>
          {/* Binding toe piece */}
          <mesh position={[0, 0.64, 0.019]} castShadow>
            <boxGeometry args={[0.07, 0.05, 0.035]} />
            <meshStandardMaterial color="#111" {...PLASTIC_MAT} />
          </mesh>
          {/* Binding heel piece */}
          <mesh position={[0, 0.82, 0.019]} castShadow>
            <boxGeometry args={[0.07, 0.06, 0.045]} />
            <meshStandardMaterial color="#111" {...PLASTIC_MAT} />
          </mesh>
          {/* Brake arms */}
          <mesh position={[s * 0.045, 0.82, 0.02]}>
            <boxGeometry args={[0.012, 0.03, 0.01]} />
            <meshStandardMaterial color="#c04830" {...PLASTIC_MAT} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Paddle({ id }: { id: string }) {
  const color = pickColor(id, ["#e06a3a", "#3a88b8", "#4a9a5a", "#d4a838"]);
  // Blade via teardrop shape
  const bladeGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.09, 0.08, 0.075, 0.22);
    shape.quadraticCurveTo(0, 0.3, -0.075, 0.22);
    shape.quadraticCurveTo(-0.09, 0.08, 0, 0);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.012,
      bevelEnabled: true,
      bevelSize: 0.003,
      bevelThickness: 0.003,
      bevelSegments: 1,
    });
  }, []);
  return (
    <group>
      {/* Shaft */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 1.4, 14]} />
        <meshStandardMaterial color="#1a1a1a" {...METAL_MAT} />
      </mesh>
      {/* Grip */}
      <mesh position={[0, 1.36, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
        <meshStandardMaterial color="#e8d8a8" {...FABRIC_MAT} />
      </mesh>
      {/* Lower blade */}
      <mesh geometry={bladeGeom} position={[0, 0, -0.006]} rotation={[0, 0, Math.PI]} castShadow>
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
      {/* Upper blade (flipped) */}
      <mesh geometry={bladeGeom} position={[0, 1.4, -0.006]} castShadow>
        <meshStandardMaterial color={color} {...PLASTIC_MAT} />
      </mesh>
    </group>
  );
}

export function Bike({ id }: { id: string }) {
  const color = pickColor(id, ["#1a4a7a", "#4a1a1a", "#111", "#4a2a1a", "#2a5a3a"]);
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      {/* Wheels */}
      {[-0.4, 0.4].map((x) => (
        <group key={x} position={[x, 0.32, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.3, 0.028, 12, 32]} />
            <meshStandardMaterial color="#0a0a0a" {...RUBBER_MAT} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.27, 0.012, 8, 24]} />
            <meshStandardMaterial color="#888" {...METAL_MAT} />
          </mesh>
          {/* Spokes */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={i}
              rotation={[0, 0, (i * Math.PI) / 4]}
            >
              <cylinderGeometry args={[0.002, 0.002, 0.54, 4]} />
              <meshStandardMaterial color="#cccccc" {...METAL_MAT} />
            </mesh>
          ))}
          {/* Hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
            <meshStandardMaterial color="#333" {...METAL_MAT} />
          </mesh>
        </group>
      ))}
      {/* Top tube */}
      <mesh position={[-0.02, 0.55, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.6, 10]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      {/* Down tube */}
      <mesh position={[-0.02, 0.4, 0]} rotation={[0, 0, 1.0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 10]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      {/* Seat tube */}
      <mesh position={[-0.15, 0.45, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.018, 0.018, 0.5, 10]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      {/* Chainstays */}
      <mesh position={[-0.27, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 8]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      {/* Seat stays */}
      <mesh position={[-0.27, 0.48, 0]} rotation={[0, 0, 0.55]}>
        <cylinderGeometry args={[0.012, 0.012, 0.36, 8]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      {/* Fork */}
      <mesh position={[0.3, 0.52, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      {/* Head tube */}
      <mesh position={[0.28, 0.66, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 10]} />
        <meshStandardMaterial color={color} {...METAL_MAT} />
      </mesh>
      {/* Seat */}
      <mesh position={[-0.18, 0.76, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.14, 0.025, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" {...LEATHER_MAT} />
      </mesh>
      {/* Seatpost */}
      <mesh position={[-0.155, 0.7, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
        <meshStandardMaterial color="#555" {...METAL_MAT} />
      </mesh>
      {/* Stem */}
      <mesh position={[0.31, 0.72, 0]}>
        <boxGeometry args={[0.08, 0.022, 0.025]} />
        <meshStandardMaterial color="#333" {...METAL_MAT} />
      </mesh>
      {/* Handlebar */}
      <mesh position={[0.35, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 10]} />
        <meshStandardMaterial color="#222" {...METAL_MAT} />
      </mesh>
      {/* Grips */}
      {[-0.13, 0.13].map((z) => (
        <mesh key={z} position={[0.35, 0.72, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.06, 10]} />
          <meshStandardMaterial color="#0a0a0a" {...RUBBER_MAT} />
        </mesh>
      ))}
      {/* Pedals crank */}
      <mesh position={[-0.02, 0.32, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 12]} />
        <meshStandardMaterial color="#555" {...METAL_MAT} />
      </mesh>
    </group>
  );
}

export function RopeCoil({ id }: { id: string }) {
  const color = pickColor(id, ["#d4a838", "#e06a3a", "#4a9a5a", "#3a88b8", "#c84030"]);
  // Helix wound into a coiled rope via tube along a CatmullRomCurve
  const tubeGeom = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const turns = 4;
    const radius = 0.1;
    const height = 0.08;
    for (let i = 0; i <= turns * 32; i++) {
      const t = i / 32;
      const angle = t * Math.PI * 2;
      const r = radius + 0.005 * Math.sin(t * 4); // slight wobble
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * r,
          (t / turns) * height - height / 2 + 0.03,
          Math.sin(angle) * r,
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
    return new THREE.TubeGeometry(curve, 256, 0.012, 10, false);
  }, []);
  return (
    <group>
      {/* Coiled rope */}
      <mesh geometry={tubeGeom} castShadow>
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      {/* Tie strap */}
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.005, 6, 20]} />
        <meshStandardMaterial color="#0a0a0a" {...FABRIC_MAT} />
      </mesh>
    </group>
  );
}

export function Hat({ id }: { id: string }) {
  const color = pickColor(id, FABRIC);
  return (
    <group>
      {/* Crown */}
      <mesh castShadow>
        <sphereGeometry args={[0.085, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      {/* Crown seam ring */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.085, 0.004, 6, 22]} />
        <meshStandardMaterial color="#2a2a2a" {...FABRIC_MAT} />
      </mesh>
      {/* Brim */}
      <mesh position={[0, -0.002, 0]} rotation={[-0.05, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.008, 26]} />
        <meshStandardMaterial color={color} {...FABRIC_MAT} />
      </mesh>
      {/* Band */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.086, 0.086, 0.018, 26, 1, true]} />
        <meshStandardMaterial color="#2a2a2a" {...FABRIC_MAT} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Headlamp({ id: _id }: { id: string }) {
  return (
    <group>
      {/* Headband */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.08, 0.01, 10, 24]} />
        <meshStandardMaterial color="#1a1a1a" {...FABRIC_MAT} />
      </mesh>
      {/* Lamp housing */}
      <mesh position={[0, 0, 0.08]} castShadow>
        <boxGeometry args={[0.06, 0.042, 0.035]} />
        <meshStandardMaterial color="#2a2a2a" {...PLASTIC_MAT} />
      </mesh>
      {/* LED lens */}
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.018, 0.018, 0.006, 16]} />
        <meshStandardMaterial
          color="#fff5c8"
          emissive="#ffd08a"
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Side adjuster */}
      <mesh position={[0.032, 0, 0.08]}>
        <cylinderGeometry args={[0.005, 0.005, 0.01, 8]} />
        <meshStandardMaterial color="#ff6a3a" {...PLASTIC_MAT} />
      </mesh>
    </group>
  );
}

export function Knife({ id: _id }: { id: string }) {
  return (
    <group>
      {/* Handle */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.03, 0.085, 0.014]} />
        <meshStandardMaterial color="#5a3a1a" {...LEATHER_MAT} />
      </mesh>
      {/* Handle rivets */}
      {[-0.022, 0.022].map((y) => (
        <mesh key={y} position={[0, y, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.002, 8]} />
          <meshStandardMaterial color="#aaa" {...METAL_MAT} />
        </mesh>
      ))}
      {/* Guard */}
      <mesh position={[0, 0.045, 0]}>
        <boxGeometry args={[0.04, 0.008, 0.018]} />
        <meshStandardMaterial color="#666" {...METAL_MAT} />
      </mesh>
      {/* Blade (tapered) */}
      <mesh position={[0, 0.095, 0]} castShadow>
        <coneGeometry args={[0.013, 0.1, 4]} />
        <meshStandardMaterial color="#dcdcdc" {...METAL_MAT} />
      </mesh>
      {/* Pommel */}
      <mesh position={[0, -0.048, 0]}>
        <boxGeometry args={[0.032, 0.01, 0.016]} />
        <meshStandardMaterial color="#666" {...METAL_MAT} />
      </mesh>
    </group>
  );
}

export function FoodCan({ id }: { id: string }) {
  const body = pickColor(id, ["#d4a838", "#4a6b45", "#3a88b8", "#b8553a"]);
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.108, 0.108, 0.22, 28]} />
        <meshStandardMaterial color={body} {...PLASTIC_MAT} />
      </mesh>
      {/* Top screw-on lid */}
      <mesh position={[0, 0.23, 0]} castShadow>
        <cylinderGeometry args={[0.112, 0.11, 0.028, 28]} />
        <meshStandardMaterial color="#1a1a1a" {...PLASTIC_MAT} />
      </mesh>
      {/* Lid threads */}
      {[0.222, 0.236].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.113, 0.002, 5, 28]} />
          <meshStandardMaterial color="#0a0a0a" {...PLASTIC_MAT} />
        </mesh>
      ))}
      {/* Bottom rim */}
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.012, 28]} />
        <meshStandardMaterial color="#0a0a0a" {...PLASTIC_MAT} />
      </mesh>
      {/* Label wrap */}
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.109, 0.109, 0.12, 28, 1, true]} />
        <meshStandardMaterial color="#f0e4c8" {...PLASTIC_MAT} side={THREE.DoubleSide} />
      </mesh>
      {/* Label stripe */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.1095, 0.1095, 0.018, 28, 1, true]} />
        <meshStandardMaterial color={body} {...PLASTIC_MAT} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Lantern({ id: _id }: { id: string }) {
  return (
    <group>
      {/* Base plate */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 20]} />
        <meshStandardMaterial color="#444" {...METAL_MAT} />
      </mesh>
      {/* Fuel tank */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.06, 20]} />
        <meshStandardMaterial color="#b84020" {...METAL_MAT} />
      </mesh>
      {/* Glass globe */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.14, 20]} />
        <meshStandardMaterial
          color="#ffd88a"
          emissive="#ffb050"
          emissiveIntensity={0.7}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Globe vertical wires */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[0, 0.17, 0]}
          rotation={[0, (i * Math.PI) / 2, 0]}
        >
          <cylinderGeometry args={[0.002, 0.002, 0.14, 4]} />
          <meshStandardMaterial color="#222" {...METAL_MAT} />
        </mesh>
      ))}
      {/* Top cap */}
      <mesh position={[0, 0.255, 0]}>
        <cylinderGeometry args={[0.055, 0.04, 0.028, 20]} />
        <meshStandardMaterial color="#444" {...METAL_MAT} />
      </mesh>
      {/* Vent holes suggestion */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.014, 16]} />
        <meshStandardMaterial color="#222" {...METAL_MAT} />
      </mesh>
      {/* Bail handle */}
      <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.004, 6, 14, Math.PI]} />
        <meshStandardMaterial color="#666" {...METAL_MAT} />
      </mesh>
    </group>
  );
}

export function Block({ id }: { id: string }) {
  const color = pickColor(id, FABRIC);
  return (
    <RoundedBox args={[0.22, 0.17, 0.15]} radius={0.025} smoothness={3} position={[0, 0.085, 0]} castShadow>
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
  pack: 0.6,
  tent: 0.55,
  sleeping_bag: 0.28,
  jacket: 0.52,
  boot: 0.28,
  bottle: 0.31,
  stove: 0.2,
  pot: 0.15,
  ski: 1.62,
  paddle: 1.4,
  bike: 0.8,
  rope: 0.1,
  hat: 0.1,
  headlamp: 0.12,
  knife: 0.18,
  food_can: 0.24,
  lantern: 0.32,
  block: 0.17,
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

// keep METAL referenced to avoid unused import warning in some toolchains
void METAL;
