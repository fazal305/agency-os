"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createReport(formData) {
  const clientId = formData.get("client_id")?.toString();
  const periodStart = formData.get("period_start")?.toString();
  const periodEnd = formData.get("period_end")?.toString();

  if (!clientId || !periodStart || !periodEnd) {
    return { error: "Client and reporting period are required." };
  }

  const labels = formData.getAll("metric_label[]").map((v) => v.toString().trim());
  const values = formData.getAll("metric_value[]").map((v) => Number(v) || 0);
  const units = formData.getAll("metric_unit[]").map((v) => v.toString().trim());
  const performances = formData.getAll("metric_performance[]").map((v) => v.toString());

  const metrics = labels
    .map((label, i) => ({
      label,
      value: values[i],
      unit: units[i] || null,
      performance: performances[i] || "on_target",
    }))
    .filter((m) => m.label);

  const supabase = await createClient();
  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      client_id: clientId,
      period_start: periodStart,
      period_end: periodEnd,
      executive_summary: formData.get("executive_summary")?.toString().trim() || null,
      insights: formData.get("insights")?.toString().trim() || null,
      recommendations: formData.get("recommendations")?.toString().trim() || null,
      next_priorities: formData.get("next_priorities")?.toString().trim() || null,
    })
    .select("id")
    .single();

  if (error) return { error: "Couldn't create the report. Please try again." };

  if (metrics.length > 0) {
    await supabase.from("report_metrics").insert(
      metrics.map((m, i) => ({ ...m, report_id: report.id, sort_order: i }))
    );
  }

  revalidatePath("/dashboard/reports");
  return { success: true };
}

export async function publishReport(reportId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", reportId)
    .eq("status", "draft");

  if (error) return { error: "Couldn't publish the report." };
  revalidatePath("/dashboard/reports");
  return { success: true };
}
