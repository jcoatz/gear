"use client";

import {
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ExternalLink,
  Loader2,
  Minus,
  Plus,
  Scale,
  Shield,
  Sparkles,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ACTIVITY_GROUPS,
  SKILL_LABELS,
  SKILL_LEVELS,
  SKILL_COLORS,
  type SkillLevel,
} from "./activity-data";
import { computeBadge, BADGE_CONFIG, BADGE_LABELS } from "./badges";
import { setActivitySkill, removeActivity } from "./actions";
import { quickAddGearItem } from "@/app/gear/actions";
import { GearDetailOverlay } from "@/app/gear/detail/gear-detail-overlay";
import type { GearItemRow, CategoryRow } from "@/app/gear/gear-client";

type ActivitiesClientProps = {
  userActivities: Record<string, string>;
  userGear: GearItemRow[];
  categories: CategoryRow[];
};

export function ActivitiesClient({ userActivities, userGear, categories }: ActivitiesClientProps) {
  const router = useRouter();
  const [activities, setActivities] = useState(userActivities);
  const [gear, setGear] = useState(userGear);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(ACTIVITY_GROUPS.map((g) => g.id)),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [addingKeyword, setAddingKeyword] = useState<string | null>(null);
  const [quickAddForm, setQuickAddForm] = useState<string | null>(null); // keyword being edited
  const [qaFields, setQaFields] = useState({ brand: "", weight: "", price: "", category_id: "" });
  const [selectedGearItem, setSelectedGearItem] = useState<GearItemRow | null>(null);

  // Simplified gear for badge computation (needs id + name + categoryName)
  const badgeGear = useMemo(
    () =>
      gear.map((g) => ({
        id: g.id,
        name: g.name,
        categoryName: g.categories?.name ?? null,
      })),
    [gear],
  );

  function toggleGroup(groupId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  async function handleSetSkill(slug: string, level: SkillLevel) {
    setSaving(slug);
    setActivities((prev) => ({ ...prev, [slug]: level }));
    await setActivitySkill(slug, level);
    setSaving(null);
    router.refresh();
  }

  async function handleRemove(slug: string) {
    setSaving(slug);
    setActivities((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
    setSelectedActivity(null);
    await removeActivity(slug);
    setSaving(null);
    router.refresh();
  }

  function openQuickAddForm(keyword: string) {
    const name = keyword
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    setQuickAddForm(keyword);
    setQaFields({ brand: "", weight: "", price: "", category_id: "" });
  }

  async function handleQuickAdd(keyword: string) {
    setAddingKeyword(keyword);
    const name = keyword
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const extras: { brand?: string; weight?: number; price?: number; category_id?: string } = {};
    if (qaFields.brand.trim()) extras.brand = qaFields.brand.trim();
    if (qaFields.weight && Number(qaFields.weight) > 0) extras.weight = Number(qaFields.weight);
    if (qaFields.price && Number(qaFields.price) > 0) extras.price = Number(qaFields.price);
    if (qaFields.category_id) extras.category_id = qaFields.category_id;

    const matchedCat = extras.category_id
      ? categories.find((c) => c.id === extras.category_id) ?? null
      : null;

    const result = await quickAddGearItem(name, extras);
    if (result.ok) {
      const tempItem: GearItemRow = {
        id: `temp-${Date.now()}`,
        name,
        brand: extras.brand ?? null,
        model: null,
        condition: "good",
        weight: extras.weight ?? null,
        price: extras.price ?? null,
        notes: null,
        tags: [],
        wishlist: false,
        category_id: extras.category_id ?? null,
        categories: matchedCat ? { name: matchedCat.name } : null,
      };
      setGear((prev) => [...prev, tempItem]);
    }
    setAddingKeyword(null);
    setQuickAddForm(null);
    router.refresh();
  }

  function handleGearClick(itemId: string) {
    const item = gear.find((g) => g.id === itemId);
    if (item) setSelectedGearItem(item);
  }

  // Stats
  const totalActive = Object.keys(activities).length;
  const proCount = Object.values(activities).filter((l) => l === "pro").length;
  const wantToTryCount = Object.values(activities).filter((l) => l === "want_to_try").length;

  const gearReadyCount = useMemo(() => {
    let count = 0;
    for (const group of ACTIVITY_GROUPS) {
      for (const activity of group.activities) {
        if (activities[activity.slug]) {
          const badge = computeBadge(activity, badgeGear);
          if (badge.level === "ready") count++;
        }
      }
    }
    return count;
  }, [activities, badgeGear]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-g-accent-surface text-g-accent">
          <Zap size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-g-text">
            Activities
          </h1>
          <p className="text-sm text-g-text-3">
            Track what you do and see if you have the gear for it
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Zap size={18} className="text-g-accent" />} value={totalActive} label="Activities" />
        <StatCard icon={<Sparkles size={18} className="text-orange-400" />} value={proCount} label="Pro level" />
        <StatCard icon={<Award size={18} className="text-violet-400" />} value={wantToTryCount} label="Want to try" />
        <StatCard icon={<Shield size={18} className="text-emerald-400" />} value={gearReadyCount} label="Gear ready" />
      </div>

      {/* Activity groups */}
      <div className="flex flex-col gap-4">
        {ACTIVITY_GROUPS.map((group) => {
          const expanded = expandedGroups.has(group.id);
          const GroupIcon = group.icon;
          const activeInGroup = group.activities.filter(
            (a) => activities[a.slug],
          ).length;

          return (
            <div
              key={group.id}
              className={`rounded-xl border ${group.color.border} ${group.color.bg} overflow-hidden transition-all`}
            >
              {/* Group header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.03] dark:hover:bg-white/[0.03]"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${group.color.bg} ${group.color.text}`}>
                  <GroupIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`font-semibold ${group.color.text}`}>
                    {group.name}
                  </h2>
                  <p className="text-xs text-g-text-3">
                    {group.activities.length} activities
                    {activeInGroup > 0
                      ? ` \u00b7 ${activeInGroup} active`
                      : ""}
                  </p>
                </div>
                {expanded ? (
                  <ChevronDown size={16} className="text-g-text-3" />
                ) : (
                  <ChevronRight size={16} className="text-g-text-3" />
                )}
              </button>

              {/* Activities grid */}
              {expanded ? (
                <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.activities.map((activity) => {
                    const ActivityIcon = activity.icon;
                    const skillLevel = activities[activity.slug] as SkillLevel | undefined;
                    const badge = computeBadge(activity, badgeGear);
                    const isSelected = selectedActivity === activity.slug;
                    const isSaving = saving === activity.slug;
                    const badgeConf = BADGE_CONFIG[badge.level];

                    return (
                      <div
                        key={activity.slug}
                        className={`group relative flex flex-col rounded-xl border transition-all ${
                          skillLevel
                            ? `${SKILL_COLORS[skillLevel].border} bg-g-card`
                            : "border-g-border bg-g-card/50"
                        } ${isSelected ? "ring-1 ring-g-accent/40" : ""}`}
                      >
                        {/* Card top: icon + name + badge */}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedActivity(
                              isSelected ? null : activity.slug,
                            )
                          }
                          className="flex items-center gap-3 px-4 py-3 text-left"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              skillLevel
                                ? `${SKILL_COLORS[skillLevel].bg} ${SKILL_COLORS[skillLevel].text}`
                                : "bg-g-raised text-g-text-3"
                            }`}
                          >
                            <ActivityIcon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-g-text text-sm">
                              {activity.name}
                            </p>
                            {skillLevel ? (
                              <p className={`text-xs ${SKILL_COLORS[skillLevel].text}`}>
                                {SKILL_LABELS[skillLevel]}
                              </p>
                            ) : (
                              <p className="text-xs text-g-text-4">
                                Not started
                              </p>
                            )}
                          </div>

                          {/* Badge */}
                          <div
                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeConf.bg} ${badgeConf.text} ${badgeConf.border}`}
                            title={`${badge.matchedCount}/${badge.totalRequired} gear items matched`}
                          >
                            <Shield size={10} />
                            {badge.totalRequired > 0
                              ? `${Math.round(badge.fraction * 100)}%`
                              : "N/A"}
                          </div>

                          {isSaving ? (
                            <Loader2 size={14} className="animate-spin text-g-text-3" />
                          ) : null}
                        </button>

                        {/* Expanded: skill level picker */}
                        {isSelected ? (
                          <div className="border-t border-g-border px-4 py-3 space-y-3">
                            {/* Skill level selector */}
                            <div>
                              <p className="text-xs font-medium text-g-text-3 mb-2">
                                Your level
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {SKILL_LEVELS.map((level) => {
                                  const active = skillLevel === level;
                                  const colors = SKILL_COLORS[level];
                                  return (
                                    <button
                                      key={level}
                                      type="button"
                                      onClick={() =>
                                        handleSetSkill(activity.slug, level)
                                      }
                                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                                        active
                                          ? `${colors.bg} ${colors.text} ${colors.border} ring-1 ${colors.ring}`
                                          : "border-g-border bg-g-raised text-g-text-3 hover:text-g-text-2 hover:border-g-border-active"
                                      }`}
                                    >
                                      {active ? <Check size={10} /> : null}
                                      {SKILL_LABELS[level]}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Gear readiness checklist */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-g-text-3">
                                  Gear checklist
                                </p>
                                <span className={`text-xs font-medium ${badgeConf.text}`}>
                                  {badge.matchedCount}/{badge.totalRequired} — {BADGE_LABELS[badge.level]}
                                </span>
                              </div>
                              {/* Progress bar */}
                              <div className="h-1.5 rounded-full bg-g-raised overflow-hidden mb-3">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    badge.level === "ready"
                                      ? "bg-emerald-500"
                                      : badge.level === "most"
                                        ? "bg-sky-500"
                                        : badge.level === "some"
                                          ? "bg-amber-500"
                                          : "bg-g-text-4"
                                  }`}
                                  style={{ width: `${Math.round(badge.fraction * 100)}%` }}
                                />
                              </div>
                              {/* Item-by-item checklist */}
                              {badge.details.length > 0 ? (
                                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                  {badge.details.map((detail) => (
                                    <div key={detail.keyword}>
                                      <div
                                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                                          detail.matched
                                            ? "bg-emerald-500/8 dark:bg-emerald-500/8"
                                            : "bg-g-raised/50"
                                        }`}
                                      >
                                        {detail.matched ? (
                                          <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
                                        ) : (
                                          <Circle size={13} className="shrink-0 text-g-text-4" />
                                        )}
                                        <span className={`capitalize flex-1 ${
                                          detail.matched ? "text-g-text-2" : "text-g-text-3"
                                        }`}>
                                          {detail.keyword}
                                        </span>
                                        {detail.matched && detail.matchedItemId ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleGearClick(detail.matchedItemId!);
                                            }}
                                            className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/8 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors shrink-0 max-w-[140px]"
                                          >
                                            <ExternalLink size={8} className="shrink-0" />
                                            <span className="truncate">{detail.matchedItem}</span>
                                          </button>
                                        ) : quickAddForm === detail.keyword ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setQuickAddForm(null);
                                            }}
                                            className="flex items-center gap-0.5 rounded-md border border-g-border bg-g-raised px-1.5 py-0.5 text-[10px] font-medium text-g-text-3 hover:text-g-text-2 transition-colors shrink-0"
                                          >
                                            <X size={9} />
                                            Cancel
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openQuickAddForm(detail.keyword);
                                            }}
                                            disabled={addingKeyword === detail.keyword}
                                            className="flex items-center gap-0.5 rounded-md border border-g-border-active bg-g-accent-surface px-1.5 py-0.5 text-[10px] font-medium text-g-accent hover:bg-g-accent-hover transition-colors shrink-0 disabled:opacity-50"
                                          >
                                            {addingKeyword === detail.keyword ? (
                                              <Loader2 size={9} className="animate-spin" />
                                            ) : (
                                              <Plus size={9} />
                                            )}
                                            Add to gear
                                          </button>
                                        )}
                                      </div>

                                      {/* Inline mini-form */}
                                      {quickAddForm === detail.keyword ? (
                                        <div
                                          className="mt-1 rounded-lg border border-g-accent/20 bg-g-card px-3 py-2.5 space-y-2"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <p className="text-[11px] font-semibold text-g-text-2 flex items-center gap-1.5">
                                            <Plus size={10} className="text-g-accent" />
                                            Add &ldquo;{detail.keyword.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}&rdquo; to your gear
                                          </p>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <label className="text-[10px] text-g-text-3 mb-0.5 block">Brand</label>
                                              <input
                                                value={qaFields.brand}
                                                onChange={(e) => setQaFields((f) => ({ ...f, brand: e.target.value }))}
                                                placeholder="e.g. Osprey"
                                                className="h-7 w-full rounded-md border border-g-input-border bg-g-input px-2 text-xs text-g-text placeholder:text-g-text-4 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-g-text-3 mb-0.5 block">Category</label>
                                              <select
                                                value={qaFields.category_id}
                                                onChange={(e) => setQaFields((f) => ({ ...f, category_id: e.target.value }))}
                                                className="h-7 w-full rounded-md border border-g-input-border bg-g-input px-2 text-xs text-g-text focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                                              >
                                                <option value="">None</option>
                                                {categories.map((c) => (
                                                  <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                              </select>
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-g-text-3 mb-0.5 flex items-center gap-0.5">
                                                <Scale size={8} /> Weight (kg)
                                              </label>
                                              <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={qaFields.weight}
                                                onChange={(e) => setQaFields((f) => ({ ...f, weight: e.target.value }))}
                                                placeholder="0.00"
                                                className="h-7 w-full rounded-md border border-g-input-border bg-g-input px-2 text-xs text-g-text placeholder:text-g-text-4 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-g-text-3 mb-0.5 flex items-center gap-0.5">
                                                <Tag size={8} /> Price
                                              </label>
                                              <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={qaFields.price}
                                                onChange={(e) => setQaFields((f) => ({ ...f, price: e.target.value }))}
                                                placeholder="0.00"
                                                className="h-7 w-full rounded-md border border-g-input-border bg-g-input px-2 text-xs text-g-text placeholder:text-g-text-4 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 pt-0.5">
                                            <button
                                              type="button"
                                              onClick={() => handleQuickAdd(detail.keyword)}
                                              disabled={addingKeyword === detail.keyword}
                                              className="flex items-center gap-1 rounded-lg bg-g-accent-hover px-3 py-1.5 text-[11px] font-medium text-g-accent hover:bg-g-accent-hover disabled:opacity-50 transition-colors"
                                            >
                                              {addingKeyword === detail.keyword ? (
                                                <Loader2 size={10} className="animate-spin" />
                                              ) : (
                                                <Plus size={10} />
                                              )}
                                              Add to gear
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setQuickAddForm(null)}
                                              className="text-[11px] text-g-text-4 hover:text-g-text-2 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>

                            {/* Remove button */}
                            {skillLevel ? (
                              <button
                                type="button"
                                onClick={() => handleRemove(activity.slug)}
                                className="flex items-center gap-1 text-xs text-g-text-4 hover:text-g-error-text transition-colors"
                              >
                                <Minus size={10} />
                                Remove from my activities
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Gear detail overlay */}
      <GearDetailOverlay
        item={selectedGearItem}
        categories={categories}
        onClose={() => {
          setSelectedGearItem(null);
          router.refresh();
        }}
      />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3">
      {icon}
      <div>
        <p className="text-xl font-semibold text-g-text">{value}</p>
        <p className="text-xs text-g-text-3">{label}</p>
      </div>
    </div>
  );
}
