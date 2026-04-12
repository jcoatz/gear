import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { GearClient, type GearItemRow } from "./gear-client";

function normalizeGearItems(
  rows:
    | {
        id: string;
        name: string;
        brand: string | null;
        model: string | null;
        condition: string | null;
        weight: number | null;
        notes: string | null;
        tags: string[] | null;
        wishlist: boolean | null;
        category_id: string | null;
        categories:
          | { name: string }
          | { name: string }[]
          | null;
      }[]
    | null,
): GearItemRow[] {
  if (!rows) return [];
  return rows.map((row) => ({
    ...row,
    tags: row.tags ?? [],
    wishlist: row.wishlist ?? false,
    categories: Array.isArray(row.categories)
      ? (row.categories[0] ?? null)
      : row.categories,
  }));
}

export default async function GearPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/gear");
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const { data: items, error: itemsError } = await supabase
    .from("gear_items")
    .select(
      `
      id,
      name,
      brand,
      model,
      condition,
      weight,
      notes,
      tags,
      wishlist,
      category_id,
      categories ( name )
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col bg-stone-950 dark:bg-stone-950">
      <NavBar userEmail={user.email ?? ""} />
      <GearClient
        userEmail={user.email ?? ""}
        categories={categories ?? []}
        items={normalizeGearItems(items)}
        loadError={categoriesError?.message ?? itemsError?.message}
      />
    </div>
  );
}
