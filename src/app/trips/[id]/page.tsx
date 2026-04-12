import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { TripDetail } from "./trip-detail";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/trips");
  }

  // Fetch trip
  const { data: trip } = await supabase
    .from("trips")
    .select("id, name, description, start_date, end_date, target_weight_kg")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!trip) notFound();

  // Fetch trip items with gear details
  const { data: tripItems } = await supabase
    .from("trip_items")
    .select(`
      id,
      gear_item_id,
      packed,
      sort_order,
      gear_items:gear_item_id (
        id, name, brand, model, condition, weight, category_id,
        categories ( name )
      )
    `)
    .eq("trip_id", id)
    .order("sort_order");

  // Fetch all user gear (for the pool)
  const { data: allGear } = await supabase
    .from("gear_items")
    .select(`
      id, name, brand, model, condition, weight, tags, category_id, wishlist,
      categories ( name )
    `)
    .order("created_at", { ascending: false });

  // Normalize
  const normalizedTripItems = (tripItems ?? []).map((ti) => {
    const gear = Array.isArray(ti.gear_items)
      ? ti.gear_items[0]
      : ti.gear_items;
    const cat = gear
      ? Array.isArray(gear.categories)
        ? gear.categories[0]
        : gear.categories
      : null;
    return {
      tripItemId: ti.id,
      gearItemId: ti.gear_item_id,
      packed: ti.packed,
      sortOrder: ti.sort_order,
      name: gear?.name ?? "Unknown",
      brand: gear?.brand ?? null,
      model: gear?.model ?? null,
      condition: gear?.condition ?? null,
      weight: gear?.weight ?? null,
      categoryName: cat?.name ?? null,
    };
  });

  const normalizedGear = (allGear ?? []).map((g) => {
    const cat = Array.isArray(g.categories)
      ? g.categories[0]
      : g.categories;
    return {
      id: g.id,
      name: g.name,
      brand: g.brand,
      model: g.model,
      condition: g.condition,
      weight: g.weight,
      tags: g.tags ?? [],
      categoryName: cat?.name ?? null,
      wishlist: g.wishlist ?? false,
    };
  });

  return (
    <div className="flex min-h-screen flex-col bg-g-page">
      <NavBar userEmail={user.email ?? ""} />
      <TripDetail
        trip={trip}
        tripItems={normalizedTripItems}
        allGear={normalizedGear}
      />
    </div>
  );
}
