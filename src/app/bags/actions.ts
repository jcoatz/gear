"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export type BagResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

const BAG_TYPES = [
  "backpack",
  "daypack",
  "duffel",
  "stuff_sack",
  "dry_bag",
  "hip_pack",
  "other",
] as const;

export type BagType = (typeof BAG_TYPES)[number];

export async function createBag(input: {
  name: string;
  brand?: string;
  model?: string;
  color?: string;
  volume_liters?: number;
  max_weight_kg?: number;
  own_weight_kg?: number;
  bag_type?: string;
  notes?: string;
}): Promise<BagResult> {
  if (!input.name?.trim()) {
    return { ok: false, message: "Bag name is required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  const { data, error } = await supabase
    .from("bags")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      brand: input.brand?.trim() || null,
      model: input.model?.trim() || null,
      color: input.color?.trim() || null,
      volume_liters: input.volume_liters ?? null,
      max_weight_kg: input.max_weight_kg ?? null,
      own_weight_kg: input.own_weight_kg ?? null,
      bag_type: BAG_TYPES.includes(input.bag_type as BagType) ? input.bag_type : "backpack",
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  revalidatePath("/gear");
  revalidatePath("/trips");
  return { ok: true, id: data.id };
}

export async function updateBag(
  id: string,
  input: {
    name?: string;
    brand?: string;
    model?: string;
    color?: string;
    volume_liters?: number | null;
    max_weight_kg?: number | null;
    own_weight_kg?: number | null;
    bag_type?: string;
    notes?: string;
  },
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.brand !== undefined) updates.brand = input.brand?.trim() || null;
  if (input.model !== undefined) updates.model = input.model?.trim() || null;
  if (input.color !== undefined) updates.color = input.color?.trim() || null;
  if (input.volume_liters !== undefined) updates.volume_liters = input.volume_liters;
  if (input.max_weight_kg !== undefined) updates.max_weight_kg = input.max_weight_kg;
  if (input.own_weight_kg !== undefined) updates.own_weight_kg = input.own_weight_kg;
  if (input.bag_type !== undefined && BAG_TYPES.includes(input.bag_type as BagType)) {
    updates.bag_type = input.bag_type;
  }
  if (input.notes !== undefined) updates.notes = input.notes?.trim() || null;

  const { error } = await supabase
    .from("bags")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/gear");
  revalidatePath("/trips");
  return { ok: true };
}

export async function deleteBag(id: string): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  const { error } = await supabase
    .from("bags")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/gear");
  revalidatePath("/trips");
  return { ok: true };
}

// Trip bag assignment actions

export async function addBagToTrip(
  tripId: string,
  bagId: string,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  const { error } = await supabase.from("trip_bags").insert({
    trip_id: tripId,
    bag_id: bagId,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, message: "Bag already added." };
    return { ok: false, message: error.message };
  }

  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function removeBagFromTrip(
  tripId: string,
  bagId: string,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  // Unassign items from this bag first
  await supabase
    .from("trip_items")
    .update({ bag_id: null })
    .eq("trip_id", tripId)
    .eq("bag_id", bagId);

  const { error } = await supabase
    .from("trip_bags")
    .delete()
    .eq("trip_id", tripId)
    .eq("bag_id", bagId);

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function assignItemToBag(
  tripItemId: string,
  bagId: string | null,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  const { error } = await supabase
    .from("trip_items")
    .update({ bag_id: bagId })
    .eq("id", tripItemId);

  if (error) return { ok: false, message: error.message };

  return { ok: true };
}
