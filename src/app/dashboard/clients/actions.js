"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

export async function createClientRecord(_prevState, formData) {
  const companyName = formData.get("company_name")?.toString().trim();

  if (!companyName) {
    return { error: "Company name is required." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").insert({
    company_name: companyName,
    primary_contact_name: formData.get("primary_contact_name")?.toString().trim() || null,
    primary_contact_email: formData.get("primary_contact_email")?.toString().trim() || null,
    website: formData.get("website")?.toString().trim() || null,
    industry: formData.get("industry")?.toString().trim() || null,
  });

  if (error) {
    return { error: "Couldn't create the client. Please try again." };
  }

  revalidatePath("/dashboard/clients");
  return { success: true };
}

export async function sendWelcome(clientId) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("clients")
    .update({ welcome_sent_at: new Date().toISOString() })
    .eq("id", clientId);

  if (error) return { error: "Couldn't send the welcome document." };
  revalidatePath("/dashboard/clients");
  return { success: true };
}
