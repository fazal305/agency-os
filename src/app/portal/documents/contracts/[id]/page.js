import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ContractDocument } from "@/components/contract-document";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";
import { CONTRACT_STATUS } from "@/lib/workflow-status";
import { SignContractForm } from "../../sign-contract-form";

export const metadata = { title: "Contract" };

export default async function PortalContractPage({ params }) {
  const { id } = await params;
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const { data: contract } = await supabase
    .from("contracts")
    .select("*, clients(company_name)")
    .eq("id", id)
    .eq("client_id", profile.client_id)
    .single();

  if (!contract) notFound();

  const status = CONTRACT_STATUS[contract.status] ?? CONTRACT_STATUS.draft;
  const canSign = ["sent", "viewed"].includes(contract.status);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title={contract.title}
        actions={<StatusBadge tone={status.tone} label={status.label} />}
      />
      <ContractDocument contract={contract} clientName={contract.clients?.company_name} />
      {canSign ? <SignContractForm contractId={contract.id} /> : null}
    </div>
  );
}
