import { PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { DownloadButton } from "@/components/download-button";
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
import { getProjectOptions } from "@/lib/get-project-options";
import { NewDeliverableDialog } from "./new-deliverable-dialog";
import { StatusSelect } from "./status-select";
import { getDownloadUrl } from "./actions";

export const metadata = { title: "Deliverables" };

export default async function DeliverablesPage() {
  const supabase = await createClient();
  const [{ data: deliverables, error }, clients, projects] = await Promise.all([
    supabase
      .from("deliverables")
      .select("id, title, status, file_path, file_name, version, clients(company_name)")
      .order("created_at", { ascending: false }),
    getClientOptions(),
    getProjectOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliverables"
        description="Work in progress, in review, and delivered."
        actions={<NewDeliverableDialog clients={clients} projects={projects} />}
      />

      {error ? (
        <EmptyState
          icon={PackageCheck}
          title="We couldn't load deliverables"
          description="Something went wrong reaching the database. Try refreshing the page."
        />
      ) : deliverables.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No deliverables yet"
          description="Upload work for a client to move it through review."
          action={<NewDeliverableDialog clients={clients} projects={projects} />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliverables.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {d.clients?.company_name ?? "—"}
                </TableCell>
                <TableCell>
                  {d.file_path ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">{d.file_name}</span>
                      <DownloadButton filePath={d.file_path} getUrlAction={getDownloadUrl} />
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <StatusSelect deliverableId={d.id} status={d.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
