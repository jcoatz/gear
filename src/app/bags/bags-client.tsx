"use client";

import {
  Backpack,
  Briefcase,
  Droplets,
  Edit2,
  Loader2,
  Package,
  Plus,
  Scale,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/toast";
import { createBag, deleteBag, updateBag, type BagType } from "./actions";

export type BagRow = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  volume_liters: number | null;
  max_weight_kg: number | null;
  own_weight_kg: number | null;
  bag_type: string;
  notes: string | null;
};

const BAG_TYPE_OPTIONS: { value: BagType; label: string }[] = [
  { value: "backpack", label: "Backpack" },
  { value: "daypack", label: "Daypack" },
  { value: "duffel", label: "Duffel" },
  { value: "stuff_sack", label: "Stuff Sack" },
  { value: "dry_bag", label: "Dry Bag" },
  { value: "hip_pack", label: "Hip Pack" },
  { value: "other", label: "Other" },
];

const BAG_TYPE_ICONS: Record<string, typeof Backpack> = {
  backpack: Backpack,
  daypack: ShoppingBag,
  duffel: Briefcase,
  stuff_sack: Package,
  dry_bag: Droplets,
  hip_pack: ShoppingBag,
  other: Package,
};

const BAG_TYPE_COLORS: Record<string, string> = {
  backpack: "bg-amber-500/15 text-amber-400",
  daypack: "bg-sky-500/15 text-sky-400",
  duffel: "bg-violet-500/15 text-violet-400",
  stuff_sack: "bg-emerald-500/15 text-emerald-400",
  dry_bag: "bg-cyan-500/15 text-cyan-400",
  hip_pack: "bg-orange-500/15 text-orange-400",
  other: "bg-g-raised text-g-text-3",
};

export function getBagIcon(bagType: string) {
  return BAG_TYPE_ICONS[bagType] ?? Package;
}

export function getBagColor(bagType: string) {
  return BAG_TYPE_COLORS[bagType] ?? BAG_TYPE_COLORS.other;
}

type BagsClientProps = {
  bags: BagRow[];
};

