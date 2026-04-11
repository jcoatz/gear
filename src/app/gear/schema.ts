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

export const bulkGearItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.union([z.string(), z.null()]),
  category_id: z.union([z.string().uuid(), z.null()]),
  condition: z.enum(GEAR_CONDITIONS),
  weight: z.union([z.number(), z.null()]),
});

export type BulkGearItem = z.infer<typeof bulkGearItemSchema>;

export const bulkGearItemsSchema = z.array(bulkGearItemSchema).min(1).max(50);
