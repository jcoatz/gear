import {
  ACTIVITY_GROUPS,
  type Activity,
} from "@/app/activities/activity-data";
import type { GearPoolItem } from "./trip-detail";

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

export type SuggestionReason =
  | { type: "activity"; activityName: string }
  | { type: "frequency"; tripCount: number }
  | { type: "essential"; category: string }
  | { type: "tag_match"; tag: string };

export type GearSuggestion = {
  item: GearPoolItem;
  score: number;
  reasons: SuggestionReason[];
};

/* Essential categories — if you're going on a trip, you probably want
   at least one item from each of these */
const ESSENTIAL_CATEGORIES = [
  "Tents & Shelters",
  "Sleep Systems",
  "Cooking",
  "Navigation",
  "Safety",
  "Clothing",
];

/* ═══════════════════════════════════════════════
   Main suggestion engine
   ═══════════════════════════════════════════════ */

/**
 * Generates smart pack suggestions scored by:
 * 1. Activity relevance — gear keywords from the user's activities
 * 2. Past trip frequency — items packed most often in other trips
 * 3. Essential categories — at least 1 item per core category
 * 4. Tag matching — season/climate tags
 */
export function getSuggestions(
  availableGear: GearPoolItem[],
  userActivities: Record<string, string>,
  pastFrequency: Record<string, number>,
  maxResults = 12,
): GearSuggestion[] {
  if (availableGear.length === 0) return [];

  // Build a map of activity gear keywords → activity names
  const keywordActivityMap = new Map<string, string[]>();
  for (const group of ACTIVITY_GROUPS) {
    for (const activity of group.activities) {
      if (!userActivities[activity.slug]) continue;
      for (const kw of activity.gearKeywords) {
        const lower = kw.toLowerCase();
        const existing = keywordActivityMap.get(lower) ?? [];
        existing.push(activity.name);
        keywordActivityMap.set(lower, existing);
      }
    }
  }

  // Score each available gear item
  const suggestions: GearSuggestion[] = [];

  for (const item of availableGear) {
    if (item.wishlist) continue; // don't suggest wishlist items

    const reasons: SuggestionReason[] = [];
    let score = 0;
    const haystack = `${item.name} ${item.brand ?? ""}`.toLowerCase();

    // 1. Activity keyword matching
    const matchedActivities = new Set<string>();
    for (const [kw, activities] of keywordActivityMap) {
      if (haystack.includes(kw)) {
        for (const name of activities) {
          matchedActivities.add(name);
        }
      }
    }
    // Also check category-level matching
    if (item.categoryName) {
      for (const group of ACTIVITY_GROUPS) {
        for (const activity of group.activities) {
          if (!userActivities[activity.slug]) continue;
          if (activity.gearCategories.includes(item.categoryName)) {
            matchedActivities.add(activity.name);
          }
        }
      }
    }
    if (matchedActivities.size > 0) {
      score += matchedActivities.size * 3;
      // Add the top 2 activities as reasons
      const actArr = [...matchedActivities];
      for (const name of actArr.slice(0, 2)) {
        reasons.push({ type: "activity", activityName: name });
      }
    }

    // 2. Past trip frequency
    const freq = pastFrequency[item.id] ?? 0;
    if (freq > 0) {
      score += Math.min(freq, 5) * 2; // cap at 5 trips worth of score
      reasons.push({ type: "frequency", tripCount: freq });
    }

    // 3. Essential category
    if (item.categoryName && ESSENTIAL_CATEGORIES.includes(item.categoryName)) {
      score += 1;
      reasons.push({ type: "essential", category: item.categoryName });
    }

    // 4. Tag matching (activity tags boost items)
    for (const tag of item.tags) {
      const lower = tag.toLowerCase();
      if (
        lower.includes("backpacking") ||
        lower.includes("hiking") ||
        lower.includes("camping")
      ) {
        score += 1;
        reasons.push({ type: "tag_match", tag });
        break; // one tag reason is enough
      }
    }

    if (score > 0) {
      suggestions.push({ item, score, reasons });
    }
  }

  // Sort by score descending, then alphabetically
  suggestions.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name);
  });

  return suggestions.slice(0, maxResults);
}