export function BagsClient({ bags }: BagsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    model: "",
    color: "",
    volume_liters: "",
    max_weight_kg: "",
    own_weight_kg: "",
    bag_type: "backpack",
    notes: "",
  });

  function resetForm() {
    setForm({
      name: "",
      brand: "",
      model: "",
      color: "",
      volume_liters: "",
      max_weight_kg: "",
      own_weight_kg: "",
      bag_type: "backpack",
      notes: "",
    });
  }

  function startEdit(bag: BagRow) {
    setEditingId(bag.id);
    setForm({
      name: bag.name,
      brand: bag.brand ?? "",
      model: bag.model ?? "",
      color: bag.color ?? "",
      volume_liters: bag.volume_liters?.toString() ?? "",
      max_weight_kg: bag.max_weight_kg?.toString() ?? "",
      own_weight_kg: bag.own_weight_kg?.toString() ?? "",
      bag_type: bag.bag_type,
      notes: bag.notes ?? "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);

    const payload = {
      name: form.name,
      brand: form.brand || undefined,
      model: form.model || undefined,
      color: form.color || undefined,
      volume_liters: form.volume_liters ? Number(form.volume_liters) : undefined,
      max_weight_kg: form.max_weight_kg ? Number(form.max_weight_kg) : undefined,
      own_weight_kg: form.own_weight_kg ? Number(form.own_weight_kg) : undefined,
      bag_type: form.bag_type,
      notes: form.notes || undefined,
    };

    if (editingId) {
      const result = await updateBag(editingId, payload);
      if (result.ok) {
        toast("Bag updated");
      } else {
        toast(result.message, "error");
      }
    } else {
      const result = await createBag(payload);
      if (result.ok) {
        toast("Bag added");
      } else {
        toast(result.message, "error");
      }
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    resetForm();
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteBag(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (result.ok) {
      toast("Bag deleted");
      router.refresh();
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <Backpack size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-g-text">
              My Bags
            </h1>
            <p className="text-sm text-g-text-3">
              Your packs, duffels, and stuff sacks with capacity limits
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm((v) => !v);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-g-accent-hover px-4 py-2 text-sm font-medium text-g-accent transition-colors hover:bg-g-accent-hover"
        >
          <Plus size={16} />
          Add bag
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm ? (
        <div className="rounded-xl border border-g-border bg-g-card p-5 backdrop-blur-md">
          <h2 className="mb-4 text-lg font-semibold text-g-text">
            {editingId ? "Edit bag" : "Add a new bag"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-g-text-3">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Osprey Atmos 65"
                className={inputClass}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-g-text-3">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                placeholder="e.g. Osprey"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-g-text-3">Model</label>
              <input
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                placeholder="e.g. Atmos AG 65"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-g-text-3">Type</label>
              <select
                value={form.bag_type}
                onChange={(e) => setForm((f) => ({ ...f, bag_type: e.target.value }))}
                className={inputClass}
              >
                {BAG_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-g-text-3">Color</label>
              <input
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                placeholder="e.g. Abyss Grey"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-g-text-3">Volume (liters)</label>
              <input
                value={form.volume_liters}
                onChange={(e) => setForm((f) => ({ ...f, volume_liters: e.target.value }))}
                inputMode="decimal"
                placeholder="e.g. 65"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-g-text-3">Max load (kg)</label>
              <input
                value={form.max_weight_kg}
                onChange={(e) => setForm((f) => ({ ...f, max_weight_kg: e.target.value }))}
                inputMode="decimal"
                placeholder="e.g. 20"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-g-text-3">Bag weight (kg)</label>
              <input
                value={form.own_weight_kg}
                onChange={(e) => setForm((f) => ({ ...f, own_weight_kg: e.target.value }))}
                inputMode="decimal"
                placeholder="e.g. 2.1"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="rounded-lg border border-g-input-border bg-g-input px-4 py-2 text-sm text-g-text-2 hover:bg-g-raised"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-g-accent-hover px-4 py-2 text-sm font-medium text-g-accent hover:bg-g-accent-hover disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {editingId ? "Save changes" : "Add bag"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Bag list */}
      {bags.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-g-border bg-g-card px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-g-raised">
            <Backpack size={28} className="text-g-text-3" />
          </div>
          <div>
            <p className="font-medium text-g-text-2">No bags yet</p>
            <p className="mt-1 text-sm text-g-text-3">
              Add your backpacks and bags to plan trip packing with capacity limits.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {bags.map((bag) => {
            const BagIcon = getBagIcon(bag.bag_type);
            const colorClass = getBagColor(bag.bag_type);
            const typeLabel = BAG_TYPE_OPTIONS.find((o) => o.value === bag.bag_type)?.label ?? bag.bag_type;

            return (
              <div
                key={bag.id}
                className="group relative flex flex-col gap-3 rounded-xl border border-g-border bg-g-card p-5 backdrop-blur-md transition-all hover:border-g-border-active hover:shadow-lg hover:shadow-amber-500/5"
              >
                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => startEdit(bag)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-g-text-4 hover:bg-g-raised hover:text-g-text-2"
                  >
                    <Edit2 size={12} />
                  </button>
                  {confirmDeleteId === bag.id ? (
                    <div className="flex items-center gap-1 rounded-lg border border-g-error-border bg-g-error-bg px-2 py-0.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(bag.id)}
                        disabled={deletingId === bag.id}
                        className="text-[11px] font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        {deletingId === bag.id ? <Loader2 size={10} className="animate-spin" /> : "Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[11px] text-g-text-3"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(bag.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-g-text-4 hover:bg-g-error-bg hover:text-g-error-text"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Icon + name */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                    <BagIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-g-text">{bag.name}</h3>
                    <p className="text-xs text-g-text-3">
                      {[bag.brand, bag.model].filter(Boolean).join(" ") || typeLabel}
                    </p>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex flex-wrap gap-2 text-xs text-g-text-3">
                  {bag.volume_liters != null ? (
                    <span className="flex items-center gap-1 rounded-full bg-g-raised px-2.5 py-0.5">
                      <Package size={10} />
                      {bag.volume_liters}L
                    </span>
                  ) : null}
                  {bag.max_weight_kg != null ? (
                    <span className="flex items-center gap-1 rounded-full bg-g-raised px-2.5 py-0.5">
                      <Scale size={10} />
                      Max {bag.max_weight_kg} kg
                    </span>
                  ) : null}
                  {bag.own_weight_kg != null ? (
                    <span className="flex items-center gap-1 rounded-full bg-g-raised px-2.5 py-0.5">
                      Bag: {bag.own_weight_kg} kg
                    </span>
                  ) : null}
                  {bag.color ? (
                    <span className="rounded-full bg-g-raised px-2.5 py-0.5">
                      {bag.color}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
