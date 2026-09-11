import Link from "next/link";
import { FolderKanban } from "lucide-react";
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
import { PROJECT_STATUS } from "@/lib/project-status";
import { NewProjectDialog } from "./new-project-dialog";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const [{ data: projects, error }, clients] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, target_date, clients(company_name)")
      .order("created_at", { ascending: false }),
    getClientOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Where each client's work currently stands."
        actions={<NewProjectDialog clients={clients} />}
      />

      {error ? (
        <EmptyState
          icon={FolderKanban}
          title="We couldn't load projects"
          description="Something went wrong reaching the database. Try refreshing the page."
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project once a client is onboarded."
          action={<NewProjectDialog clients={clients} />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Target date</TableHead>
              <TableHead>Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const status = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.discovery;
              return (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.clients?.company_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.target_date
                      ? new Date(project.target_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={status.tone} label={status.label} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
