"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ALL_ACTIVITIES, SKILL_LEVELS, type SkillLevel } from "./activity-data";

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function setActivitySkill(
  activitySlug: string,
  skillLevel: SkillLevel,
): Promise<ActionResult> {
  if (!ALL_ACTIVITIES.some((a) => a.slug === activitySlug)) {
    return { ok: false, message: "Unknown activity." };
  }
  if (!(SKILL_LEVELS as readonly string[]).includes(skillLevel)) {
    return { ok: false, message: "Invalid skill level." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }

  const { error } = await supabase
    .from("user_activities")
    .upsert(
      {
        user_id: user.id,
        activity_slug: activitySlug,
        skill_level: skillLevel,
      },
      { onConflict: "user_id,activity_slug" },
    );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/activities");
  return { ok: true };
}

export async function removeActivity(
  activitySlug: string,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }

  const { error } = await supabase
    .from("user_activities")
    .delete()
    .eq("user_id", user.id)
    .eq("activity_slug", activitySlug);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/activities");
  return { ok: true };
}
