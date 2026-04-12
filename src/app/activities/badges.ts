import type { Activity } from "./activity-data";

export type BadgeLevel = "none" | "some" | "most" | "ready";

export type GearMatch = {
  keyword: string;
  matched: boolean;
  /** The user's gear item name that matched, if any */
  matchedItem: string | null;
  /** The user's gear item ID that matched, if any */
  matchedItemId: string | null;
};

export type Badge = {
  level: BadgeLevel;
  label: string;
  matchedCount: number;
  totalRequired: number;
  fraction: number;
  /** Per-keyword breakdown showing what matched and what's missing */
  details: GearMatch[];
};

export const BADGE_CONFIG: Record<BadgeLevel, { bg: string; text: string; border: string; icon: string }> = {
  none:  { bg: "bg-g-raised",         text: "text-g-text-4",    border: "border-g-border",          icon: "?" },
  some:  { bg: "bg-amber-500/15",     text: "text-amber-600 dark:text-amber-400",     border: "border-amber-500/30",      icon: "1" },
  most:  { bg: "bg-sky-500/15",       text: "text-sky-600 dark:text-sky-400",       border: "border-sky-500/30",        icon: "2" },
  ready: { bg: "bg-emerald-500/15",   text: "text-emerald-600 dark:text-emerald-400",   border: "border-emerald-500/30",    icon: "3" },
};

export const BADGE_LABELS: Record<BadgeLevel, string> = {
  none: "No gear",
  some: "Getting started",
  most: "Almost there",
  ready: "Gear ready",
};

type GearItem = {
  id: string;
  name: string;
  categoryName: string | null;
};

export function computeBadge(activity: Activity, userGear: GearItem[]): Badge {
  const keywords = activity.gearKeywords;
  const categories = activity.gearCategories;
  const totalRequired = keywords.length;

  if (totalRequired === 0) {
    return { level: "ready", label: BADGE_LABELS.ready, matchedCount: 0, totalRequired: 0, fraction: 1, details: [] };
  }

  const details: GearMatch[] = [];
  let matchedCount = 0;

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();
    const matchedGear = userGear.find(
      (g) =>
        g.name.toLowerCase().includes(kw) ||
        (g.categoryName && categories.includes(g.categoryName)),
    );

    if (matchedGear) {
      matchedCount++;
      details.push({ keyword, matched: true, matchedItem: matchedGear.name, matchedItemId: matchedGear.id });
    } else {
      details.push({ keyword, matched: false, matchedItem: null, matchedItemId: null });
    }
  }

  // Category boost
  const categoryMatches = new Set<string>();
  for (const g of userGear) {
    if (g.categoryName && categories.includes(g.categoryName)) {
      categoryMatches.add(g.categoryName);
    }
  }

  const keywordFraction = matchedCount / totalRequired;
  const categoryBoost = categories.length > 0
    ? (categoryMatches.size / categories.length) * 0.2
    : 0;
  const fraction = Math.min(1, keywordFraction + categoryBoost);

  let level: BadgeLevel;
  if (fraction >= 0.75) level = "ready";
  else if (fraction >= 0.4) level = "most";
  else if (fraction > 0) level = "some";
  else level = "none";

  // Sort: matched first, then missing
  details.sort((a, b) => (a.matched === b.matched ? 0 : a.matched ? -1 : 1));

  return {
    level,
    label: BADGE_LABELS[level],
    matchedCount,
    totalRequired,
    fraction,
    details,
  };
}
