import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { ActivitiesClient } from "./activities-client";

export default async function ActivitiesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/activities");
  }

  // Fetch in parallel
  const [
    { data: userActivities },
    { data: gearItems },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from("user_activities")
      .select("activity_slug, skill_level"),
    supabase
      .from("gear_items")
      .select("id, name, brand, model, condition, weight, price, notes, tags, wishlist, category_id, categories ( name )")
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name")
      .order("name"),
  ]);

  const gear = (gearItems ?? []).map((g) => {
    const cats = g.categories as
      | { name: string }
      | { name: string }[]
      | null;
    return {
      id: g.id as string,
      name: g.name as string,
      brand: g.brand as string | null,
      model: g.model as string | null,
      condition: g.condition as string | null,
      weight: g.weight as number | null,
      price: (g.price ?? null) as number | null,
      notes: g.notes as string | null,
      tags: (g.tags ?? []) as string[],
      wishlist: (g.wishlist ?? false) as boolean,
      category_id: g.category_id as string | null,
      categories: Array.isArray(cats)
        ? (cats[0] ?? null)
        : cats,
    };
  });

  const activityMap: Record<string, string> = {};
  for (const ua of userActivities ?? []) {
    activityMap[ua.activity_slug] = ua.skill_level;
  }

  return (
    <div className="flex min-h-screen flex-col bg-g-page">
      <NavBar userEmail={user.email ?? ""} />
      <ActivitiesClient
        userActivities={activityMap}
        userGear={gear}
        categories={categories ?? []}
      />
    </div>
  );
}
