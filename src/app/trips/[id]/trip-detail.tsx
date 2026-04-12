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
import { arrayMove } from "@dnd-kit/sortable";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  GripVertical,
  Loader2,
  Package,
  Pencil,
  Scale,
  Target,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useToast } from "@/components/toast";
import { getGearIcon } from "@/app/gear/gear-icons";
import {
  addItemToTrip,
  removeItemFromTrip,
  reorderTripItems,
  togglePacked,
  updateTrip,
} from "../actions";
import { saveAsTemplate } from "../template-actions";
import { addBagToTrip, assignItemToBag, removeBagFromTrip } from "@/app/bags/actions";
import { GearPool } from "./gear-pool";
import { PackSuggestions } from "./pack-suggestions";
import { TripBag } from "./trip-bag";
import { TripBagPacking } from "./trip-bag-packing";

export type TripItemData = {
  tripItemId: string;
  gearItemId: string;
  packed: boolean;
  sortOrder: number;
  bagId: string | null;
  name: string;
  brand: string | null;
  model: string | null;
  condition: string | null;
  weight: number | null;
  categoryName: string | null;
};

export type BagData = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  volume_liters: number | null;
  max_weight_kg: number | null;
  own_weight_kg: number | null;
  bag_type: string;
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
  userActivities: Record<string, string>;
  pastFrequency: Record<string, number>;
  userBags: BagData[];
  tripBagIds: string[];
};

