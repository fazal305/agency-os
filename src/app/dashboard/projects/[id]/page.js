import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StageTracker } from "@/components/stage-tracker";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_STAGES, PROJECT_STATUS } from "@/lib/project-status";
import { StageSelect } from "../stage-select";
import { Milestones } from "../milestones";

export const metadata = { title: "Project" };

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: milestones }] = await Promise.all([
    supabase.from("projects").select("*, clients(company_name)").eq("id", id).single(),
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
      <PageHeader
        title={project.name}
        description={project.clients?.company_name}
        actions={<StageSelect projectId={project.id} status={project.status} />}
      />

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

      <section className="space-y-3">
        <h2 className="font-heading text-lg tracking-tight">Milestones</h2>
        <Milestones projectId={project.id} milestones={milestones ?? []} />
      </section>
    </div>
  );
}
