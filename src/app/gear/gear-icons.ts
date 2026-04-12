import type { LucideIcon } from "lucide-react";
import {
  Axe,
  Backpack,
  Binoculars,
  Bluetooth,
  Bone,
  Compass,
  Cookie,
  Droplets,
  Flame,
  Flashlight,
  Footprints,
  GlassWater,
  Hammer,
  HardHat,
  Layers,
  LifeBuoy,
  Map,
  Moon,
  Mountain,
  Package,
  Plug,
  Shirt,
  ShieldAlert,
  Snowflake,
  Sun,
  Tent,
  Thermometer,
  TreePine,
  Umbrella,
  Utensils,
  Watch,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

type IconRule = {
  keywords: string[];
  icon: LucideIcon;
};

/**
 * Ordered rules — first match wins.
 * Keywords are matched case-insensitively against item name + brand + category.
 */
const ICON_RULES: IconRule[] = [
  // Shelter
  { keywords: ["tent", "tarp", "shelter", "bivy", "bivvy"], icon: Tent },
  { keywords: ["hammock"], icon: TreePine },

  // Sleep
  { keywords: ["sleeping bag", "quilt"], icon: Moon },
  { keywords: ["sleeping pad", "mattress", "air mattress"], icon: Layers },
  { keywords: ["pillow"], icon: Moon },

  // Cooking / water
  { keywords: ["stove", "burner", "jetboil"], icon: Flame },
  { keywords: ["pot", "pan", "cookware", "cook set"], icon: Utensils },
  { keywords: ["cooler", "ice chest"], icon: Snowflake },
  { keywords: ["water filter", "purifier", "katadyn"], icon: Droplets },
  { keywords: ["water bottle", "nalgene", "flask", "hydration"], icon: GlassWater },
  { keywords: ["mug", "cup", "bowl", "spork", "fork", "knife", "utensil"], icon: Utensils },
  { keywords: ["food", "snack", "meal", "bar", "energy"], icon: Cookie },

  // Light / navigation
  { keywords: ["headlamp", "flashlight", "lantern", "light"], icon: Flashlight },
  { keywords: ["compass"], icon: Compass },
  { keywords: ["map", "gps", "garmin", "inreach"], icon: Map },
  { keywords: ["binocular"], icon: Binoculars },
  { keywords: ["watch"], icon: Watch },

  // Clothing
  { keywords: ["jacket", "shell", "rain jacket", "windbreaker"], icon: Wind },
  { keywords: ["boot", "shoe", "trail runner", "sandal", "gaiter"], icon: Footprints },
  { keywords: ["hat", "cap", "beanie", "balaclava", "buff"], icon: Sun },
  { keywords: ["glove", "mitt"], icon: Snowflake },
  { keywords: ["shirt", "top", "jersey", "base layer", "fleece", "hoodie", "vest", "pant", "short", "sock", "underwear", "insulated"], icon: Shirt },

  // Climbing / safety
  { keywords: ["harness", "carabiner", "quickdraw", "belay", "ascend", "descend"], icon: Mountain },
  { keywords: ["rope"], icon: Mountain },
  { keywords: ["helmet", "hard hat"], icon: HardHat },
  { keywords: ["chalk"], icon: Mountain },
  { keywords: ["crampon", "ice axe", "ice tool"], icon: Axe },
  { keywords: ["avalanche", "beacon", "probe"], icon: ShieldAlert },
  { keywords: ["shovel"], icon: Axe },
  { keywords: ["first aid", "med kit", "emergency"], icon: ShieldAlert },
  { keywords: ["life jacket", "pfd", "throw bag"], icon: LifeBuoy },
  { keywords: ["whistle", "signal"], icon: ShieldAlert },

  // Packs
  { keywords: ["backpack", "pack", "daypack", "running vest", "duffel", "dry bag", "stuff sack"], icon: Backpack },

  // Tools / misc
  { keywords: ["trekking pole", "hiking pole", "walking stick"], icon: Mountain },
  { keywords: ["knife", "multi-tool", "leatherman"], icon: Wrench },
  { keywords: ["axe", "hatchet", "saw"], icon: Axe },
  { keywords: ["hammer", "mallet", "stake"], icon: Hammer },
  { keywords: ["repair", "patch", "duct tape"], icon: Wrench },

  // Electronics
  { keywords: ["battery", "power bank", "charger", "solar"], icon: Zap },
  { keywords: ["speaker", "bluetooth"], icon: Bluetooth },
  { keywords: ["camera", "gopro", "phone"], icon: Plug },

  // Winter
  { keywords: ["snowshoe", "ski", "pole"], icon: Snowflake },

  // Misc
  { keywords: ["thermometer", "weather"], icon: Thermometer },
  { keywords: ["umbrella"], icon: Umbrella },
  { keywords: ["chair", "table", "furniture", "camp chair"], icon: TreePine },
  { keywords: ["towel"], icon: Droplets },
  { keywords: ["sunscreen", "sunblock", "bug spray", "insect"], icon: Sun },
  { keywords: ["bear canister", "bear spray", "bear"], icon: Bone },
];

/** Category-level fallback icons */
const CATEGORY_FALLBACKS: Record<string, LucideIcon> = {
  "Tents & Shelters": Tent,
  "Sleep Systems": Moon,
  Cooking: Flame,
  Clothing: Shirt,
  Navigation: Compass,
  Safety: ShieldAlert,
  Other: Package,
};

/**
 * Returns the best matching icon for a gear item.
 * Checks item name, brand, and category name against keyword rules.
 */
export function getGearIcon(
  name: string,
  brand?: string | null,
  categoryName?: string | null,
): LucideIcon {
  const haystack = [name, brand ?? "", categoryName ?? ""]
    .join(" ")
    .toLowerCase();

  for (const rule of ICON_RULES) {
    for (const kw of rule.keywords) {
      if (haystack.includes(kw)) {
        return rule.icon;
      }
    }
  }

  // Fallback to category icon
  if (categoryName && CATEGORY_FALLBACKS[categoryName]) {
    return CATEGORY_FALLBACKS[categoryName];
  }

  return Package;
}
