"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";

export async function approveDeliverable(deliverableId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverables")
    .update({ status: "approved" })
    .eq("id", deliverableId)
    .eq("status", "client_review")
    .select("id");

  if (error || !data?.length) return { error: "Couldn't approve. Please try again." };
  revalidatePath("/portal/deliverables");
  return { success: true };
}

export async function requestRevision(deliverableId, note) {
  const body = note?.toString().trim();
  if (!body) return { error: "Add a note describing what needs to change." };

  const { user } = await requireRole("client");
  const supabase = await createClient();

  const { data: updated, error: statusError } = await supabase
    .from("deliverables")
    .update({ status: "revision_requested" })
    .eq("id", deliverableId)
    .eq("status", "client_review")
    .select("id");

  if (statusError || !updated?.length) {
    return { error: "Couldn't submit the revision request." };
  }

  await supabase.from("deliverable_comments").insert({
    deliverable_id: deliverableId,
    author_id: user.id,
    body,
  });

  revalidatePath("/portal/deliverables");
  return { success: true };
}

export async function getDownloadUrl(filePath) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("deliverables")
    .createSignedUrl(filePath, 60 * 5);

  if (error) return { error: "Couldn't generate a download link." };
  return { url: data.signedUrl };
}
