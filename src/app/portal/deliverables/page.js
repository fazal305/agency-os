import { PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { DownloadButton } from "@/components/download-button";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";
import { DELIVERABLE_STATUS } from "@/lib/workflow-status";
import { DeliverableReview } from "./deliverable-review";
import { getDownloadUrl } from "./actions";

export const metadata = { title: "Deliverables" };

export default async function PortalDeliverablesPage() {
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const { data: deliverables } = await supabase
    .from("deliverables")
    .select("id, title, description, status, file_path, file_name")
    .eq("client_id", profile.client_id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader title="Deliverables" description="Work ready for your review." />

      {!deliverables?.length ? (
        <EmptyState
          icon={PackageCheck}
          title="Nothing to review yet"
          description="Deliverables will appear here once they're ready for you."
        />
      ) : (
        <ul className="space-y-4">
          {deliverables.map((d) => {
            const status = DELIVERABLE_STATUS[d.status] ?? DELIVERABLE_STATUS.client_review;
            return (
              <li key={d.id} className="space-y-3 rounded-lg border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{d.title}</p>
                    {d.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                    ) : null}
                  </div>
                  <StatusBadge tone={status.tone} label={status.label} />
                </div>
                {d.file_path ? (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {d.file_name}
                    <DownloadButton filePath={d.file_path} getUrlAction={getDownloadUrl} />
                  </div>
                ) : null}
                {d.status === "client_review" ? (
                  <DeliverableReview deliverableId={d.id} />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
