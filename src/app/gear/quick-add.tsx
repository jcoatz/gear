"use client";

import {
  ArrowLeft,
  Check,
  CheckSquare,
  Package,
  Scale,
  Square,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { GEAR_PACKAGES, PACKAGE_TAG_MAP, type GearPackage } from "./catalog";
import { addGearItems } from "./actions";
import type { CategoryRow } from "./gear-client";
import type { BulkGearItem } from "./schema";

type CheckedItem = {
  checked: boolean;
  brandOverride: string | null;
};

type QuickAddProps = {
  categories: CategoryRow[];
};

export function QuickAdd({ categories }: QuickAddProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<GearPackage | null>(null);
  const [checkedItems, setCheckedItems] = useState<CheckedItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.name, c.id])),
    [categories],
  );

  const selectPackage = useCallback((pkg: GearPackage) => {
    setSelectedPkg(pkg);
    setCheckedItems(pkg.items.map(() => ({ checked: true, brandOverride: null })));
    setResult(null);
  }, []);

  const toggleItem = useCallback((index: number) => {
    setCheckedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item,
      ),
    );
  }, []);

  const checkedCount = checkedItems.filter((i) => i.checked).length;
  const allChecked = checkedItems.length > 0 && checkedCount === checkedItems.length;

  const toggleAll = useCallback(() => {
    const newValue = !allChecked;
    setCheckedItems((prev) => prev.map((item) => ({ ...item, checked: newValue })));
  }, [allChecked]);

  const goBack = useCallback(() => {
    setSelectedPkg(null);
    setCheckedItems([]);
    setResult(null);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setSelectedPkg(null);
    setCheckedItems([]);
    setResult(null);
  }, []);

  async function handleSubmit() {
    if (!selectedPkg || checkedCount === 0) return;

    const items: BulkGearItem[] = selectedPkg.items
      .map((template, i) => ({ template, state: checkedItems[i] }))
      .filter((entry) => entry.state?.checked)
      .map(({ template, state }) => {
        const catId = categoryMap.get(template.categoryName);
        return {
          name: template.name,
          brand: (state.brandOverride ?? template.suggestedBrand) || null,
          category_id: catId !== undefined ? catId : null,
          condition: "good" as const,
          weight: template.estimatedWeightKg ?? null,
          tags: PACKAGE_TAG_MAP[selectedPkg.id] ?? [],
        };
      });

    setSubmitting(true);
    setResult(null);
    try {
      const res = await addGearItems(items);
      if (res.ok) {
        setResult({ type: "success", message: `Added ${res.count} item${res.count === 1 ? "" : "s"} to your gear!` });
        setSelectedPkg(null);
        setCheckedItems([]);
        router.refresh();
      } else {
        setResult({ type: "error", message: res.message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-g-accent/20 bg-g-card/40 px-5 py-4 text-left backdrop-blur-md transition-all hover:border-g-accent/40 hover:bg-g-card/60"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent transition-transform group-hover:scale-110">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="font-semibold text-g-text">Quick Add</p>
          <p className="text-sm text-g-text-3">
            Choose from gear packages by activity — add multiple items at once
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-g-border bg-g-card backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-g-border bg-g-card px-4 py-3">
        <div className="flex items-center gap-2">
          {selectedPkg ? (
            <button
              type="button"
              onClick={goBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-g-text-3 transition-colors hover:bg-g-raised hover:text-g-text"
            >
              <ArrowLeft size={18} />
            </button>
          ) : null}
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-g-accent" />
            <span className="font-semibold text-g-text">
              {selectedPkg ? selectedPkg.name : "Quick Add"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-g-text-3 transition-colors hover:bg-g-raised hover:text-g-text"
        >
          <X size={18} />
        </button>
      </div>

      {/* Result banner */}
      {result ? (
        <div
          className={`mx-4 mt-4 rounded-lg border px-3 py-2 text-sm ${
            result.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-g-error-border bg-g-error-bg text-g-error-text"
          }`}
        >
          {result.message}
        </div>
      ) : null}

      {/* Package selector */}
      {!selectedPkg ? (
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {GEAR_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => selectPackage(pkg)}
                className="group/pkg flex flex-col gap-2 rounded-xl border border-g-border bg-g-raised/40 p-4 text-left transition-all hover:border-g-border-active hover:bg-g-raised hover:shadow-lg hover:shadow-g-accent/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent transition-transform group-hover/pkg:scale-110">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug text-g-text">{pkg.name}</p>
                    <p className="text-xs text-g-text-3">
                      {pkg.items.length} items
                    </p>
                  </div>
                </div>
                <p className="text-sm text-g-text-3">{pkg.description}</p>
              </button>
            );
          })}
        </div>
      ) : (
        /* Item checklist */
        <div className="flex flex-col">
          {/* Select all bar */}
          <div className="flex items-center justify-between border-b border-g-border px-4 py-2">
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm font-medium text-g-text-3 transition-colors hover:text-g-text"
            >
              {allChecked ? (
                <CheckSquare size={16} className="text-g-accent" />
              ) : (
                <Square size={16} />
              )}
              {allChecked ? "Deselect all" : "Select all"}
            </button>
            <span className="text-sm text-g-text-3">
              {checkedCount} of {checkedItems.length} selected
            </span>
          </div>

          {/* Items */}
          <div className="divide-y divide-g-border/50">
            {selectedPkg.items.map((template, index) => {
              const checked = checkedItems[index]?.checked ?? false;
              const resolvedCategory = categoryMap.has(template.categoryName);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleItem(index)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    checked
                      ? "bg-g-raised/40"
                      : "bg-transparent opacity-50"
                  } hover:bg-g-raised/60`}
                >
                  {/* Checkbox */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked
                        ? "border-g-accent bg-g-accent-surface text-g-accent"
                        : "border-g-input-border bg-g-input"
                    }`}
                  >
                    {checked ? <Check size={14} /> : null}
                  </div>

                  {/* Item info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium leading-snug text-g-text">
                      {template.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-g-text-3">
                      {template.suggestedBrand ? (
                        <span className="flex items-center gap-1">
                          <Package size={11} />
                          {template.suggestedBrand}
                        </span>
                      ) : null}
                      <span
                        className={`flex items-center gap-1 ${
                          !resolvedCategory ? "text-amber-500" : ""
                        }`}
                      >
                        <Tag size={11} />
                        {template.categoryName}
                      </span>
                      {template.estimatedWeightKg != null ? (
                        <span className="flex items-center gap-1">
                          <Scale size={11} />
                          {template.estimatedWeightKg} kg
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between border-t border-g-border bg-g-card px-4 py-3">
            <button
              type="button"
              onClick={goBack}
              className="rounded-lg border border-g-input-border bg-g-input px-3 py-1.5 text-sm text-g-text-3 transition-colors hover:bg-g-raised hover:text-g-text"
            >
              Back
            </button>
            <button
              type="button"
              disabled={checkedCount === 0 || submitting}
              onClick={handleSubmit}
              className="rounded-lg bg-g-accent-hover px-4 py-1.5 text-sm font-medium text-g-accent transition-colors hover:bg-g-accent-hover disabled:opacity-50"
            >
              {submitting
                ? "Adding..."
                : `Add ${checkedCount} item${checkedCount === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
