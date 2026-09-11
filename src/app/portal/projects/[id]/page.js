import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StageTracker } from "@/components/stage-tracker";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";
import { PROJECT_STAGES, PROJECT_STATUS } from "@/lib/project-status";

export const metadata = { title: "Project" };

export default async function PortalProjectDetailPage({ params }) {
  const { id } = await params;
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const [{ data: project }, { data: milestones }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("client_id", profile.client_id)
      .single(),
    supabase
      .from("milestones")
      .select("id, title, due_date, completed_at")
      .eq("project_id", id)
      .order("sort_order"),
  ]);

  if (!project) notFound();

  const stageIndex = PROJECT_STAGES.indexOf(project.status);

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title={project.name} />
      {project.description ? (
        <p className="text-sm text-muted-foreground">{project.description}</p>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-heading text-lg tracking-tight">Stage</h2>
        <StageTracker
          steps={Object.values(PROJECT_STATUS).map((s) => s.label)}
          currentIndex={stageIndex}
        />
      </section>

      {milestones?.length ? (
        <section className="space-y-3">
          <h2 className="font-heading text-lg tracking-tight">Milestones</h2>
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-sm">
                <span className={m.completed_at ? "text-success-foreground" : "text-muted-foreground"}>
                  {m.completed_at ? "✓" : "○"}
                </span>
                <span className={m.completed_at ? "text-muted-foreground line-through" : ""}>
                  {m.title}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
