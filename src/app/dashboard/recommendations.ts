import {
  ACTIVITY_GROUPS,
  SKILL_LABELS,
  type SkillLevel,
} from "@/app/activities/activity-data";

export type GearRecommendation = {
  keyword: string;
  activities: { slug: string; name: string; skillLevel: string }[];
};

type GearItem = {
  name: string;
  categoryName: string | null;
};

/**
 * Finds gear keywords the user is missing across their selected activities.
 * Groups by keyword so "tent" isn't listed 3 times if needed by 3 activities.
 */
export function getRecommendations(
  userActivities: Record<string, string>,
  userGear: GearItem[],
): GearRecommendation[] {
  const keywordMap = new Map<string, GearRecommendation>();

  for (const group of ACTIVITY_GROUPS) {
    for (const activity of group.activities) {
      const skillLevel = userActivities[activity.slug];
      if (!skillLevel) continue;

      for (const keyword of activity.gearKeywords) {
        const kw = keyword.toLowerCase();
        const hasGear = userGear.some(
          (g) =>
            g.name.toLowerCase().includes(kw) ||
            (g.categoryName &&
              activity.gearCategories.includes(g.categoryName)),
        );

        if (!hasGear) {
          const existing = keywordMap.get(kw);
          const actEntry = {
            slug: activity.slug,
            name: activity.name,
            skillLevel: SKILL_LABELS[skillLevel as SkillLevel] ?? skillLevel,
          };

          if (existing) {
            if (!existing.activities.some((a) => a.slug === activity.slug)) {
              existing.activities.push(actEntry);
            }
          } else {
            keywordMap.set(kw, {
              keyword,
              activities: [actEntry],
            });
          }
        }
      }
    }
  }

  // Sort: most-needed gear first (referenced by the most activities)
  return Array.from(keywordMap.values()).sort(
    (a, b) => b.activities.length - a.activities.length,
  );
}
