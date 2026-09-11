"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function requestFeedback(clientId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ feedback_requested_at: new Date().toISOString() })
    .eq("id", clientId);

  if (error) return { error: "Couldn't request feedback." };
  revalidatePath("/dashboard/feedback");
  return { success: true };
}

export async function updateTestimonialStatus(testimonialId, status) {
  const supabase = await createClient();
  const patch = { status };
  if (status === "approved") patch.approved_at = new Date().toISOString();
  if (status === "published") patch.published_at = new Date().toISOString();

  const { error } = await supabase.from("testimonials").update(patch).eq("id", testimonialId);

  if (error) return { error: "Couldn't update the testimonial." };
  revalidatePath("/dashboard/feedback");
  return { success: true };
}
