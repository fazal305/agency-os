"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createMeeting(formData) {
  const clientId = formData.get("client_id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const scheduledAt = formData.get("scheduled_at")?.toString();

  if (!clientId || !title || !scheduledAt) {
    return { error: "Client, title, and date/time are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("meetings").insert({
    client_id: clientId,
    title,
    type: formData.get("type")?.toString() || "other",
    scheduled_at: new Date(scheduledAt).toISOString(),
    meeting_link: formData.get("meeting_link")?.toString().trim() || null,
    notes: formData.get("notes")?.toString().trim() || null,
  });

  if (error) return { error: "Couldn't schedule the meeting. Please try again." };

  revalidatePath("/dashboard/meetings");
  return { success: true };
}
