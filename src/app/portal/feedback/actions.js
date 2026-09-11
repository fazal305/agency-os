"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";

export async function submitFeedback(formData) {
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const wantsTestimonial = formData.get("wants_testimonial") === "on";
  const testimonialText = formData.get("testimonial_text")?.toString().trim();

  const { data: feedback, error } = await supabase
    .from("feedback")
    .insert({
      client_id: profile.client_id,
      communication_rating: Number(formData.get("communication_rating")) || null,
      quality_rating: Number(formData.get("quality_rating")) || null,
      timeline_rating: Number(formData.get("timeline_rating")) || null,
      overall_rating: Number(formData.get("overall_rating")) || null,
      improvement_notes: formData.get("improvement_notes")?.toString().trim() || null,
      wants_testimonial: wantsTestimonial,
    })
    .select("id")
    .single();

  if (error) return { error: "Couldn't submit feedback. Please try again." };

  if (wantsTestimonial && testimonialText) {
    await supabase.from("testimonials").insert({
      client_id: profile.client_id,
      feedback_id: feedback.id,
      quote: testimonialText,
      author_name: profile.full_name,
      status: "submitted",
    });
  }

  revalidatePath("/portal/feedback");
  return { success: true };
}
