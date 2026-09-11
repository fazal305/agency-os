import { KeyRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
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
import { NewRequestDialog } from "./new-request-dialog";
import { StatusSelect } from "./status-select";

export const metadata = { title: "Access Requests" };

export default async function AccessRequestsPage() {
  const supabase = await createClient();
  const [{ data: requests, error }, clients] = await Promise.all([
    supabase
      .from("access_requests")
      .select("id, item, owner, status, due_date, clients(company_name)")
      .order("created_at", { ascending: false }),
    getClientOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Requests"
        description="What we need from each client before work can start."
        actions={<NewRequestDialog clients={clients} />}
      />

      {error ? (
        <EmptyState
          icon={KeyRound}
          title="We couldn't load access requests"
          description="Something went wrong reaching the database. Try refreshing the page."
        />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No access requests yet"
          description="Add items like brand assets or platform access to a client's checklist."
          action={<NewRequestDialog clients={clients} />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="text-muted-foreground">
                  {request.clients?.company_name ?? "—"}
                </TableCell>
                <TableCell className="font-medium">{request.item}</TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {request.owner}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {request.due_date ? new Date(request.due_date).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <StatusSelect requestId={request.id} status={request.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
