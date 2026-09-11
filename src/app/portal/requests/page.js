import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";
import { RequestItem } from "./request-item";

export const metadata = { title: "Requests" };

export default async function PortalRequestsPage() {
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("access_requests")
    .select("id, item, description, owner, status, due_date, notes")
    .eq("client_id", profile.client_id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <PageHeader title="Requests" description="What we need from you to get started." />

      {!requests?.length ? (
        <EmptyState
          icon={Inbox}
          title="Nothing needed right now"
          description="When your agency needs something from you, it'll show up here."
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {requests.map((request) => (
            <RequestItem key={request.id} request={request} />
          ))}
        </ul>
      )}
    </div>
  );
}
