import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Server-side gate for a layout: redirects to /login if there's no session,
 * and away from the wrong area if the signed-in user's role doesn't match.
 * This is the actual authorization boundary — client-side nav state is
 * cosmetic only.
 */
export async function requireRole(role) {
  if (!isSupabaseConfigured) {
    // Local dev without Supabase configured yet — let pages render with no
    // user so the shells and empty states can still be reviewed.
    return { user: null, profile: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, client_id, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== role) {
    redirect(profile?.role === "admin" ? "/dashboard" : "/portal");
  }

  return { user, profile };
}
