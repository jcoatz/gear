"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { bulkGearItemsSchema, gearItemFormSchema } from "./schema";

export type AddGearItemResult =
  | { ok: true }
  | { ok: false; message: string };

export async function addGearItem(
  input: unknown,
): Promise<AddGearItemResult> {
  const parsed = gearItemFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields." };
  }

  const weightRaw = parsed.data.weight.trim();
  let weight: number | null = null;
  if (weightRaw.length > 0) {
    const n = Number(weightRaw);
    if (Number.isNaN(n)) {
      return { ok: false, message: "Weight must be a number." };
    }
    weight = n;
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }

  const { error } = await supabase.from("gear_items").insert({
    user_id: user.id,
    name: parsed.data.name.trim(),
    brand: parsed.data.brand.trim() || null,
    model: parsed.data.model.trim() || null,
    category_id: parsed.data.category_id,
    condition: parsed.data.condition,
    weight,
    notes: parsed.data.notes.trim() || null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/gear");
  return { ok: true };
}

export type AddGearItemsResult =
  | { ok: true; count: number }
  | { ok: false; message: string };

export async function addGearItems(
  input: unknown,
): Promise<AddGearItemsResult> {
  const parsed = bulkGearItemsSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error?.issues ?? [];
    const detail = issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return {
      ok: false,
      message: detail || "Invalid items. Please try again.",
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }

  const rows = parsed.data.map((item) => ({
    user_id: user.id,
    name: item.name.trim(),
    brand: item.brand?.trim() || null,
    model: null,
    category_id: item.category_id,
    condition: item.condition,
    weight: item.weight,
    notes: null,
  }));

  const { error } = await supabase.from("gear_items").insert(rows);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/gear");
  return { ok: true, count: rows.length };
}
