"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export type CreateTripResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

export async function createTrip(input: {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  target_weight_kg?: number;
}): Promise<CreateTripResult> {
  if (!input.name?.trim()) {
    return { ok: false, message: "Trip name is required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }

  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      target_weight_kg: input.target_weight_kg ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/trips");
  return { ok: true, id: data.id };
}

export async function updateTrip(
  id: string,
  input: {
    name?: string;
    description?: string;
    start_date?: string | null;
    end_date?: string | null;
    target_weight_kg?: number | null;
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
  if (input.description !== undefined) updates.description = input.description?.trim() || null;
  if (input.start_date !== undefined) updates.start_date = input.start_date || null;
  if (input.end_date !== undefined) updates.end_date = input.end_date || null;
  if (input.target_weight_kg !== undefined) updates.target_weight_kg = input.target_weight_kg;

  const { error } = await supabase
    .from("trips")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/trips");
  revalidatePath(`/trips/${id}`);
  return { ok: true };
}

export async function deleteTrip(id: string): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be signed in." };

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/trips");
  return { ok: true };
}

export async function addItemToTrip(
  tripId: string,
  gearItemId: string,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be signed in." };

  // Verify trip ownership
  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .single();

  if (!trip) return { ok: false, message: "Trip not found." };

  // Get next sort order
  const { count } = await supabase
    .from("trip_items")
    .select("*", { count: "exact", head: true })
    .eq("trip_id", tripId);

  const { error } = await supabase.from("trip_items").insert({
    trip_id: tripId,
    gear_item_id: gearItemId,
    sort_order: (count ?? 0) + 1,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Item already in trip." };
    }
    return { ok: false, message: error.message };
  }

  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function removeItemFromTrip(
  tripId: string,
  gearItemId: string,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be signed in." };

  const { error } = await supabase
    .from("trip_items")
    .delete()
    .eq("trip_id", tripId)
    .eq("gear_item_id", gearItemId);

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function togglePacked(
  tripItemId: string,
  packed: boolean,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be signed in." };

  const { error } = await supabase
    .from("trip_items")
    .update({ packed })
    .eq("id", tripItemId);

  if (error) return { ok: false, message: error.message };

  return { ok: true };
}
