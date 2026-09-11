import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";
import { PROJECT_STATUS } from "@/lib/project-status";

export const metadata = { title: "Projects" };

export default async function PortalProjectsPage() {
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, description, status, target_date")
    .eq("client_id", profile.client_id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="What we're working on for you." />

      {!projects?.length ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Your project will appear here once work begins."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const status = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.discovery;
            return (
              <li key={project.id} className="rounded-lg border border-border p-5">
                <Link
                  href={`/portal/projects/${project.id}`}
                  className="font-medium hover:underline"
                >
                  {project.name}
                </Link>
                {project.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                ) : null}
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge tone={status.tone} label={status.label} />
                  {project.target_date ? (
                    <span className="text-xs text-muted-foreground">
                      Target {new Date(project.target_date).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
