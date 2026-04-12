"use client";

import {
  Award,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Minus,
  Shield,
  Sparkles,
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
import { computeBadge, BADGE_CONFIG, BADGE_LABELS, type BadgeLevel } from "./badges";
import { setActivitySkill, removeActivity } from "./actions";

type ActivitiesClientProps = {
  userActivities: Record<string, string>;
  userGear: { name: string; categoryName: string | null }[];
};

export function ActivitiesClient({ userActivities, userGear }: ActivitiesClientProps) {
  const router = useRouter();
  const [activities, setActivities] = useState(userActivities);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(ACTIVITY_GROUPS.map((g) => g.id)),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

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

  // Stats
  const totalActive = Object.keys(activities).length;
  const proCount = Object.values(activities).filter((l) => l === "pro").length;
  const wantToTryCount = Object.values(activities).filter((l) => l === "want_to_try").length;

  // Badge summary
  const gearReadyCount = useMemo(() => {
    let count = 0;
    for (const group of ACTIVITY_GROUPS) {
      for (const activity of group.activities) {
        if (activities[activity.slug]) {
          const badge = computeBadge(activity, userGear);
          if (badge.level === "ready") count++;
        }
      }
    }
    return count;
  }, [activities, userGear]);

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
                    const badge = computeBadge(activity, userGear);
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

                            {/* Gear readiness detail */}
                            <div>
                              <p className="text-xs font-medium text-g-text-3 mb-1.5">
                                Gear readiness
                              </p>
                              {/* Progress bar */}
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-g-raised overflow-hidden">
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
                                <span className={`text-xs font-medium ${badgeConf.text}`}>
                                  {BADGE_LABELS[badge.level]}
                                </span>
                              </div>
                              {badge.totalRequired > 0 ? (
                                <p className="mt-1 text-xs text-g-text-4">
                                  {badge.matchedCount} of {badge.totalRequired} gear
                                  items matched
                                </p>
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
