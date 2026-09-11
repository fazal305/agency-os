import { createClient } from "@/lib/supabase/server";

/** Client companies for use in agency-side "assign to client" selects. */
export async function getClientOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, company_name")
    .order("company_name");

  return data ?? [];
}
