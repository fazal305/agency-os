import Link from "next/link";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getClientOptions } from "@/lib/get-client-options";
import { CONTRACT_STATUS } from "@/lib/workflow-status";
import { NewContractDialog } from "./new-contract-dialog";
import { SendContractButton } from "./send-contract-button";

export const metadata = { title: "Contracts" };

export default async function ContractsPage() {
  const supabase = await createClient();
  const [{ data: contracts, error }, clients] = await Promise.all([
    supabase
      .from("contracts")
      .select("id, title, status, created_at, sent_at, signed_at, clients(company_name)")
      .order("created_at", { ascending: false }),
    getClientOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="Nothing moves forward until the agreement is signed."
        actions={<NewContractDialog clients={clients} />}
      />

      {error ? (
        <EmptyState
          icon={FileText}
          title="We couldn't load contracts"
          description="Something went wrong reaching the database. Try refreshing the page."
        />
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No contracts yet"
          description="Create a services agreement for a client to kick off onboarding."
          action={<NewContractDialog clients={clients} />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Signed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => {
              const status = CONTRACT_STATUS[contract.status] ?? CONTRACT_STATUS.draft;
              return (
                <TableRow key={contract.id}>
                  <TableCell className="text-muted-foreground">
                    {contract.clients?.company_name ?? "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/contracts/${contract.id}`} className="hover:underline">
                      {contract.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={status.tone} label={status.label} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contract.signed_at
                      ? new Date(contract.signed_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {contract.status === "draft" ? (
                      <SendContractButton contractId={contract.id} />
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
