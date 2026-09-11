import { Receipt } from "lucide-react";
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
import { INVOICE_STATUS } from "@/lib/workflow-status";
import { invoiceTotal, displayInvoiceStatus } from "@/lib/invoice-helpers";
import { NewInvoiceDialog } from "./new-invoice-dialog";
import { InvoiceActions } from "./invoice-actions";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const supabase = await createClient();
  const [{ data: invoices, error }, clients] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        "id, invoice_number, status, due_date, clients(company_name), invoice_line_items(quantity, rate)"
      )
      .order("created_at", { ascending: false }),
    getClientOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Every invoice, its status, and what's owed."
        actions={<NewInvoiceDialog clients={clients} />}
      />

      {error ? (
        <EmptyState
          icon={Receipt}
          title="We couldn't load invoices"
          description="Something went wrong reaching the database. Try refreshing the page."
        />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Create an invoice once a contract is signed."
          action={<NewInvoiceDialog clients={clients} />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const displayStatus = displayInvoiceStatus(invoice);
              const status = INVOICE_STATUS[displayStatus] ?? INVOICE_STATUS.draft;
              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.clients?.company_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>${invoiceTotal(invoice.invoice_line_items).toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusBadge tone={status.tone} label={status.label} />
                  </TableCell>
                  <TableCell className="text-right">
                    <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
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
