"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Backpack,
  Heart,
  LayoutGrid,
  Package,
  Plus,
  Scale,
  Tag,
  Warehouse,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { addGearItem, toggleWishlist } from "./actions";
import { POPULAR_BRANDS } from "./catalog";
import { GearDetailOverlay } from "./detail/gear-detail-overlay";
import { getGearIcon } from "./gear-icons";
import { InlineEdit } from "./inline-edit";
import { QuickAdd } from "./quick-add";
import { GearRoom } from "./room/gear-room";
import { useCardTilt } from "./room/use-card-tilt";
import {
  CONDITION_LABELS,
  GEAR_CONDITIONS,
  type GearItemFormValues,
  gearItemFormSchema,
} from "./schema";
import { getTagGroup, TAG_GROUP_COLORS_DARK } from "./tags";
import { GearToolbar } from "./toolbar/gear-toolbar";
import { useGearFilters } from "./use-gear-filters";

export type CategoryRow = { id: string; name: string };

export type GearItemRow = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  condition: string | null;
  weight: number | null;
  notes: string | null;
  tags: string[];
  wishlist: boolean;
  category_id: string | null;
  categories: { name: string } | null;
};

type GearClientProps = {
  userEmail: string;
  categories: CategoryRow[];
  items: GearItemRow[];
  loadError?: string;
};

/* ── Condition dot colours ── */
const CONDITION_DOTS: Record<string, string> = {
  new: "bg-emerald-400 shadow-emerald-400/50",
  like_new: "bg-teal-400 shadow-teal-400/50",
  good: "bg-sky-400 shadow-sky-400/50",
  fair: "bg-amber-400 shadow-amber-400/50",
  poor: "bg-red-400 shadow-red-400/50",
};

