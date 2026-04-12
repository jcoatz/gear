export type TagGroup = "Activity" | "Season" | "Climate";

export const TAG_GROUPS: { group: TagGroup; tags: string[] }[] = [
  {
    group: "Activity",
    tags: [
      "Backpacking",
      "Day Hiking",
      "Climbing",
      "Trail Running",
      "Car Camping",
      "Skiing",
    ],
  },
  {
    group: "Season",
    tags: ["Summer", "Winter", "All-Season", "Spring/Fall"],
  },
  {
    group: "Climate",
    tags: ["Hot & Dry", "Cold & Snow", "Wet & Rainy", "Temperate"],
  },
];

export const ALL_TAGS = TAG_GROUPS.flatMap((g) => g.tags);

const GROUP_LOOKUP = new Map<string, TagGroup>();
for (const g of TAG_GROUPS) {
  for (const t of g.tags) GROUP_LOOKUP.set(t, g.group);
}

export function getTagGroup(tag: string): TagGroup | undefined {
  return GROUP_LOOKUP.get(tag);
}

export const TAG_GROUP_COLORS: Record<TagGroup, { bg: string; text: string; border: string }> = {
  Activity: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  Season: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  Climate: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
};

export const TAG_GROUP_COLORS_DARK: Record<TagGroup, { bg: string; text: string; border: string }> = {
  Activity: { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30" },
  Season: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30" },
  Climate: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30" },
};
