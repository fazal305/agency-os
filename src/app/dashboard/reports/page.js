import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getClientOptions } from "@/lib/get-client-options";
import { NewReportDialog } from "./new-report-dialog";
import { PublishButton } from "./publish-button";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const supabase = await createClient();
  const [{ data: reports, error }, clients] = await Promise.all([
    supabase
      .from("reports")
      .select("id, period_start, period_end, status, clients(company_name)")
      .order("period_start", { ascending: false }),
    getClientOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Monthly performance, by client."
        actions={<NewReportDialog clients={clients} />}
      />

      {error ? (
        <EmptyState
          icon={BarChart3}
          title="We couldn't load reports"
          description="Something went wrong reaching the database. Try refreshing the page."
        />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No reports yet"
          description="Your first report will appear here once you create one."
          action={<NewReportDialog clients={clients} />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="text-muted-foreground">
                  {report.clients?.company_name ?? "—"}
                </TableCell>
                <TableCell className="font-medium">
                  {new Date(report.period_start).toLocaleDateString()} –{" "}
                  {new Date(report.period_end).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    tone={report.status === "published" ? "success" : "neutral"}
                    label={report.status === "published" ? "Published" : "Draft"}
                  />
                </TableCell>
                <TableCell className="text-right">
                  {report.status === "draft" ? <PublishButton reportId={report.id} /> : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
