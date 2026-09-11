"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createAccessRequest(formData) {
  const clientId = formData.get("client_id")?.toString();
  const item = formData.get("item")?.toString().trim();

  if (!clientId || !item) {
    return { error: "Client and item are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("access_requests").insert({
    client_id: clientId,
    item,
    description: formData.get("description")?.toString().trim() || null,
    owner: formData.get("owner")?.toString() || "client",
    due_date: formData.get("due_date")?.toString() || null,
  });

  if (error) return { error: "Couldn't create the request. Please try again." };

  revalidatePath("/dashboard/access-requests");
  return { success: true };
}

export async function updateAccessRequestStatus(id, status) {
  const supabase = await createClient();
  const { error } = await supabase.from("access_requests").update({ status }).eq("id", id);

  if (error) return { error: "Couldn't update the status." };
  revalidatePath("/dashboard/access-requests");
  return { success: true };
}
