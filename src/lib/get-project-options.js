import { createClient } from "@/lib/supabase/server";

export async function getProjectOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name, clients(company_name)")
    .order("name");

  return data ?? [];
}
