"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ALL_TAGS } from "./tags";
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
    tags: parsed.data.tags ?? [],
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

  const rows = parsed.data.map((item) => {
    const brand = typeof item.brand === "string" ? item.brand.trim() || null : null;
    const categoryId =
      typeof item.category_id === "string" && item.category_id.length > 0
        ? item.category_id
        : null;
    const weight =
      typeof item.weight === "number" && !Number.isNaN(item.weight)
        ? item.weight
        : null;
    const tags = Array.isArray(item.tags)
      ? item.tags.filter((t: unknown) => typeof t === "string")
      : [];

    return {
      user_id: user.id,
      name: item.name.trim(),
      brand,
      model: null,
      category_id: categoryId,
      condition: item.condition,
      weight,
      notes: null,
      tags,
    };
  });

  const { error } = await supabase.from("gear_items").insert(rows);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/gear");
  return { ok: true, count: rows.length };
}

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function deleteGearItem(id: string): Promise<ActionResult> {
  if (!id || typeof id !== "string") {
    return { ok: false, message: "Invalid item ID." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }

  const { error } = await supabase
    .from("gear_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/gear");
  return { ok: true };
}

export type UpdateGearItemInput = {
  name: string;
  brand: string;
  model: string;
  category_id: string;
  condition: string;
  weight: string;
  notes: string;
};

export async function updateGearItem(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  if (!id || typeof id !== "string") {
    return { ok: false, message: "Invalid item ID." };
  }

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

  const { error } = await supabase
    .from("gear_items")
    .update({
      name: parsed.data.name.trim(),
      brand: parsed.data.brand.trim() || null,
      model: parsed.data.model.trim() || null,
      category_id: parsed.data.category_id,
      condition: parsed.data.condition,
      weight,
      notes: parsed.data.notes.trim() || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/gear");
  return { ok: true };
}

export async function toggleWishlist(
  id: string,
  wishlist: boolean,
): Promise<ActionResult> {
  if (!id || typeof id !== "string") {
    return { ok: false, message: "Invalid item ID." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }

  const { error } = await supabase
    .from("gear_items")
    .update({ wishlist })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/gear");
  return { ok: true };
}

export async function updateGearItemTags(
  id: string,
  tags: string[],
): Promise<ActionResult> {
  if (!id || typeof id !== "string") {
    return { ok: false, message: "Invalid item ID." };
  }

  const validTags = tags.filter((t) => ALL_TAGS.includes(t));

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }

  const { error } = await supabase
    .from("gear_items")
    .update({ tags: validTags })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/gear");
  return { ok: true };
}