/* ── Grid card with tilt + wishlist + inline edit ── */
function GearGridCard({
  item,
  onClick,
}: {
  item: GearItemRow;
  onClick: () => void;
}) {
  const { ref, style, glowX, glowY, hovering, handlers } = useCardTilt(10, 1.03);
  const router = useRouter();
  const Icon = getGearIcon(item.name, item.brand, item.categories?.name);
  const conditionDot = item.condition ? CONDITION_DOTS[item.condition] ?? "" : "";
  const conditionLabel = item.condition
    ? CONDITION_LABELS[item.condition as keyof typeof CONDITION_LABELS] ?? item.condition
    : null;

  async function handleWishlistToggle(e: React.MouseEvent) {
    e.stopPropagation();
    await toggleWishlist(item.id, !item.wishlist);
    router.refresh();
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, layout: { duration: 0.3 } }}
    >
      <div
        ref={ref}
        style={style}
        {...handlers}
        onClick={onClick}
        className="group/card relative cursor-pointer rounded-xl border border-g-border bg-g-card backdrop-blur-md transition-shadow hover:shadow-lg hover:shadow-amber-500/5"
      >
        {/* Glow */}
        {hovering ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 rounded-xl"
            style={{
              background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.08) 0%, transparent 55%)`,
            }}
          />
        ) : null}

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-all ${
            item.wishlist
              ? "bg-red-500/20 text-red-400"
              : "bg-g-raised text-g-text-4 opacity-0 group-hover/card:opacity-100"
          } hover:scale-110`}
        >
          <Heart size={14} fill={item.wishlist ? "currentColor" : "none"} />
        </button>

        <div className="relative z-10 flex flex-col gap-3 p-4">
          {/* Icon + name row */}
          <div className="flex items-start gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
              <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <InlineEdit
                value={item.name}
                itemId={item.id}
                field="name"
                className="truncate font-semibold leading-snug text-g-text"
              />
              {(item.brand || item.model) ? (
                <p className="mt-0.5 truncate text-xs text-g-text-3">
                  {[item.brand, item.model].filter(Boolean).join(" ")}
                </p>
              ) : null}
            </div>
          </div>

          {/* Tags */}
          {item.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => {
                const group = getTagGroup(tag);
                const colors = group
                  ? TAG_GROUP_COLORS_DARK[group]
                  : { bg: "bg-g-raised", text: "text-g-text-3", border: "border-g-border" };
                return (
                  <span
                    key={tag}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    {tag}
                  </span>
                );
              })}
              {item.tags.length > 3 ? (
                <span className="rounded-full bg-g-raised px-2 py-0.5 text-[10px] text-g-text-3">
                  +{item.tags.length - 3}
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Bottom row */}
          <div className="flex items-center gap-3 text-xs text-g-text-3">
            {item.categories?.name ? (
              <span className="flex items-center gap-1">
                <Tag size={10} />
                {item.categories.name}
              </span>
            ) : null}
            {conditionLabel ? (
              <span className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full shadow-sm ${conditionDot}`} />
                {conditionLabel}
              </span>
            ) : null}
            {item.weight != null ? (
              <span className="flex items-center gap-1 rounded-full bg-g-raised px-2 py-0.5">
                <Scale size={10} />
                {item.weight} kg
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main component ── */
export function GearClient({
  userEmail,
  categories,
  items,
  loadError,
}: GearClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "room">("grid");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GearItemRow | null>(null);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const filters = useGearFilters(
    showWishlistOnly ? items.filter((i) => i.wishlist) : items,
  );

  const wishlistCount = useMemo(
    () => items.filter((i) => i.wishlist).length,
    [items],
  );

  const defaultValues = useMemo<GearItemFormValues>(
    () => ({
      name: "",
      brand: "",
      model: "",
      category_id: categories[0]?.id ?? "",
      condition: "good",
      weight: "",
      notes: "",
      tags: [],
    }),
    [categories],
  );

  const form = useForm<GearItemFormValues>({
    resolver: zodResolver(gearItemFormSchema),
    defaultValues,
  });

  const totalWeight = useMemo(
    () => items.reduce((sum, item) => sum + (item.weight ?? 0), 0),
    [items],
  );

  const categoryCount = useMemo(
    () => new Set(items.map((i) => i.categories?.name).filter(Boolean)).size,
    [items],
  );

  return (
    <div className="flex-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
        {/* ── Header ── */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-g-accent-surface text-g-accent shadow-sm">
              <Backpack size={20} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-g-text">
              My Gear
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Wishlist filter */}
            {wishlistCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowWishlistOnly((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  showWishlistOnly
                    ? "border-red-500/30 bg-red-500/15 text-red-400"
                    : "border-g-border bg-g-card text-g-text-3 hover:text-g-text-2"
                }`}
              >
                <Heart size={14} fill={showWishlistOnly ? "currentColor" : "none"} />
                Wishlist
                <span className="rounded-full bg-g-raised px-1.5 text-xs">
                  {wishlistCount}
                </span>
              </button>
            ) : null}
            {/* View toggle */}
            <div className="flex items-center gap-0.5 rounded-lg border border-g-border bg-g-card p-0.5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-g-raised text-g-text shadow-sm"
                    : "text-g-text-3 hover:text-g-text-2"
                }`}
              >
                <LayoutGrid size={14} />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("room")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "room"
                    ? "bg-g-raised text-g-text shadow-sm"
                    : "text-g-text-3 hover:text-g-text-2"
                }`}
              >
                <Warehouse size={14} />
                Room
              </button>
            </div>
          </div>
        </header>

        {loadError ? (
          <p className="rounded-lg border border-g-error-border bg-g-error-bg px-3 py-2 text-sm text-g-error-text">
            Could not load gear: {loadError}
          </p>
        ) : null}

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3 backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
              <Package size={18} />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none text-g-text">
                {items.length}
              </p>
              <p className="mt-0.5 text-xs text-g-text-3">Items</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3 backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
              <Scale size={18} />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none text-g-text">
                {totalWeight > 0 ? totalWeight.toFixed(1) : "0"}
              </p>
              <p className="mt-0.5 text-xs text-g-text-3">Total kg</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3 backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
              <Tag size={18} />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none text-g-text">
                {categoryCount}
              </p>
              <p className="mt-0.5 text-xs text-g-text-3">Categories</p>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <GearToolbar
          filters={filters}
          categories={categories}
          totalCount={items.length}
          filteredCount={filters.filteredItems.length}
        />

        {/* ── Gear items ── */}
        {viewMode === "room" ? (
          <GearRoom
            items={filters.filteredItems}
            categories={categories}
            onSelectItem={setSelectedItem}
          />
        ) : filters.filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-g-border bg-g-card/50 px-6 py-16 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-g-raised">
              <Backpack size={28} className="text-g-text-3" />
            </div>
            <div>
              <p className="font-medium text-g-text-2">
                {items.length === 0
                  ? "No gear yet"
                  : showWishlistOnly
                    ? "No wishlist items"
                    : "No matches"}
              </p>
              <p className="mt-1 text-sm text-g-text-3">
                {items.length === 0
                  ? "Add your first item with the form below to get started."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          </motion.div>
        ) : (
          <LayoutGroup>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filters.filteredItems.map((row) => (
                  <GearGridCard
                    key={row.id}
                    item={row}
                    onClick={() => setSelectedItem(row)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        )}

        {/* ── Quick add ── */}
        <QuickAdd categories={categories} />

        {/* ── Add gear form ── */}
        <div className="rounded-xl border border-g-border bg-g-card backdrop-blur-md">
          <div className="border-b border-g-border px-5 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-g-text">
              <Plus size={18} className="text-g-accent" />
              Add gear
            </h2>
            <p className="mt-1 text-sm text-g-text-3">
              {categories.length === 0
                ? "Add rows to the categories table in Supabase to enable the category dropdown."
                : "Save a new item to your inventory."}
            </p>
          </div>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              setFormError(null);
              setSubmitting(true);
              try {
                const result = await addGearItem(values);
                if (!result.ok) {
                  setFormError(result.message);
                  return;
                }
                form.reset({
                  ...defaultValues,
                  category_id: values.category_id,
                  condition: values.condition,
                });
                router.refresh();
              } finally {
                setSubmitting(false);
              }
            })}
          >
            <div className="space-y-4 px-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="gear-name" className="text-sm font-medium text-g-text-2">
                    Name
                  </label>
                  <input
                    id="gear-name"
                    autoComplete="off"
                    {...form.register("name")}
                    className="h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                  />
                  {form.formState.errors.name ? (
                    <p className="text-xs text-g-error-text">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>

                {/* Brand */}
                <div className="space-y-1.5">
                  <label htmlFor="gear-brand" className="text-sm font-medium text-g-text-2">
                    Brand
                  </label>
                  <input
                    id="gear-brand"
                    autoComplete="off"
                    {...form.register("brand")}
                    className="h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                  />
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_BRANDS.slice(0, 8).map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => form.setValue("brand", brand, { shouldDirty: true })}
                        className="rounded-full border border-g-border bg-g-raised px-2 py-0.5 text-[11px] text-g-text-3 transition-colors hover:border-g-border-active hover:bg-g-accent-surface hover:text-g-accent"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model */}
                <div className="space-y-1.5">
                  <label htmlFor="gear-model" className="text-sm font-medium text-g-text-2">
                    Model
                  </label>
                  <input
                    id="gear-model"
                    autoComplete="off"
                    {...form.register("model")}
                    className="h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-g-text-2">Category</label>
                  <Controller
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <select
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-9 w-full appearance-none rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
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
                    )}
                  />
                </div>

                {/* Condition */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-g-text-2">Condition</label>
                  <Controller
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-9 w-full appearance-none rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                      >
                        {GEAR_CONDITIONS.map((c) => (
                          <option key={c} value={c}>
                            {CONDITION_LABELS[c]}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label htmlFor="gear-weight" className="text-sm font-medium text-g-text-2">
                    Weight
                  </label>
                  <input
                    id="gear-weight"
                    inputMode="decimal"
                    placeholder="e.g. 2.5 (kg)"
                    {...form.register("weight")}
                    className="h-9 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label htmlFor="gear-notes" className="text-sm font-medium text-g-text-2">
                  Notes
                </label>
                <textarea
                  id="gear-notes"
                  rows={3}
                  {...form.register("notes")}
                  className="w-full rounded-lg border border-g-input-border bg-g-input px-3 py-2 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                />
              </div>

              {formError ? (
                <p className="rounded-lg border border-g-error-border bg-g-error-bg px-3 py-2 text-sm text-g-error-text">
                  {formError}
                </p>
              ) : null}
            </div>

            <div className="flex justify-end border-t border-g-border px-5 py-3">
              <button
                type="submit"
                disabled={submitting || categories.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-g-accent-hover px-5 py-2 text-sm font-medium text-g-accent transition-colors hover:bg-g-accent-hover disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Add item"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Detail overlay ── */}
      <GearDetailOverlay
        item={selectedItem}
        categories={categories}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
