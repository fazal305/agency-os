import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";

export const metadata = { title: "Report" };

const SECTIONS = [
  { key: "executive_summary", label: "Executive summary" },
  { key: "insights", label: "Insights" },
  { key: "recommendations", label: "Recommendations" },
  { key: "next_priorities", label: "Next priorities" },
];

export default async function PortalReportDetailPage({ params }) {
  const { id } = await params;
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const [{ data: report }, { data: metrics }] = await Promise.all([
    supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .eq("client_id", profile.client_id)
      .eq("status", "published")
      .single(),
    supabase
      .from("report_metrics")
      .select("*")
      .eq("report_id", id)
      .order("sort_order"),
  ]);

  if (!report) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader
        title="Report"
        description={`${new Date(report.period_start).toLocaleDateString()} – ${new Date(
          report.period_end
        ).toLocaleDateString()}`}
      />

      {metrics?.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      ) : null}

      <div className="space-y-6">
        {SECTIONS.map(({ key, label }) =>
          report[key] ? (
            <div key={key}>
              <h2 className="font-heading text-lg tracking-tight">{label}</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {report[key]}
              </p>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
