"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createContract(formData) {
  const clientId = formData.get("client_id")?.toString();
  const title = formData.get("title")?.toString().trim();

  if (!clientId || !title) {
    return { error: "Client and title are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contracts").insert({
    client_id: clientId,
    title,
    scope_summary: formData.get("scope_summary")?.toString().trim() || null,
    services: formData.get("services")?.toString().trim() || null,
    timeline: formData.get("timeline")?.toString().trim() || null,
    payment_terms: formData.get("payment_terms")?.toString().trim() || null,
  });

  if (error) {
    return { error: "Couldn't create the contract. Please try again." };
  }

  revalidatePath("/dashboard/contracts");
  return { success: true };
}

export async function sendContract(contractId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contracts")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", contractId)
    .eq("status", "draft");

  if (error) return { error: "Couldn't send the contract." };

  revalidatePath("/dashboard/contracts");
  revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true };
}
