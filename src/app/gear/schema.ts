import { z } from "zod";

export const GEAR_CONDITIONS = [
  "new",
  "like_new",
  "good",
  "fair",
  "poor",
] as const;

export const gearItemFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string(),
  model: z.string(),
  category_id: z.string().uuid("Select a category"),
  condition: z.enum(GEAR_CONDITIONS),
  weight: z.string(),
  notes: z.string(),
  tags: z.array(z.string()),
});

export type GearItemFormValues = z.infer<typeof gearItemFormSchema>;

export const CONDITION_LABELS: Record<(typeof GEAR_CONDITIONS)[number], string> =
  {
    new: "New",
    like_new: "Like new",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
  };

export const CONDITION_ORDER: Record<string, number> = {
  new: 0,
  like_new: 1,
  good: 2,
  fair: 3,
  poor: 4,
};

export const bulkGearItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.any(),
  category_id: z.any(),
  condition: z.enum(GEAR_CONDITIONS),
  weight: z.any(),
  tags: z.any(),
});

export type BulkGearItem = {
  name: string;
  brand: string | null;
  category_id: string | null;
  condition: (typeof GEAR_CONDITIONS)[number];
  weight: number | null;
  tags?: string[];
};

export const bulkGearItemsSchema = z.array(bulkGearItemSchema).min(1).max(50);
