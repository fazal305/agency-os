import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";

export const metadata = { title: "Reports" };

export default async function PortalReportsPage() {
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, period_start, period_end")
    .eq("client_id", profile.client_id)
    .order("period_start", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="How things are performing, month by month." />

      {!reports?.length ? (
        <EmptyState
          icon={BarChart3}
          title="No reports yet"
          description="Your first report will appear after the first reporting period."
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {reports.map((report) => (
            <li key={report.id}>
              <Link
                href={`/portal/reports/${report.id}`}
                className="block px-4 py-3 text-sm font-medium hover:bg-muted"
              >
                {new Date(report.period_start).toLocaleDateString()} –{" "}
                {new Date(report.period_end).toLocaleDateString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
