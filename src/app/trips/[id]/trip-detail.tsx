"use client";

import {
  DndContext,
  DragOverlay,
  pointerWithin,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  GripVertical,
  Loader2,
  Package,
  Scale,
  Target,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getGearIcon } from "@/app/gear/gear-icons";
import {
  addItemToTrip,
  removeItemFromTrip,
  togglePacked,
} from "../actions";
import { GearPool } from "./gear-pool";
import { TripBag } from "./trip-bag";

export type TripItemData = {
  tripItemId: string;
  gearItemId: string;
  packed: boolean;
  sortOrder: number;
  name: string;
  brand: string | null;
  model: string | null;
  condition: string | null;
  weight: number | null;
  categoryName: string | null;
};

export type GearPoolItem = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  condition: string | null;
  weight: number | null;
  tags: string[];
  categoryName: string | null;
  wishlist: boolean;
};

type TripDetailProps = {
  trip: {
    id: string;
    name: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    target_weight_kg: number | null;
  };
  tripItems: TripItemData[];
  allGear: GearPoolItem[];
};

export function TripDetail({ trip, tripItems, allGear }: TripDetailProps) {
  const router = useRouter();
  const [items, setItems] = useState(tripItems);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // IDs already in trip
  const inTripIds = useMemo(
    () => new Set(items.map((i) => i.gearItemId)),
    [items],
  );

  // Available gear (not yet in trip)
  const availableGear = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allGear.filter((g) => {
      if (inTripIds.has(g.id)) return false;
      if (q && !`${g.name} ${g.brand ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [allGear, inTripIds, search]);

  // Weight stats
  const totalWeight = useMemo(
    () => items.reduce((s, i) => s + (i.weight ?? 0), 0),
    [items],
  );
  const packedWeight = useMemo(
    () => items.filter((i) => i.packed).reduce((s, i) => s + (i.weight ?? 0), 0),
    [items],
  );
  const packedCount = items.filter((i) => i.packed).length;
  const overWeight =
    trip.target_weight_kg != null && totalWeight > trip.target_weight_kg;

  // Drag from pool to bag
  async function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = event;
    if (!over) return;

    const gearItemId = active.id as string;
    if (over.id === "trip-bag" && !inTripIds.has(gearItemId)) {
      await handleAddItem(gearItemId);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(event.active.id as string);
  }

  async function handleAddItem(gearItemId: string) {
    setAdding(gearItemId);
    const result = await addItemToTrip(trip.id, gearItemId);
    setAdding(null);
    if (result.ok) {
      router.refresh();
      // Optimistic: add to local state
      const gear = allGear.find((g) => g.id === gearItemId);
      if (gear) {
        setItems((prev) => [
          ...prev,
          {
            tripItemId: `temp-${Date.now()}`,
            gearItemId: gear.id,
            packed: false,
            sortOrder: prev.length,
            name: gear.name,
            brand: gear.brand,
            model: gear.model,
            condition: gear.condition,
            weight: gear.weight,
            categoryName: gear.categoryName,
          },
        ]);
      }
    }
  }

  async function handleRemoveItem(gearItemId: string) {
    setItems((prev) => prev.filter((i) => i.gearItemId !== gearItemId));
    await removeItemFromTrip(trip.id, gearItemId);
    router.refresh();
  }

  async function handleTogglePacked(tripItemId: string, packed: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.tripItemId === tripItemId ? { ...i, packed } : i)),
    );
    await togglePacked(tripItemId, packed);
  }

  const draggingItem = draggingId
    ? allGear.find((g) => g.id === draggingId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/trips"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-stone-800/60 text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-100">
                {trip.name}
              </h1>
              {trip.description ? (
                <p className="text-sm text-stone-500">{trip.description}</p>
              ) : null}
            </div>
          </div>
          {trip.start_date ? (
            <p className="text-sm text-stone-500">
              {trip.start_date}
              {trip.end_date ? ` → ${trip.end_date}` : ""}
            </p>
          ) : null}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-stone-900/60 px-4 py-3">
            <Package size={18} className="text-amber-400" />
            <div>
              <p className="text-xl font-semibold text-stone-100">
                {items.length}
              </p>
              <p className="text-xs text-stone-500">Items</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-stone-900/60 px-4 py-3">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <div>
              <p className="text-xl font-semibold text-stone-100">
                {packedCount}/{items.length}
              </p>
              <p className="text-xs text-stone-500">Packed</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              overWeight
                ? "border-red-500/20 bg-red-500/[0.07]"
                : "border-white/[0.06] bg-stone-900/60"
            }`}
          >
            <Scale
              size={18}
              className={overWeight ? "text-red-400" : "text-amber-400"}
            />
            <div>
              <p
                className={`text-xl font-semibold ${overWeight ? "text-red-400" : "text-stone-100"}`}
              >
                {totalWeight.toFixed(1)} kg
              </p>
              <p className="text-xs text-stone-500">Total weight</p>
            </div>
          </div>
          {trip.target_weight_kg != null ? (
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-stone-900/60 px-4 py-3">
              <Target size={18} className="text-sky-400" />
              <div>
                <p className="text-xl font-semibold text-stone-100">
                  {trip.target_weight_kg} kg
                </p>
                <p className="text-xs text-stone-500">Target</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Gear pool */}
          <GearPool
            gear={availableGear}
            search={search}
            onSearchChange={setSearch}
            adding={adding}
            onAdd={handleAddItem}
          />

          {/* Right: Trip bag */}
          <TripBag
            items={items}
            packedWeight={packedWeight}
            totalWeight={totalWeight}
            targetWeight={trip.target_weight_kg}
            onTogglePacked={handleTogglePacked}
            onRemove={handleRemoveItem}
          />
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {draggingItem ? (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-stone-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
            {(() => {
              const Icon = getGearIcon(
                draggingItem.name,
                draggingItem.brand,
                draggingItem.categoryName,
              );
              return <Icon size={18} className="text-amber-400" />;
            })()}
            <div>
              <p className="font-medium text-stone-100">{draggingItem.name}</p>
              {draggingItem.weight != null ? (
                <p className="text-xs text-stone-400">
                  {draggingItem.weight} kg
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
