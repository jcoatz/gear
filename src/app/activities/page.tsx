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

  // Fetch user's activity selections
  const { data: userActivities } = await supabase
    .from("user_activities")
    .select("activity_slug, skill_level");

  // Fetch user's gear for badge computation
  const { data: gearItems } = await supabase
    .from("gear_items")
    .select("name, category_id, categories ( name )");

  const gear = (gearItems ?? []).map((g) => {
    const cats = g.categories as
      | { name: string }
      | { name: string }[]
      | null;
    return {
      name: g.name,
      categoryName: Array.isArray(cats)
        ? (cats[0]?.name ?? null)
        : (cats?.name ?? null),
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
      />
    </div>
  );
}
