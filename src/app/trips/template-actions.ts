"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function saveAsTemplate(
  tripId: string,
  name: string,
  description?: string,
): Promise<ActionResult> {
  if (!name.trim()) {
    return { ok: false, message: "Template name is required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }

  // Get trip items
  const { data: tripItems, error: fetchError } = await supabase
    .from("trip_items")
    .select("gear_item_id, sort_order")
    .eq("trip_id", tripId);

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }

  if (!tripItems || tripItems.length === 0) {
    return { ok: false, message: "Trip has no items to save as a template." };
  }

  // Create template
  const { data: template, error: createError } = await supabase
    .from("pack_templates")
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
    })
    .select("id")
    .single();

  if (createError || !template) {
    return { ok: false, message: createError?.message ?? "Failed to create template." };
  }

  // Insert template items
  const templateItems = tripItems.map((ti) => ({
    template_id: template.id,
    gear_item_id: ti.gear_item_id,
    sort_order: ti.sort_order,
  }));

  const { error: itemsError } = await supabase
    .from("pack_template_items")
    .insert(templateItems);

  if (itemsError) {
    return { ok: false, message: itemsError.message };
  }

  revalidatePath("/trips");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createTripFromTemplate(
  templateId: string,
  tripName: string,
): Promise<{ ok: true; tripId: string } | { ok: false; message: string }> {
  if (!tripName.trim()) {
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

  // Fetch template items
  const { data: templateItems, error: fetchError } = await supabase
    .from("pack_template_items")
    .select("gear_item_id, sort_order")
    .eq("template_id", templateId)
    .order("sort_order");

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }

  // Create trip
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      name: tripName.trim(),
    })
    .select("id")
    .single();

  if (tripError || !trip) {
    return { ok: false, message: tripError?.message ?? "Failed to create trip." };
  }

  // Add items from template
  if (templateItems && templateItems.length > 0) {
    const items = templateItems.map((ti) => ({
      trip_id: trip.id,
      gear_item_id: ti.gear_item_id,
      sort_order: ti.sort_order,
      packed: false,
    }));

    const { error: itemsError } = await supabase
      .from("trip_items")
      .insert(items);

    if (itemsError) {
      return { ok: false, message: itemsError.message };
    }
  }

  revalidatePath("/trips");
  return { ok: true, tripId: trip.id };
}

export async function deleteTemplate(templateId: string): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }

  const { error } = await supabase
    .from("pack_templates")
    .delete()
    .eq("id", templateId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/trips");
  revalidatePath("/dashboard");
  return { ok: true };
}
