import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  // Run all queries in parallel
  const [
    { data: gearItems },
    { data: trips },
    { data: userActivities },
    { data: templates },
  ] = await Promise.all([
    supabase
      .from("gear_items")
      .select("id, name, brand, weight, price, wishlist, created_at, category_id, categories ( name )")
      .order("created_at", { ascending: false }),
    supabase
      .from("trips")
      .select("id, name, description, start_date, end_date, target_weight_kg, trip_items ( id, gear_item_id, packed, gear_items ( weight ) )")
      .order("start_date", { ascending: true }),
    supabase
      .from("user_activities")
      .select("activity_slug, skill_level"),
    supabase
      .from("pack_templates")
      .select("id, name, description, created_at, pack_template_items ( id )")
      .order("created_at", { ascending: false }),
  ]);

  // Normalize gear
  const gear = (gearItems ?? []).map((g) => {
    const cats = g.categories as
      | { name: string }
      | { name: string }[]
      | null;
    return {
      id: g.id as string,
      name: g.name as string,
      brand: g.brand as string | null,
      weight: g.weight as number | null,
      price: (g.price ?? null) as number | null,
      wishlist: (g.wishlist ?? false) as boolean,
      createdAt: g.created_at as string,
      categoryName: Array.isArray(cats)
        ? (cats[0]?.name ?? null)
        : (cats?.name ?? null),
    };
  });

  // Normalize trips
  type RawTripItem = {
    id: string;
    gear_item_id: string | number;
    packed: boolean;
    gear_items: { weight: number | null } | { weight: number | null }[] | null;
  };

  const normalizedTrips = (trips ?? []).map((t) => {
    const items = (t.trip_items ?? []) as RawTripItem[];
    const totalWeight = items.reduce((s, ti) => {
      const gi = Array.isArray(ti.gear_items) ? ti.gear_items[0] : ti.gear_items;
      return s + (gi?.weight ?? 0);
    }, 0);
    const packedCount = items.filter((ti) => ti.packed).length;

    return {
      id: t.id as string,
      name: t.name as string,
      description: t.description as string | null,
      startDate: t.start_date as string | null,
      endDate: t.end_date as string | null,
      targetWeight: t.target_weight_kg as number | null,
      itemCount: items.length,
      packedCount,
      totalWeight,
    };
  });

  // Activity map
  const activityMap: Record<string, string> = {};
  for (const ua of userActivities ?? []) {
    activityMap[ua.activity_slug] = ua.skill_level;
  }

  // Templates
  const normalizedTemplates = (templates ?? []).map((t) => ({
    id: t.id as string,
    name: t.name as string,
    description: t.description as string | null,
    itemCount: Array.isArray(t.pack_template_items) ? t.pack_template_items.length : 0,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-g-page">
      <NavBar userEmail={user.email ?? ""} />
      <DashboardClient
        gear={gear}
        trips={normalizedTrips}
        userActivities={activityMap}
        templates={normalizedTemplates}
      />
    </div>
  );
}
