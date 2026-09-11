"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProject(formData) {
  const clientId = formData.get("client_id")?.toString();
  const name = formData.get("name")?.toString().trim();

  if (!clientId || !name) return { error: "Client and project name are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({
    client_id: clientId,
    name,
    description: formData.get("description")?.toString().trim() || null,
    start_date: formData.get("start_date")?.toString() || null,
    target_date: formData.get("target_date")?.toString() || null,
  });

  if (error) return { error: "Couldn't create the project. Please try again." };

  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function updateProjectStatus(projectId, status) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ status }).eq("id", projectId);

  if (error) return { error: "Couldn't update the project." };
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function addMilestone(projectId, formData) {
  const title = formData.get("title")?.toString().trim();
  if (!title) return { error: "Title is required." };

  const supabase = await createClient();
  const { count } = await supabase
    .from("milestones")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    title,
    due_date: formData.get("due_date")?.toString() || null,
    sort_order: count ?? 0,
  });

  if (error) return { error: "Couldn't add the milestone." };
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function toggleMilestone(milestoneId, projectId, completed) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("milestones")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", milestoneId);

  if (error) return { error: "Couldn't update the milestone." };
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}
