import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Car,
  CloudSun,
  Flame,
  Footprints,
  Moon,
  Mountain,
  Package,
  ShieldAlert,
  Shirt,
  Snowflake,
  Tent,
} from "lucide-react";

export type GearTemplate = {
  name: string;
  suggestedBrand: string | null;
  categoryName: string;
  estimatedWeightKg: number | null;
};

export type GearPackage = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  items: GearTemplate[];
};

export const POPULAR_BRANDS = [
  "REI Co-op",
  "Osprey",
  "The North Face",
  "Patagonia",
  "Arc'teryx",
  "MSR",
  "Big Agnes",
  "Nemo",
  "Black Diamond",
  "Jetboil",
  "Gregory",
  "Sea to Summit",
  "Therm-a-Rest",
  "Salomon",
  "Petzl",
  "Hoka",
] as const;

export const GEAR_PACKAGES: GearPackage[] = [
  {
    id: "backpacking",
    name: "Backpacking Essentials",
    description: "Everything for a multi-day trip on the trail",
    icon: Tent,
    items: [
      { name: "Backpacking Tent", suggestedBrand: "Big Agnes", categoryName: "Tents & Shelters", estimatedWeightKg: 1.8 },
      { name: "Sleeping Bag", suggestedBrand: "Nemo", categoryName: "Sleep Systems", estimatedWeightKg: 0.9 },
      { name: "Sleeping Pad", suggestedBrand: "Therm-a-Rest", categoryName: "Sleep Systems", estimatedWeightKg: 0.5 },
      { name: "Backpack (50-65L)", suggestedBrand: "Osprey", categoryName: "Other", estimatedWeightKg: 2.0 },
      { name: "Camp Stove", suggestedBrand: "Jetboil", categoryName: "Cooking", estimatedWeightKg: 0.4 },
      { name: "Water Filter", suggestedBrand: "Katadyn", categoryName: "Cooking", estimatedWeightKg: 0.2 },
      { name: "Headlamp", suggestedBrand: "Black Diamond", categoryName: "Navigation", estimatedWeightKg: 0.08 },
      { name: "First Aid Kit", suggestedBrand: "Adventure Medical", categoryName: "Safety", estimatedWeightKg: 0.3 },
      { name: "Trekking Poles", suggestedBrand: "Black Diamond", categoryName: "Other", estimatedWeightKg: 0.5 },
    ],
  },
  {
    id: "day-hiking",
    name: "Day Hiking",
    description: "Light and fast for a day on the trail",
    icon: CloudSun,
    items: [
      { name: "Daypack (20-30L)", suggestedBrand: "Osprey", categoryName: "Other", estimatedWeightKg: 0.7 },
      { name: "Rain Jacket", suggestedBrand: "Patagonia", categoryName: "Clothing", estimatedWeightKg: 0.3 },
      { name: "Trail Runners", suggestedBrand: "Salomon", categoryName: "Clothing", estimatedWeightKg: 0.6 },
      { name: "Headlamp", suggestedBrand: "Black Diamond", categoryName: "Navigation", estimatedWeightKg: 0.08 },
      { name: "First Aid Kit", suggestedBrand: "Adventure Medical", categoryName: "Safety", estimatedWeightKg: 0.2 },
      { name: "Water Bottle", suggestedBrand: "Nalgene", categoryName: "Cooking", estimatedWeightKg: 0.18 },
      { name: "Sun Hat", suggestedBrand: "Sunday Afternoons", categoryName: "Clothing", estimatedWeightKg: 0.1 },
    ],
  },
  {
    id: "winter-camping",
    name: "Winter Camping",
    description: "Stay warm and safe in cold conditions",
    icon: Snowflake,
    items: [
      { name: "4-Season Tent", suggestedBrand: "The North Face", categoryName: "Tents & Shelters", estimatedWeightKg: 3.0 },
      { name: "Winter Sleeping Bag (-15C)", suggestedBrand: "Western Mountaineering", categoryName: "Sleep Systems", estimatedWeightKg: 1.4 },
      { name: "Insulated Sleeping Pad", suggestedBrand: "Therm-a-Rest", categoryName: "Sleep Systems", estimatedWeightKg: 0.7 },
      { name: "Liquid Fuel Stove", suggestedBrand: "MSR", categoryName: "Cooking", estimatedWeightKg: 0.6 },
      { name: "Insulated Jacket", suggestedBrand: "Arc'teryx", categoryName: "Clothing", estimatedWeightKg: 0.4 },
      { name: "Snow Shovel", suggestedBrand: "Black Diamond", categoryName: "Safety", estimatedWeightKg: 0.7 },
      { name: "Avalanche Beacon", suggestedBrand: "Mammut", categoryName: "Safety", estimatedWeightKg: 0.2 },
      { name: "Insulated Boots", suggestedBrand: "Salomon", categoryName: "Clothing", estimatedWeightKg: 0.9 },
    ],
  },
  {
    id: "trail-running",
    name: "Trail Running",
    description: "Move fast and light on technical terrain",
    icon: Footprints,
    items: [
      { name: "Running Vest (10-12L)", suggestedBrand: "Salomon", categoryName: "Other", estimatedWeightKg: 0.3 },
      { name: "Trail Runners", suggestedBrand: "Hoka", categoryName: "Clothing", estimatedWeightKg: 0.55 },
      { name: "Soft Flasks (x2)", suggestedBrand: "Salomon", categoryName: "Cooking", estimatedWeightKg: 0.06 },
      { name: "Emergency Blanket", suggestedBrand: "SOL", categoryName: "Safety", estimatedWeightKg: 0.07 },
      { name: "Running Headlamp", suggestedBrand: "Petzl", categoryName: "Navigation", estimatedWeightKg: 0.05 },
      { name: "Windbreaker", suggestedBrand: "Patagonia", categoryName: "Clothing", estimatedWeightKg: 0.15 },
    ],
  },
  {
    id: "car-camping",
    name: "Car Camping",
    description: "Comfort-first camping with vehicle access",
    icon: Car,
    items: [
      { name: "Family Tent (4-person)", suggestedBrand: "REI Co-op", categoryName: "Tents & Shelters", estimatedWeightKg: 5.5 },
      { name: "Camp Chairs (x2)", suggestedBrand: "REI Co-op", categoryName: "Other", estimatedWeightKg: 3.0 },
      { name: "Cooler", suggestedBrand: "Yeti", categoryName: "Cooking", estimatedWeightKg: 5.0 },
      { name: "Two-Burner Stove", suggestedBrand: "Coleman", categoryName: "Cooking", estimatedWeightKg: 3.5 },
      { name: "Sleeping Bag (comfort)", suggestedBrand: "REI Co-op", categoryName: "Sleep Systems", estimatedWeightKg: 1.5 },
      { name: "Camp Lantern", suggestedBrand: "BioLite", categoryName: "Navigation", estimatedWeightKg: 0.3 },
      { name: "Air Mattress", suggestedBrand: "Nemo", categoryName: "Sleep Systems", estimatedWeightKg: 1.2 },
      { name: "Camp Table", suggestedBrand: "REI Co-op", categoryName: "Other", estimatedWeightKg: 3.5 },
    ],
  },
  {
    id: "climbing",
    name: "Climbing",
    description: "Rock climbing and bouldering essentials",
    icon: Mountain,
    items: [
      { name: "Climbing Harness", suggestedBrand: "Black Diamond", categoryName: "Safety", estimatedWeightKg: 0.4 },
      { name: "Climbing Shoes", suggestedBrand: "La Sportiva", categoryName: "Clothing", estimatedWeightKg: 0.5 },
      { name: "Chalk Bag", suggestedBrand: "Black Diamond", categoryName: "Other", estimatedWeightKg: 0.1 },
      { name: "Helmet", suggestedBrand: "Petzl", categoryName: "Safety", estimatedWeightKg: 0.25 },
      { name: "Belay Device", suggestedBrand: "Petzl", categoryName: "Safety", estimatedWeightKg: 0.08 },
      { name: "Dynamic Rope (60m)", suggestedBrand: "Sterling", categoryName: "Safety", estimatedWeightKg: 3.8 },
      { name: "Quickdraws (set of 10)", suggestedBrand: "Black Diamond", categoryName: "Safety", estimatedWeightKg: 1.0 },
    ],
  },
];

export const PACKAGE_TAG_MAP: Record<string, string[]> = {
  backpacking: ["Backpacking", "All-Season"],
  "day-hiking": ["Day Hiking", "All-Season", "Temperate"],
  "winter-camping": ["Backpacking", "Winter", "Cold & Snow"],
  "trail-running": ["Trail Running", "Summer"],
  "car-camping": ["Car Camping", "All-Season", "Temperate"],
  climbing: ["Climbing", "All-Season"],
};

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Tents & Shelters": Tent,
  "Sleep Systems": Moon,
  Cooking: Flame,
  Clothing: Shirt,
  Navigation: Compass,
  Safety: ShieldAlert,
  Other: Package,
};
