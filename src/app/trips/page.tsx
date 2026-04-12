import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { TripsClient } from "./trips-client";

export default async function TripsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/trips");
  }

  const { data: trips } = await supabase
    .from("trips")
    .select(`
      id,
      name,
      description,
      start_date,
      end_date,
      target_weight_kg,
      created_at,
      trip_items ( id, gear_item_id, packed, gear_items:gear_item_id ( weight ) )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col bg-g-page">
      <NavBar userEmail={user.email ?? ""} />
      <TripsClient trips={trips ?? []} />
    </div>
  );
}