export function TripDetail({ trip, tripItems, allGear, userActivities, pastFrequency, userBags, tripBagIds }: TripDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(tripItems);
  const [activeBagIds, setActiveBagIds] = useState<string[]>(tripBagIds);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState(trip.name);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    name: trip.name,
    description: trip.description ?? "",
    start_date: trip.start_date ?? "",
    end_date: trip.end_date ?? "",
    target_weight_kg: trip.target_weight_kg?.toString() ?? "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

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

  // Drag from pool to bag, or reorder within bag
  async function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;

    // If dropping onto trip-bag from pool
    if (over.id === "trip-bag" && !inTripIds.has(activeId)) {
      await handleAddItem(activeId);
      return;
    }

    // If reordering within bag (both active and over are trip item IDs)
    const activeItem = items.find((i) => i.tripItemId === activeId);
    const overItem = items.find((i) => i.tripItemId === (over.id as string));
    if (activeItem && overItem && activeId !== over.id) {
      const oldIndex = items.findIndex((i) => i.tripItemId === activeId);
      const newIndex = items.findIndex((i) => i.tripItemId === (over.id as string));
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      // Persist
      await reorderTripItems(trip.id, newItems.map((i) => i.tripItemId));
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
      toast("Item added to trip");
      const gear = allGear.find((g) => g.id === gearItemId);
      if (gear) {
        setItems((prev) => [
          ...prev,
          {
            tripItemId: `temp-${Date.now()}`,
            gearItemId: gear.id,
            packed: false,
            sortOrder: prev.length,
            bagId: null,
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
    toast("Item removed");
    router.refresh();
  }

  async function handleTogglePacked(tripItemId: string, packed: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.tripItemId === tripItemId ? { ...i, packed } : i)),
    );
    await togglePacked(tripItemId, packed);
  }

  async function handleSaveTemplate() {
    if (!templateName.trim()) return;
    setSavingTemplate(true);
    const result = await saveAsTemplate(trip.id, templateName);
    setSavingTemplate(false);
    if (result.ok) {
      setTemplateSaved(true);
      setShowSaveTemplate(false);
      toast("Template saved");
      setTimeout(() => setTemplateSaved(false), 3000);
    }
  }

  async function handleAddBag(bagId: string) {
    setActiveBagIds((prev) => [...prev, bagId]);
    await addBagToTrip(trip.id, bagId);
    toast("Bag added to trip");
    router.refresh();
  }

  async function handleRemoveBag(bagId: string) {
    setActiveBagIds((prev) => prev.filter((id) => id !== bagId));
    setItems((prev) => prev.map((i) => (i.bagId === bagId ? { ...i, bagId: null } : i)));
    await removeBagFromTrip(trip.id, bagId);
    toast("Bag removed from trip");
    router.refresh();
  }

  async function handleAssignBag(tripItemId: string, bagId: string | null) {
    setItems((prev) =>
      prev.map((i) => (i.tripItemId === tripItemId ? { ...i, bagId } : i)),
    );
    await assignItemToBag(tripItemId, bagId);
  }

  async function handleSaveEdit() {
    if (!editFields.name.trim()) return;
    setSavingEdit(true);
    const tw = editFields.target_weight_kg ? Number(editFields.target_weight_kg) : null;
    const result = await updateTrip(trip.id, {
      name: editFields.name,
      description: editFields.description || undefined,
      start_date: editFields.start_date || null,
      end_date: editFields.end_date || null,
      target_weight_kg: tw && !Number.isNaN(tw) ? tw : null,
    });
    setSavingEdit(false);
    if (result.ok) {
      toast("Trip updated");
      setEditing(false);
      router.refresh();
    } else {
      toast(result.message, "error");
    }
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
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-g-input-border bg-g-input text-g-text-2 transition-colors hover:bg-g-raised hover:text-g-text"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-g-text">
                {trip.name}
              </h1>
              {trip.description ? (
                <p className="text-sm text-g-text-3">{trip.description}</p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {trip.start_date ? (
              <p className="text-sm text-g-text-3">
                {trip.start_date}
                {trip.end_date ? ` → ${trip.end_date}` : ""}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setEditing((v) => !v);
                setEditFields({
                  name: trip.name,
                  description: trip.description ?? "",
                  start_date: trip.start_date ?? "",
                  end_date: trip.end_date ?? "",
                  target_weight_kg: trip.target_weight_kg?.toString() ?? "",
                });
              }}
              className="flex items-center gap-1.5 rounded-lg border border-g-border bg-g-raised px-3 py-1.5 text-xs font-medium text-g-text-3 transition-colors hover:text-g-text-2 hover:border-g-border-active"
            >
              <Pencil size={12} />
              Edit
            </button>
            {templateSaved ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Check size={12} /> Saved
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowSaveTemplate((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-g-border bg-g-raised px-3 py-1.5 text-xs font-medium text-g-text-3 transition-colors hover:text-g-text-2 hover:border-g-border-active"
              >
                <Copy size={12} />
                Save as template
              </button>
            )}
          </div>
        </div>

        {/* Save as template form */}
        {showSaveTemplate ? (
          <div className="flex items-center gap-2 rounded-xl border border-g-border bg-g-card px-4 py-3">
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              className="h-8 flex-1 rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
            />
            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={savingTemplate || !templateName.trim()}
              className="flex items-center gap-1 rounded-lg bg-g-accent-hover px-3 py-1.5 text-xs font-medium text-g-accent hover:bg-g-accent-hover disabled:opacity-50"
            >
              {savingTemplate ? <Loader2 size={10} className="animate-spin" /> : <Copy size={10} />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowSaveTemplate(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-g-text-3 hover:bg-g-raised hover:text-g-text-2"
            >
              <X size={14} />
            </button>
          </div>
        ) : null}

        {/* Edit trip form */}
        {editing ? (
          <div className="rounded-xl border border-g-border bg-g-card p-5 backdrop-blur-md">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-g-text">
              <Pencil size={16} className="text-g-accent" />
              Edit trip
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-g-text-3">Trip name</label>
                <input
                  value={editFields.name}
                  onChange={(e) => setEditFields((f) => ({ ...f, name: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-g-text-3">Description</label>
                <input
                  value={editFields.description}
                  onChange={(e) => setEditFields((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional notes"
                  className="h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-g-text-3">Start date</label>
                <input
                  type="date"
                  value={editFields.start_date}
                  onChange={(e) => setEditFields((f) => ({ ...f, start_date: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-g-text-3">End date</label>
                <input
                  type="date"
                  value={editFields.end_date}
                  onChange={(e) => setEditFields((f) => ({ ...f, end_date: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-g-text-3">Target weight (kg)</label>
                <input
                  value={editFields.target_weight_kg}
                  onChange={(e) => setEditFields((f) => ({ ...f, target_weight_kg: e.target.value }))}
                  inputMode="decimal"
                  placeholder="e.g. 8.5"
                  className="h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-g-input-border bg-g-input px-4 py-2 text-sm text-g-text-2 hover:bg-g-raised"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit || !editFields.name.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-g-accent-hover px-4 py-2 text-sm font-medium text-g-accent hover:bg-g-accent-hover disabled:opacity-50"
              >
                {savingEdit ? <Loader2 size={14} className="animate-spin" /> : null}
                Save changes
              </button>
            </div>
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3">
            <Package size={18} className="text-g-accent" />
            <div>
              <p className="text-xl font-semibold text-g-text">
                {items.length}
              </p>
              <p className="text-xs text-g-text-3">Items</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <div>
              <p className="text-xl font-semibold text-g-text">
                {packedCount}/{items.length}
              </p>
              <p className="text-xs text-g-text-3">Packed</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              overWeight
                ? "border-red-500/20 bg-red-500/[0.07]"
                : "border-g-border bg-g-card"
            }`}
          >
            <Scale
              size={18}
              className={overWeight ? "text-red-400" : "text-g-accent"}
            />
            <div>
              <p
                className={`text-xl font-semibold ${overWeight ? "text-red-400" : "text-g-text"}`}
              >
                {totalWeight.toFixed(1)} kg
              </p>
              <p className="text-xs text-g-text-3">Total weight</p>
            </div>
          </div>
          {trip.target_weight_kg != null ? (
            <div className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3">
              <Target size={18} className="text-sky-400" />
              <div>
                <p className="text-xl font-semibold text-g-text">
                  {trip.target_weight_kg} kg
                </p>
                <p className="text-xs text-g-text-3">Target</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Smart suggestions */}
        <PackSuggestions
          availableGear={availableGear}
          userActivities={userActivities}
          pastFrequency={pastFrequency}
          adding={adding}
          onAdd={handleAddItem}
        />

        {/* Bag packing view */}
        {userBags.length > 0 ? (
          <TripBagPacking
            items={items}
            userBags={userBags}
            activeBagIds={activeBagIds}
            onAddBag={handleAddBag}
            onRemoveBag={handleRemoveBag}
            onAssignBag={handleAssignBag}
          />
        ) : null}

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
            onReorder={(ids) => reorderTripItems(trip.id, ids)}
          />
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {draggingItem ? (
          <div className="flex items-center gap-3 rounded-xl border border-g-border-active bg-g-card px-4 py-3 shadow-2xl backdrop-blur-xl">
            {(() => {
              const Icon = getGearIcon(
                draggingItem.name,
                draggingItem.brand,
                draggingItem.categoryName,
              );
              return <Icon size={18} className="text-g-accent" />;
            })()}
            <div>
              <p className="font-medium text-g-text">{draggingItem.name}</p>
              {draggingItem.weight != null ? (
                <p className="text-xs text-g-text-2">
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
