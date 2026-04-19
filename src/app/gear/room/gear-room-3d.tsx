"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { ArrowLeft, Backpack, Box, Maximize, Scale } from "lucide-react";
import {
  GearMesh,
  HANGING,
  resolveSpecies,
  resolveZone3D,
  seededOffset,
  SPECIES_HEIGHT,
  type Zone3D,
} from "./gear-models-3d";
import type { GearItemRow } from "../gear-client";

/* ═══════════════════════════════════════════════════════════
   Room dimensions
   ═══════════════════════════════════════════════════════════ */

const ROOM = {
  w: 10, // x: -5..5
  d: 6, // z: -3..3
  h: 3.2,
} as const;

/* ═══════════════════════════════════════════════════════════
   Room shell — walls, floor, ceiling hint
   ═══════════════════════════════════════════════════════════ */

function RoomShell() {
  return (
    <group>
      {/* Floor — warm wood planks via procedural stripes */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color="#5a3f28" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Plank seams */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-5 + i * 1.0, 0.001, 0]}
        >
          <planeGeometry args={[0.03, ROOM.d]} />
          <meshStandardMaterial color="#3a2818" roughness={1} />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, ROOM.h / 2, -ROOM.d / 2]} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.h]} />
        <meshStandardMaterial color="#d8cab0" roughness={0.95} />
      </mesh>
      {/* Back wall baseboard */}
      <mesh position={[0, 0.08, -ROOM.d / 2 + 0.01]}>
        <boxGeometry args={[ROOM.w, 0.16, 0.02]} />
        <meshStandardMaterial color="#3a2818" roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-ROOM.w / 2, ROOM.h / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM.d, ROOM.h]} />
        <meshStandardMaterial color="#c9bc9f" roughness={0.95} />
      </mesh>

      {/* Right wall */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[ROOM.w / 2, ROOM.h / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM.d, ROOM.h]} />
        <meshStandardMaterial color="#c9bc9f" roughness={0.95} />
      </mesh>

      {/* Ceiling hint (top band shadow) */}
      <mesh position={[0, ROOM.h - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color="#3a2818" transparent opacity={0.6} />
      </mesh>

      {/* Window cut-out (left wall) with warm glow plane */}
      <mesh
        position={[-ROOM.w / 2 + 0.01, 1.9, -1.4]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[1.4, 1.0]} />
        <meshStandardMaterial
          color="#ffe8b0"
          emissive="#ffd080"
          emissiveIntensity={0.9}
        />
      </mesh>
      {/* Window frame cross */}
      <mesh
        position={[-ROOM.w / 2 + 0.015, 1.9, -1.4]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[0.02, 1.0, 0.02]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
      <mesh
        position={[-ROOM.w / 2 + 0.015, 1.9, -1.4]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[1.4, 0.02, 0.02]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   Furniture — pegboard, shelves, rail, workbench, hooks
   ═══════════════════════════════════════════════════════════ */

function Pegboard() {
  // Spans back wall upper area
  const holes: Array<[number, number]> = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 12; c++) {
      holes.push([-2.75 + c * 0.25, 1.4 + r * 0.2]);
    }
  }
  return (
    <group position={[0, 0, -ROOM.d / 2 + 0.02]}>
      <mesh>
        <planeGeometry args={[6.2, 1.7]} />
        <meshStandardMaterial color="#d89a4a" roughness={0.85} />
      </mesh>
      {/* Holes */}
      {holes.map(([x, y], i) => (
        <mesh key={i} position={[x, y - 2.07, 0.002]}>
          <circleGeometry args={[0.028, 10]} />
          <meshStandardMaterial color="#3a2818" />
        </mesh>
      ))}
      {/* Frame */}
      <mesh position={[0, 0.87, 0.01]}>
        <boxGeometry args={[6.3, 0.05, 0.01]} />
        <meshStandardMaterial color="#3a2818" />
      </mesh>
      <mesh position={[0, -0.87, 0.01]}>
        <boxGeometry args={[6.3, 0.05, 0.01]} />
        <meshStandardMaterial color="#3a2818" />
      </mesh>
    </group>
  );
}

function ShelfUnit() {
  // Right side of back wall
  const cx = 4.0;
  const cz = -ROOM.d / 2 + 0.25;
  const shelfYs = [0.9, 1.55, 2.2];
  return (
    <group position={[cx, 0, cz]}>
      {/* Side posts */}
      <mesh position={[-0.9, 1.5, 0]}>
        <boxGeometry args={[0.06, 2.4, 0.36]} />
        <meshStandardMaterial color="#3a2818" roughness={0.85} />
      </mesh>
      <mesh position={[0.9, 1.5, 0]}>
        <boxGeometry args={[0.06, 2.4, 0.36]} />
        <meshStandardMaterial color="#3a2818" roughness={0.85} />
      </mesh>
      {/* Shelves */}
      {shelfYs.map((y, i) => (
        <mesh key={i} position={[0, y, 0]} receiveShadow>
          <boxGeometry args={[1.85, 0.03, 0.4]} />
          <meshStandardMaterial color="#6a4a28" roughness={0.85} />
        </mesh>
      ))}
      {/* Top */}
      <mesh position={[0, 2.7, 0]}>
        <boxGeometry args={[1.95, 0.04, 0.42]} />
        <meshStandardMaterial color="#3a2818" />
      </mesh>
    </group>
  );
}

function WardrobeRail() {
  // Left side of back wall: a horizontal bar at y=2.2
  const x0 = -4;
  const x1 = -2.0;
  const midX = (x0 + x1) / 2;
  const len = x1 - x0;
  return (
    <group position={[midX, 0, -ROOM.d / 2 + 0.45]}>
      {/* Back brackets */}
      <mesh position={[-len / 2, 2.2, -0.3]}>
        <boxGeometry args={[0.04, 0.1, 0.3]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[len / 2, 2.2, -0.3]}>
        <boxGeometry args={[0.04, 0.1, 0.3]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Rail */}
      <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, len, 12]} />
        <meshStandardMaterial color="#9a9a9a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Shelf above */}
      <mesh position={[0, 2.55, -0.1]}>
        <boxGeometry args={[len + 0.3, 0.03, 0.42]} />
        <meshStandardMaterial color="#6a4a28" />
      </mesh>
    </group>
  );
}

