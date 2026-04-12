import {
  Anchor,
  Axe,
  Bike,
  Compass,
  Fish,
  Flame,
  Footprints,
  Mountain,
  MountainSnow,
  Sailboat,
  Snowflake,
  Tent,
  TreePine,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

// ── Skill levels ──────────────────────────────────────────────
export const SKILL_LEVELS = [
  "want_to_try",
  "tried_it",
  "sometimes",
  "often",
  "pro",
] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const SKILL_LABELS: Record<SkillLevel, string> = {
  want_to_try: "Want to try",
  tried_it: "Tried it",
  sometimes: "Sometimes",
  often: "Often",
  pro: "Pro",
};

export const SKILL_COLORS: Record<SkillLevel, { bg: string; text: string; border: string; ring: string }> = {
  want_to_try: { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/30", ring: "ring-violet-500/40" },
  tried_it:    { bg: "bg-sky-500/15",    text: "text-sky-400",    border: "border-sky-500/30",    ring: "ring-sky-500/40" },
  sometimes:   { bg: "bg-amber-500/15",  text: "text-amber-400",  border: "border-amber-500/30",  ring: "ring-amber-500/40" },
  often:       { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", ring: "ring-emerald-500/40" },
  pro:         { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", ring: "ring-orange-500/40" },
};

export const SKILL_ICONS: Record<SkillLevel, string> = {
  want_to_try: "?",
  tried_it: "1",
  sometimes: "2",
  often: "3",
  pro: "5",
};

// ── Activity definition ───────────────────────────────────────
export type Activity = {
  slug: string;
  name: string;
  icon: LucideIcon;
  /** Gear keywords — if the user owns gear whose name contains any of these (case-insensitive), it counts */
  gearKeywords: string[];
  /** Gear categories that count toward readiness */
  gearCategories: string[];
};

export type ActivityGroup = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: { bg: string; text: string; border: string; glow: string };
  activities: Activity[];
};

// ── Groups & activities ───────────────────────────────────────
export const ACTIVITY_GROUPS: ActivityGroup[] = [
  {
    id: "hiking",
    name: "Hiking & Trekking",
    icon: Footprints,
    color: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25", glow: "shadow-emerald-500/10" },
    activities: [
      {
        slug: "day-hiking",
        name: "Day Hiking",
        icon: TreePine,
        gearKeywords: ["daypack", "trail runner", "hiking boot", "hiking shoe", "water bottle", "rain jacket", "sun hat", "trekking pole"],
        gearCategories: ["Clothing", "Navigation", "Safety"],
      },
      {
        slug: "backpacking",
        name: "Backpacking",
        icon: Compass,
        gearKeywords: ["backpack", "tent", "sleeping bag", "sleeping pad", "stove", "water filter", "headlamp", "trekking pole"],
        gearCategories: ["Tents & Shelters", "Sleep Systems", "Cooking", "Navigation", "Safety"],
      },
      {
        slug: "thru-hiking",
        name: "Thru-Hiking",
        icon: Mountain,
        gearKeywords: ["ultralight", "backpack", "tent", "sleeping bag", "sleeping pad", "stove", "water filter", "trekking pole", "trail runner"],
        gearCategories: ["Tents & Shelters", "Sleep Systems", "Cooking", "Navigation", "Clothing"],
      },
      {
        slug: "fastpacking",
        name: "Fastpacking",
        icon: Wind,
        gearKeywords: ["running vest", "trail runner", "bivy", "sleeping bag", "headlamp", "soft flask", "windbreaker"],
        gearCategories: ["Clothing", "Sleep Systems", "Navigation"],
      },
      {
        slug: "scrambling",
        name: "Scrambling",
        icon: Mountain,
        gearKeywords: ["helmet", "hiking boot", "glove", "daypack", "headlamp"],
        gearCategories: ["Safety", "Clothing"],
      },
    ],
  },
  {
    id: "climbing",
    name: "Climbing & Mountaineering",
    icon: Mountain,
    color: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/25", glow: "shadow-orange-500/10" },
    activities: [
      {
        slug: "sport-climbing",
        name: "Sport Climbing",
        icon: Mountain,
        gearKeywords: ["harness", "climbing shoe", "rope", "quickdraw", "belay device", "chalk", "helmet", "carabiner"],
        gearCategories: ["Safety"],
      },
      {
        slug: "trad-climbing",
        name: "Trad Climbing",
        icon: Mountain,
        gearKeywords: ["harness", "climbing shoe", "rope", "cam", "nut", "sling", "belay device", "chalk", "helmet"],
        gearCategories: ["Safety"],
      },
      {
        slug: "bouldering",
        name: "Bouldering",
        icon: Mountain,
        gearKeywords: ["climbing shoe", "chalk", "crash pad", "brush"],
        gearCategories: [],
      },
      {
        slug: "mountaineering",
        name: "Mountaineering",
        icon: MountainSnow,
        gearKeywords: ["ice axe", "crampon", "harness", "rope", "helmet", "mountaineering boot", "down jacket", "sleeping bag"],
        gearCategories: ["Safety", "Clothing", "Sleep Systems"],
      },
      {
        slug: "ice-climbing",
        name: "Ice Climbing",
        icon: Snowflake,
        gearKeywords: ["ice axe", "ice tool", "crampon", "harness", "rope", "helmet", "ice screw"],
        gearCategories: ["Safety"],
      },
      {
        slug: "via-ferrata",
        name: "Via Ferrata",
        icon: Anchor,
        gearKeywords: ["harness", "via ferrata set", "helmet", "climbing shoe", "glove"],
        gearCategories: ["Safety"],
      },
    ],
  },
  {
    id: "water",
    name: "Water Sports",
    icon: Waves,
    color: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/25", glow: "shadow-sky-500/10" },
    activities: [
      {
        slug: "kayaking",
        name: "Kayaking",
        icon: Sailboat,
        gearKeywords: ["kayak", "paddle", "pfd", "life jacket", "dry bag", "spray skirt", "wetsuit"],
        gearCategories: ["Safety"],
      },
      {
        slug: "canoeing",
        name: "Canoeing",
        icon: Sailboat,
        gearKeywords: ["canoe", "paddle", "pfd", "life jacket", "dry bag"],
        gearCategories: ["Safety"],
      },
      {
        slug: "sup",
        name: "Stand-Up Paddleboarding",
        icon: Waves,
        gearKeywords: ["paddle board", "sup", "paddle", "pfd", "life jacket", "leash"],
        gearCategories: [],
      },
      {
        slug: "surfing",
        name: "Surfing",
        icon: Waves,
        gearKeywords: ["surfboard", "wetsuit", "leash", "wax", "rash guard"],
        gearCategories: ["Clothing"],
      },
      {
        slug: "whitewater",
        name: "Whitewater Rafting",
        icon: Waves,
        gearKeywords: ["raft", "paddle", "pfd", "life jacket", "helmet", "dry suit", "wetsuit", "throw bag"],
        gearCategories: ["Safety"],
      },
      {
        slug: "fishing",
        name: "Fishing",
        icon: Fish,
        gearKeywords: ["rod", "reel", "tackle", "wader", "net", "fly", "lure"],
        gearCategories: [],
      },
    ],
  },
  {
    id: "winter",
    name: "Winter Sports",
    icon: Snowflake,
    color: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/25", glow: "shadow-cyan-500/10" },
    activities: [
      {
        slug: "downhill-skiing",
        name: "Downhill Skiing",
        icon: MountainSnow,
        gearKeywords: ["ski", "ski boot", "pole", "helmet", "goggle", "ski jacket", "ski pant"],
        gearCategories: ["Clothing", "Safety"],
      },
      {
        slug: "cross-country-skiing",
        name: "Cross-Country Skiing",
        icon: TreePine,
        gearKeywords: ["cross-country ski", "xc ski", "nordic ski", "ski boot", "pole"],
        gearCategories: ["Clothing"],
      },
      {
        slug: "snowboarding",
        name: "Snowboarding",
        icon: MountainSnow,
        gearKeywords: ["snowboard", "binding", "snowboard boot", "helmet", "goggle"],
        gearCategories: ["Clothing", "Safety"],
      },
      {
        slug: "snowshoeing",
        name: "Snowshoeing",
        icon: Footprints,
        gearKeywords: ["snowshoe", "pole", "gaiter", "insulated boot"],
        gearCategories: ["Clothing"],
      },
      {
        slug: "backcountry-skiing",
        name: "Backcountry Skiing",
        icon: Mountain,
        gearKeywords: ["touring ski", "skin", "beacon", "probe", "shovel", "avalanche", "ski boot"],
        gearCategories: ["Safety", "Clothing"],
      },
    ],
  },
  {
    id: "cycling",
    name: "Cycling",
    icon: Bike,
    color: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/25", glow: "shadow-rose-500/10" },
    activities: [
      {
        slug: "road-cycling",
        name: "Road Cycling",
        icon: Bike,
        gearKeywords: ["road bike", "helmet", "cycling jersey", "cycling short", "cycling shoe", "pedal"],
        gearCategories: ["Clothing", "Safety"],
      },
      {
        slug: "mountain-biking",
        name: "Mountain Biking",
        icon: Bike,
        gearKeywords: ["mountain bike", "mtb", "helmet", "glove", "knee pad", "cycling shoe"],
        gearCategories: ["Safety", "Clothing"],
      },
      {
        slug: "bikepacking",
        name: "Bikepacking",
        icon: Bike,
        gearKeywords: ["bike", "bikepacking bag", "frame bag", "handlebar bag", "tent", "sleeping bag", "stove"],
        gearCategories: ["Tents & Shelters", "Sleep Systems", "Cooking"],
      },
      {
        slug: "gravel-riding",
        name: "Gravel Riding",
        icon: Bike,
        gearKeywords: ["gravel bike", "helmet", "cycling jersey", "cycling shoe"],
        gearCategories: ["Clothing", "Safety"],
      },
    ],
  },
  {
    id: "running",
    name: "Running",
    icon: Footprints,
    color: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/25", glow: "shadow-indigo-500/10" },
    activities: [
      {
        slug: "trail-running",
        name: "Trail Running",
        icon: Footprints,
        gearKeywords: ["trail runner", "running vest", "soft flask", "headlamp", "windbreaker"],
        gearCategories: ["Clothing", "Navigation"],
      },
      {
        slug: "ultra-running",
        name: "Ultra Running",
        icon: Footprints,
        gearKeywords: ["running vest", "trail runner", "soft flask", "headlamp", "emergency blanket", "drop bag", "crew bag"],
        gearCategories: ["Clothing", "Navigation", "Safety"],
      },
      {
        slug: "road-running",
        name: "Road Running",
        icon: Footprints,
        gearKeywords: ["running shoe", "running short", "running watch", "water bottle"],
        gearCategories: ["Clothing"],
      },
    ],
  },
  {
    id: "camping",
    name: "Camping",
    icon: Tent,
    color: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/25", glow: "shadow-amber-500/10" },
    activities: [
      {
        slug: "car-camping",
        name: "Car Camping",
        icon: Tent,
        gearKeywords: ["tent", "sleeping bag", "camp stove", "cooler", "camp chair", "lantern", "air mattress", "camp table"],
        gearCategories: ["Tents & Shelters", "Sleep Systems", "Cooking"],
      },
      {
        slug: "ultralight-camping",
        name: "Ultralight Camping",
        icon: Flame,
        gearKeywords: ["ultralight tent", "tarp", "quilt", "sleeping pad", "alcohol stove", "titanium"],
        gearCategories: ["Tents & Shelters", "Sleep Systems", "Cooking"],
      },
      {
        slug: "hammock-camping",
        name: "Hammock Camping",
        icon: TreePine,
        gearKeywords: ["hammock", "tarp", "underquilt", "top quilt", "strap", "ridgeline"],
        gearCategories: ["Tents & Shelters", "Sleep Systems"],
      },
      {
        slug: "winter-camping",
        name: "Winter Camping",
        icon: Snowflake,
        gearKeywords: ["4-season tent", "winter sleeping bag", "insulated pad", "liquid fuel stove", "snow shovel"],
        gearCategories: ["Tents & Shelters", "Sleep Systems", "Cooking", "Safety"],
      },
    ],
  },
  {
    id: "other",
    name: "Other Adventures",
    icon: Axe,
    color: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", border: "border-fuchsia-500/25", glow: "shadow-fuchsia-500/10" },
    activities: [
      {
        slug: "paragliding",
        name: "Paragliding",
        icon: Wind,
        gearKeywords: ["paraglider", "wing", "harness", "reserve", "helmet", "variometer"],
        gearCategories: ["Safety"],
      },
      {
        slug: "canyoneering",
        name: "Canyoneering",
        icon: Mountain,
        gearKeywords: ["harness", "rope", "wetsuit", "helmet", "descender", "carabiner", "dry bag"],
        gearCategories: ["Safety"],
      },
      {
        slug: "orienteering",
        name: "Orienteering",
        icon: Compass,
        gearKeywords: ["compass", "map", "headlamp", "whistle", "trail runner"],
        gearCategories: ["Navigation"],
      },
    ],
  },
];

export const ALL_ACTIVITIES = ACTIVITY_GROUPS.flatMap((g) => g.activities);

const ACTIVITY_LOOKUP = new Map<string, Activity>();
for (const a of ALL_ACTIVITIES) ACTIVITY_LOOKUP.set(a.slug, a);

export function getActivity(slug: string): Activity | undefined {
  return ACTIVITY_LOOKUP.get(slug);
}

const GROUP_LOOKUP = new Map<string, ActivityGroup>();
for (const g of ACTIVITY_GROUPS) {
  for (const a of g.activities) GROUP_LOOKUP.set(a.slug, g);
}

export function getActivityGroup(slug: string): ActivityGroup | undefined {
  return GROUP_LOOKUP.get(slug);
}
