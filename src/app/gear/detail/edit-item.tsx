"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { updateGearItem } from "../actions";
import { GEAR_CONDITIONS, CONDITION_LABELS } from "../schema";
import type { GearItemRow, CategoryRow } from "../gear-client";

type EditItemProps = {
  item: GearItemRow;
  categories: CategoryRow[];
  onBack: () => void;
  onSaved: () => void;
};

export function EditItem({ item, categories, onBack, onSaved }: EditItemProps) {
  const [name, setName] = useState(item.name);
  const [brand, setBrand] = useState(item.brand ?? "");
  const [model, setModel] = useState(item.model ?? "");
  const [categoryId, setCategoryId] = useState(item.category_id ?? "");
  const [condition, setCondition] = useState(item.condition ?? "good");
  const [weight, setWeight] = useState(item.weight != null ? String(item.weight) : "");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateGearItem(item.id, {
      name,
      brand,
      model,
      category_id: categoryId,
      condition,
      weight,
      notes,
    });
    setSaving(false);
    if (result.ok) {
      onSaved();
    } else {
      setError(result.message);
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface";
  const selectClass =
    "h-9 w-full appearance-none rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface";

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-g-text-3 transition-colors hover:bg-g-raised hover:text-g-text"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-g-text">Edit item</h2>
      </div>

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-g-text-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-g-text-2">Brand</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-g-text-2">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-g-text-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectClass}
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-g-text-2">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={selectClass}
            >
              {GEAR_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {CONDITION_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-g-text-2">Weight (kg)</label>
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              inputMode="decimal"
              placeholder="e.g. 2.5"
              className={inputClass}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-g-text-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-g-input-border bg-g-input px-3 py-2 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
          />
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-g-error-border bg-g-error-bg px-3 py-2 text-sm text-g-error-text">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-g-border bg-g-raised px-4 py-2 text-sm text-g-text-2 transition-colors hover:bg-g-raised"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-g-accent-hover px-4 py-2 text-sm font-medium text-g-accent transition-colors hover:bg-g-accent-hover disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Save changes
        </button>
      </div>
    </div>
  );
}