function PackHookRail() {
  // Left wall — vertical plank with hooks
  const x = -ROOM.w / 2 + 0.06;
  return (
    <group position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[4.0, 0.15, 0.04]} />
        <meshStandardMaterial color="#3a2818" roughness={0.85} />
      </mesh>
      {/* Hooks */}
      {[-1.5, -0.5, 0.5, 1.5].map((zOff) => (
        <mesh key={zOff} position={[zOff, 2.14, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.16, 8]} />
          <meshStandardMaterial color="#777" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function RightRack() {
  // Right wall — vertical rack for skis/paddles, plus floor for bike
  const x = ROOM.w / 2 - 0.05;
  return (
    <group position={[x, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Vertical plank */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[3.5, 0.08, 0.03]} />
        <meshStandardMaterial color="#3a2818" roughness={0.85} />
      </mesh>
      {/* Upper rail */}
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[3.5, 0.08, 0.03]} />
        <meshStandardMaterial color="#3a2818" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Workbench() {
  return (
    <group position={[2.6, 0, 2.2]}>
      {/* Legs */}
      {[
        [-0.55, -0.25],
        [0.55, -0.25],
        [-0.55, 0.25],
        [0.55, 0.25],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.38, z]}>
          <boxGeometry args={[0.06, 0.76, 0.06]} />
          <meshStandardMaterial color="#3a2818" />
        </mesh>
      ))}
      {/* Top */}
      <mesh position={[0, 0.78, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.3, 0.04, 0.7]} />
        <meshStandardMaterial color="#6a4a28" roughness={0.85} />
      </mesh>
    </group>
  );
}

function ShoeMat() {
  return (
    <mesh position={[-1.5, 0.005, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.2, 0.7]} />
      <meshStandardMaterial color="#2a1e12" roughness={1} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   Item placement — maps each item to a world transform
   ═══════════════════════════════════════════════════════════ */

type Placement = {
  item: GearItemRow;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

function layoutItems(items: GearItemRow[]): Placement[] {
  const byZone = new Map<Zone3D, GearItemRow[]>();
  for (const it of items) {
    const z = resolveZone3D(it);
    if (!byZone.has(z)) byZone.set(z, []);
    byZone.get(z)!.push(it);
  }

  const placements: Placement[] = [];
  const zBack = -ROOM.d / 2 + 0.05;

  // ── Pegboard: grid on back wall upper area ──
  {
    const list = byZone.get("pegboard") ?? [];
    const cols = 8;
    list.slice(0, 24).forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = -2.6 + col * 0.7 + seededOffset(item.id, 1, 0.08);
      const y = 2.3 - row * 0.45 + seededOffset(item.id, 2, 0.04);
      placements.push({
        item,
        position: [x, y, zBack + 0.1],
        rotation: [0, 0, 0],
        scale: 1,
      });
    });
  }

  // ── Wardrobe: row of hangers on rail ──
  {
    const list = byZone.get("wardrobe") ?? [];
    list.slice(0, 8).forEach((item, i) => {
      const x = -3.8 + i * 0.32;
      placements.push({
        item,
        position: [x, 2.2, zBack + 0.5],
        rotation: [0, seededOffset(item.id, 3, 0.15), 0],
        scale: 1,
      });
    });
  }

  // ── Pack wall: left wall hooks ──
  {
    const list = byZone.get("pack_wall") ?? [];
    list.slice(0, 4).forEach((item, i) => {
      const z = -1.5 + i * 1;
      placements.push({
        item,
        position: [-ROOM.w / 2 + 0.3, 2.1, z],
        rotation: [0, Math.PI / 2, 0],
        scale: 1,
      });
    });
  }

  // ── Shelf: 3 shelves × up to 4 wide ──
  {
    const list = byZone.get("shelf") ?? [];
    const shelfYs = [0.93, 1.58, 2.23];
    list.slice(0, 12).forEach((item, i) => {
      const shelf = Math.floor(i / 4);
      const col = i % 4;
      const y = shelfYs[Math.min(shelf, shelfYs.length - 1)];
      const x = 3.25 + col * 0.4;
      placements.push({
        item,
        position: [x, y, -ROOM.d / 2 + 0.3],
        rotation: [0, seededOffset(item.id, 4, 0.3), 0],
        scale: 1,
      });
    });
  }

  // ── Floor rack (right wall): skis/paddles/bikes ──
  {
    const list = byZone.get("floor_rack") ?? [];
    list.slice(0, 6).forEach((item, i) => {
      const sp = resolveSpecies(item);
      if (sp === "bike") {
        placements.push({
          item,
          position: [ROOM.w / 2 - 0.8, 0, 1 + i * 0.9],
          rotation: [0, 0, 0],
          scale: 1,
        });
      } else {
        const z = -1.8 + i * 0.45;
        placements.push({
          item,
          position: [ROOM.w / 2 - 0.25, 0, z],
          rotation: [0, 0, seededOffset(item.id, 5, 0.12)],
          scale: 1,
        });
      }
    });
  }

  // ── Sleep corner: sleeping bags on floor ──
  {
    const list = byZone.get("sleep_corner") ?? [];
    list.slice(0, 4).forEach((item, i) => {
      placements.push({
        item,
        position: [-3.5 + i * 0.6, 0, -1.5 + seededOffset(item.id, 6, 0.2)],
        rotation: [0, seededOffset(item.id, 7, 0.3), 0],
        scale: 1,
      });
    });
  }

  // ── Tent floor: pitched tents back-left ──
  {
    const list = byZone.get("tent_floor") ?? [];
    list.slice(0, 3).forEach((item, i) => {
      placements.push({
        item,
        position: [-3.0 + i * 1.3, 0, -0.4],
        rotation: [0, seededOffset(item.id, 8, 0.5), 0],
        scale: 1,
      });
    });
  }

  // ── Shoe row: floor front ──
  {
    const list = byZone.get("shoe_row") ?? [];
    list.slice(0, 10).forEach((item, i) => {
      const x = -3 + i * 0.3;
      placements.push({
        item,
        position: [x, 0, 1.8 + seededOffset(item.id, 9, 0.1)],
        rotation: [0, seededOffset(item.id, 10, 0.35), 0],
        scale: 1,
      });
    });
  }

  // ── Workbench catch-all ──
  {
    const list = byZone.get("workbench") ?? [];
    list.slice(0, 6).forEach((item, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      placements.push({
        item,
        position: [2.15 + col * 0.45, 0.82, 2.0 + row * 0.25],
        rotation: [0, seededOffset(item.id, 11, 0.5), 0],
        scale: 0.85,
      });
    });
  }

  return placements;
}

/* ═══════════════════════════════════════════════════════════
   Interactive item wrapper — hover lift + tooltip + click
   ═══════════════════════════════════════════════════════════ */

function ItemInstance({
  placement,
  onHover,
  onClick,
  hovered,
}: {
  placement: Placement;
  onHover: (id: string | null) => void;
  onClick: () => void;
  hovered: boolean;
}) {
  const ref = useRef<Group>(null);
  const species = useMemo(
    () => resolveSpecies(placement.item),
    [placement.item],
  );
  const isHanging = HANGING.has(species);

  // Hanging items: anchor is at top (hook). Convert placement.position as the anchor.
  // Standing items: position.y should be the base; already handled in layout.
  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = hovered ? 1.18 : 1;
    const cur = ref.current.scale.x;
    const next = cur + (target - cur) * Math.min(1, dt * 10);
    ref.current.scale.setScalar(next);

    if (isHanging) {
      // Gentle sway
      const t = performance.now() / 1000;
      const swayBase =
        Math.sin(t * 0.8 + (placement.item.id.length % 7)) * 0.03;
      ref.current.rotation.z = hovered ? swayBase * 2 : swayBase;
    }
  });

  return (
    <group
      ref={ref}
      position={placement.position}
      rotation={placement.rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(placement.item.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <GearMesh species={species} id={placement.item.id} />
      {hovered ? (
        <Html
          position={[0, isHanging ? -0.55 : SPECIES_HEIGHT[species] + 0.15, 0]}
          center
          distanceFactor={8}
          zIndexRange={[100, 0]}
          occlude={false}
          style={{ pointerEvents: "none" }}
        >
          <div className="pointer-events-none whitespace-nowrap rounded-lg border border-g-border bg-g-card/95 px-2.5 py-1.5 text-[11px] text-g-text shadow-xl backdrop-blur">
            <div className="font-semibold">{placement.item.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-g-text-3">
              {placement.item.brand ? <span>{placement.item.brand}</span> : null}
              {placement.item.weight != null ? (
                <span>· {placement.item.weight} kg</span>
              ) : null}
              {placement.item.price != null ? (
                <span className="text-emerald-400">· ${placement.item.price}</span>
              ) : null}
            </div>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   Subtle ambient animation — floating dust motes
   ═══════════════════════════════════════════════════════════ */

function Dust() {
  const ref = useRef<Group>(null);
  const motes = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        x: (Math.sin(i * 17.3) + 1) * 4 - 4,
        y: 0.5 + Math.sin(i * 5.7 + 1) * 1.2,
        z: (Math.cos(i * 11.1) + 1) * 2.5 - 2.5,
        phase: i * 0.37,
      })),
    [],
  );
  useFrame(() => {
    if (!ref.current) return;
    const t = performance.now() / 1000;
    ref.current.children.forEach((c, i) => {
      c.position.y = motes[i].y + Math.sin(t * 0.3 + motes[i].phase) * 0.3;
      c.position.x = motes[i].x + Math.cos(t * 0.2 + motes[i].phase) * 0.15;
    });
  });
  return (
    <group ref={ref}>
      {motes.map((m, i) => (
        <mesh key={i} position={[m.x, m.y, m.z]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshBasicMaterial color="#ffe6a8" transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   Scene composition
   ═══════════════════════════════════════════════════════════ */

function Scene({
  items,
  hoveredId,
  setHoveredId,
  onSelectItem,
}: {
  items: GearItemRow[];
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onSelectItem: (item: GearItemRow) => void;
}) {
  const placements = useMemo(() => layoutItems(items), [items]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.55} color="#fff1d6" />
      <hemisphereLight args={["#ffe8b8", "#3a2818", 0.4]} />
      <directionalLight
        position={[-6, 8, 4]}
        intensity={1.3}
        color="#ffe0a8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <pointLight position={[0, 2.9, 0]} intensity={0.35} color="#ffc878" distance={8} decay={2} />

      <RoomShell />
      <Pegboard />
      <ShelfUnit />
      <WardrobeRail />
      <PackHookRail />
      <RightRack />
      <Workbench />
      <ShoeMat />
      <Dust />

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.45}
        scale={12}
        blur={2.4}
        far={4}
        color="#000"
      />

      {placements.map((p) => (
        <ItemInstance
          key={p.item.id}
          placement={p}
          hovered={hoveredId === p.item.id}
          onHover={setHoveredId}
          onClick={() => onSelectItem(p.item)}
        />
      ))}

      <Environment preset="sunset" background={false} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Camera preset chips
   ═══════════════════════════════════════════════════════════ */

type CamPreset = { label: string; pos: [number, number, number]; target: [number, number, number] };
const PRESETS: CamPreset[] = [
  { label: "Overview", pos: [6, 3.4, 6.5], target: [0, 1.4, -0.5] },
  { label: "Pegboard", pos: [0.5, 2.2, 1.5], target: [-0.5, 1.9, -3] },
  { label: "Pack wall", pos: [0, 2.2, 2], target: [-5, 2.1, 0] },
  { label: "Shelves", pos: [2, 2, 2.8], target: [4, 1.5, -3] },
  { label: "Floor", pos: [2.5, 1.2, 3.5], target: [0, 0.3, 0] },
];

function CameraController({
  preset,
}: {
  preset: CamPreset;
}) {
  const { camera } = useThree();
  const targetPos = useRef<[number, number, number]>(preset.pos);
  targetPos.current = preset.pos;
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 2.4);
    camera.position.x += (preset.pos[0] - camera.position.x) * k;
    camera.position.y += (preset.pos[1] - camera.position.y) * k;
    camera.position.z += (preset.pos[2] - camera.position.z) * k;
  });
  return null;
}

/* ═══════════════════════════════════════════════════════════
   Main export
   ═══════════════════════════════════════════════════════════ */

type Props = {
  items: GearItemRow[];
  onSelectItem: (item: GearItemRow) => void;
};

export function GearRoom3D({ items, onSelectItem }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [presetIdx, setPresetIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const preset = PRESETS[presetIdx];

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-g-border bg-g-card">
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-g-raised">
            <Backpack size={32} className="text-g-text-3" />
          </div>
          <p className="font-medium text-g-text-2">Your gear room is empty</p>
          <p className="mt-1 text-sm text-g-text-3">Add gear to see it materialise on the shelves.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-g-border ${
        expanded ? "fixed inset-2 z-50 h-auto" : "h-[620px]"
      }`}
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 20%, oklch(0.30 0.04 60 / 0.4), oklch(0.14 0.01 60))",
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.8]}
        camera={{ position: preset.pos, fov: 42, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#1a140e"]} />
        <fog attach="fog" args={["#1a140e", 14, 30]} />
        <Suspense fallback={null}>
          <CameraController preset={preset} />
          <Scene
            items={items}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            onSelectItem={onSelectItem}
          />
          <OrbitControls
            makeDefault
            enablePan
            enableDamping
            dampingFactor={0.08}
            minDistance={2.5}
            maxDistance={14}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2 - 0.08}
            target={preset.target}
          />
        </Suspense>
      </Canvas>

      {/* HUD — preset chips */}
      <div className="pointer-events-none absolute inset-x-0 top-3 flex flex-wrap items-center justify-center gap-1.5 px-4">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setPresetIdx(i)}
            className={`pointer-events-auto rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur transition-all ${
              i === presetIdx
                ? "border-g-border-active bg-g-accent-surface text-g-accent"
                : "border-g-border/60 bg-black/30 text-g-text-3 hover:text-g-text"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* HUD — corner meta */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-g-border/60 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-g-text-3 backdrop-blur">
        <Box size={10} />
        <span>Gear Room · {items.length} items</span>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="pointer-events-auto absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-g-border/60 bg-black/40 text-g-text-3 backdrop-blur transition hover:text-g-text"
        aria-label={expanded ? "Close" : "Expand"}
      >
        {expanded ? <ArrowLeft size={14} /> : <Maximize size={14} />}
      </button>

      {/* HUD — bottom-left instruction */}
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-g-border/60 bg-black/40 px-3 py-1 text-[10px] text-g-text-3 backdrop-blur">
        <Scale size={10} />
        Drag to orbit · scroll to zoom · click an item
      </div>
    </div>
  );
}

