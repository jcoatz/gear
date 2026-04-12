import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { BagsClient } from "./bags-client";

export default async function BagsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/bags");
  }

  const { data: bags } = await supabase
    .from("bags")
    .select("id, name, brand, model, color, volume_liters, max_weight_kg, own_weight_kg, bag_type, notes")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col bg-g-page">
      <NavBar userEmail={user.email ?? ""} />
      <BagsClient bags={bags ?? []} />
    </div>
  );
}
