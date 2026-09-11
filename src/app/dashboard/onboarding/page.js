import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StageTracker } from "@/components/stage-tracker";
import { createClient } from "@/lib/supabase/server";
import { ONBOARDING_STEPS, deriveOnboardingIndex } from "@/lib/onboarding-stage";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const supabase = await createClient();

  const [
    { data: clients },
    { data: contracts },
    { data: invoices },
    { data: accessRequests },
    { data: meetings },
    { data: projects },
    { data: reports },
    { data: feedback },
  ] = await Promise.all([
    supabase.from("clients").select("id, company_name, welcome_sent_at").order("company_name"),
    supabase.from("contracts").select("client_id, status"),
    supabase.from("invoices").select("client_id, status"),
    supabase.from("access_requests").select("client_id, status"),
    supabase.from("meetings").select("client_id, type"),
    supabase.from("projects").select("client_id"),
    supabase.from("reports").select("client_id, status"),
    supabase.from("feedback").select("client_id"),
  ]);

  const byClient = (rows) => {
    const map = new Map();
    for (const row of rows ?? []) {
      if (!map.has(row.client_id)) map.set(row.client_id, []);
      map.get(row.client_id).push(row);
    }
    return map;
  };

  const contractsByClient = byClient(contracts);
  const invoicesByClient = byClient(invoices);
  const accessByClient = byClient(accessRequests);
  const meetingsByClient = byClient(meetings);
  const projectsByClient = byClient(projects);
  const reportsByClient = byClient(reports);
  const feedbackByClient = byClient(feedback);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="Where every client actually stands, derived from real activity."
      />

      {!clients?.length ? (
        <EmptyState
          icon={ClipboardList}
          title="No clients yet"
          description="Add a client to start tracking their onboarding."
        />
      ) : (
        <ul className="space-y-6">
          {clients.map((client) => {
            const stepIndex = deriveOnboardingIndex({
              hasContractSigned: (contractsByClient.get(client.id) ?? []).some(
                (c) => c.status === "signed"
              ),
              welcomeSentAt: client.welcome_sent_at,
              hasInvoicePaid: (invoicesByClient.get(client.id) ?? []).some(
                (i) => i.status === "paid"
              ),
              accessComplete:
                (accessByClient.get(client.id) ?? []).length > 0 &&
                (accessByClient.get(client.id) ?? []).every((a) =>
                  ["received", "verified", "complete"].includes(a.status)
                ),
              hasKickoffMeeting: (meetingsByClient.get(client.id) ?? []).some(
                (m) => m.type === "kickoff"
              ),
              hasProject: (projectsByClient.get(client.id) ?? []).length > 0,
              hasPublishedReport: (reportsByClient.get(client.id) ?? []).some(
                (r) => r.status === "published"
              ),
              hasFeedback: (feedbackByClient.get(client.id) ?? []).length > 0,
            });

            return (
              <li key={client.id} className="rounded-lg border border-border p-5">
                <p className="mb-4 font-medium">{client.company_name}</p>
                <StageTracker steps={ONBOARDING_STEPS} currentIndex={stepIndex} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
