"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signContract(contractId, signedByName) {
  const name = signedByName?.toString().trim();
  if (!name) return { error: "Enter your full name to sign." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contracts")
    .update({
      status: "signed",
      signed_at: new Date().toISOString(),
      signed_by_name: name,
    })
    .eq("id", contractId)
    .in("status", ["sent", "viewed"])
    .select("id");

  if (error || !data?.length) {
    return { error: "Couldn't sign the contract. Please try again." };
  }

  revalidatePath("/portal/documents");
  revalidatePath(`/portal/documents/contracts/${contractId}`);
  return { success: true };
}
