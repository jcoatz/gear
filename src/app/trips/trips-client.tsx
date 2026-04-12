"use client";

import {
  Calendar,
  Loader2,
  Map,
  MapPin,
  Package,
  Plus,
  Scale,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTrip, deleteTrip } from "./actions";

type TripItemRow = {
  id: string;
  gear_item_id: string;
  packed: boolean;
  gear_items: { weight: number | null } | { weight: number | null }[] | null;
};

type TripRow = {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  target_weight_kg: number | null;
  created_at: string;
  trip_items: TripItemRow[] | null;
};

type TripsClientProps = {
  trips: TripRow[];
};

function getTripWeight(items: TripItemRow[] | null): number {
  if (!items) return 0;
  return items.reduce((sum, ti) => {
    const gearItem = Array.isArray(ti.gear_items)
      ? ti.gear_items[0]
      : ti.gear_items;
    return sum + (gearItem?.weight ?? 0);
  }, 0);
}

export function TripsClient({ trips }: TripsClientProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    const tw = targetWeight ? Number(targetWeight) : undefined;
    const result = await createTrip({
      name,
      description: description || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      target_weight_kg: tw && !Number.isNaN(tw) ? tw : undefined,
    });
    setCreating(false);
    if (result.ok) {
      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setTargetWeight("");
      setShowForm(false);
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteTrip(id);
    setDeletingId(null);
    router.refresh();
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-white/[0.08] bg-stone-800/60 px-3 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500/30 focus:outline-none focus:ring-1 focus:ring-amber-500/20";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <Map size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-100">
            Trips
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-500/30"
        >
          <Plus size={16} />
          New trip
        </button>
      </div>

      {/* Create form */}
      {showForm ? (
        <div className="rounded-xl border border-white/[0.06] bg-stone-900/60 p-5 backdrop-blur-md">
          <h2 className="mb-4 text-lg font-semibold text-stone-100">
            Plan a new trip
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-stone-400">
                Trip name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PCT Section B"
                className={inputClass}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-stone-400">
                Description
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes about the trip"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-400">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-400">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-400">
                Target weight (kg)
              </label>
              <input
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 8.5"
                className={inputClass}
              />
            </div>
          </div>
          {error ? (
            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-white/[0.08] bg-stone-800/60 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/30 disabled:opacity-50"
            >
              {creating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              Create trip
            </button>
          </div>
        </div>
      ) : null}

      {/* Trip list */}
      {trips.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/[0.1] bg-stone-900/40 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-800/80">
            <MapPin size={28} className="text-stone-500" />
          </div>
          <div>
            <p className="font-medium text-stone-300">No trips yet</p>
            <p className="mt-1 text-sm text-stone-500">
              Create your first trip to start packing gear.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {trips.map((trip) => {
            const totalWeight = getTripWeight(trip.trip_items);
            const itemCount = trip.trip_items?.length ?? 0;
            const packedCount =
              trip.trip_items?.filter((ti) => ti.packed).length ?? 0;
            const overWeight =
              trip.target_weight_kg != null &&
              totalWeight > trip.target_weight_kg;

            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="group relative flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-stone-900/60 p-5 backdrop-blur-md transition-all hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5"
              >
                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(trip.id);
                  }}
                  disabled={deletingId === trip.id}
                  className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-stone-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                >
                  {deletingId === trip.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                </button>

                <div>
                  <h3 className="font-semibold text-stone-100">{trip.name}</h3>
                  {trip.description ? (
                    <p className="mt-0.5 text-sm text-stone-400 line-clamp-1">
                      {trip.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                  {trip.start_date ? (
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {trip.start_date}
                      {trip.end_date ? ` → ${trip.end_date}` : ""}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-1">
                    <Package size={11} />
                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                    {itemCount > 0
                      ? ` (${packedCount} packed)`
                      : ""}
                  </span>
                  <span
                    className={`flex items-center gap-1 ${overWeight ? "text-red-400" : ""}`}
                  >
                    <Scale size={11} />
                    {totalWeight.toFixed(1)} kg
                    {trip.target_weight_kg != null
                      ? ` / ${trip.target_weight_kg} kg`
                      : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
