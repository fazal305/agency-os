"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";

export async function submitAccessRequest(requestId, notes) {
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const { error } = await supabase
    .from("access_requests")
    .update({ status: "received", notes: notes?.toString().trim() || null })
    .eq("id", requestId)
    .eq("client_id", profile.client_id);

  if (error) return { error: "Couldn't submit. Please try again." };

  revalidatePath("/portal/requests");
  return { success: true };
}
