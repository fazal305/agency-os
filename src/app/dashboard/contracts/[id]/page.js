import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ContractDocument } from "@/components/contract-document";
import { createClient } from "@/lib/supabase/server";
import { CONTRACT_STATUS } from "@/lib/workflow-status";
import { SendContractButton } from "../send-contract-button";

export const metadata = { title: "Contract" };

export default async function ContractDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contract } = await supabase
    .from("contracts")
    .select("*, clients(company_name)")
    .eq("id", id)
    .single();

  if (!contract) notFound();

  const status = CONTRACT_STATUS[contract.status] ?? CONTRACT_STATUS.draft;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title={contract.title}
        description={contract.clients?.company_name}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge tone={status.tone} label={status.label} />
            {contract.status === "draft" ? (
              <SendContractButton contractId={contract.id} />
            ) : null}
          </div>
        }
      />
      <ContractDocument contract={contract} clientName={contract.clients?.company_name} />
    </div>
  );
}
