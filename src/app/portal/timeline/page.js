import { PageHeader } from "@/components/page-header";
import { StageTracker } from "@/components/stage-tracker";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";
import { PROJECT_STAGES, PROJECT_STATUS } from "@/lib/project-status";

export const metadata = { title: "Timeline" };

export default async function PortalTimelinePage() {
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const [{ data: contracts }, { data: clientRow }, { data: accessRequests }, { data: projects }] =
    await Promise.all([
      supabase.from("contracts").select("status").eq("client_id", profile.client_id),
      supabase.from("clients").select("welcome_sent_at").eq("id", profile.client_id).single(),
      supabase.from("access_requests").select("status").eq("client_id", profile.client_id),
      supabase
        .from("projects")
        .select("status")
        .eq("client_id", profile.client_id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

  const contractSigned = contracts?.some((c) => c.status === "signed") ?? false;
  const welcomeSent = Boolean(clientRow?.welcome_sent_at);
  const assetsReceived =
    (accessRequests?.length ?? 0) > 0 &&
    accessRequests.every((r) => ["received", "verified", "complete"].includes(r.status));

  const project = projects?.[0];
  const onboardingSteps = ["Contract signed", "Welcome sent", "Assets received"];
  const stageLabels = Object.values(PROJECT_STATUS).map((s) => s.label);
  const steps = [...onboardingSteps, ...stageLabels];

  let currentIndex;
  if (project) {
    currentIndex = onboardingSteps.length + PROJECT_STAGES.indexOf(project.status);
  } else {
    const onboardingDone = [contractSigned, welcomeSent, assetsReceived];
    currentIndex = onboardingDone.findIndex((done) => !done);
    if (currentIndex === -1) currentIndex = onboardingSteps.length;
  }

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="Timeline" description="Where things stand, start to finish." />
      <StageTracker steps={steps} currentIndex={currentIndex} />
    </div>
  );
}
