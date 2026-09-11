import { MessageSquareHeart } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";
import { FeedbackForm } from "./feedback-form";

export const metadata = { title: "Feedback" };

export default async function PortalFeedbackPage() {
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const [{ data: clientRow }, { data: existing }] = await Promise.all([
    supabase.from("clients").select("feedback_requested_at").eq("id", profile.client_id).single(),
    supabase
      .from("feedback")
      .select("id, overall_rating, created_at")
      .eq("client_id", profile.client_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Feedback" description="We'd love to hear how things went." />

      {existing ? (
        <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          Thanks for your feedback, submitted on{" "}
          {new Date(existing.created_at).toLocaleDateString()}.
        </div>
      ) : clientRow?.feedback_requested_at ? (
        <FeedbackForm />
      ) : (
        <EmptyState
          icon={MessageSquareHeart}
          title="Nothing to review yet"
          description="We'll ask for your feedback once a reporting period wraps up."
        />
      )}
    </div>
  );
}
