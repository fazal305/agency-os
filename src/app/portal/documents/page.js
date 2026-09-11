import Link from "next/link";
import { FileStack } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";
import { CONTRACT_STATUS, INVOICE_STATUS } from "@/lib/workflow-status";
import { invoiceTotal, displayInvoiceStatus } from "@/lib/invoice-helpers";

export const metadata = { title: "Documents" };

export default async function PortalDocumentsPage() {
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const [{ data: clientRow }, { data: contracts }, { data: invoices }] = await Promise.all([
    supabase.from("clients").select("welcome_sent_at, company_name").eq("id", profile.client_id).single(),
    supabase
      .from("contracts")
      .select("id, title, status, signed_at")
      .eq("client_id", profile.client_id)
      .neq("status", "draft")
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_number, status, due_date, payment_instructions, invoice_line_items(quantity, rate)")
      .eq("client_id", profile.client_id)
      .neq("status", "draft")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader title="Documents" description="Your welcome guide, agreements, and invoices." />

      <section className="space-y-3">
        <h2 className="font-heading text-lg tracking-tight">Welcome</h2>
        {clientRow?.welcome_sent_at ? (
          <div className="space-y-3 rounded-lg border border-border p-6 text-sm text-muted-foreground">
            <p>
              Welcome to working with us, {clientRow.company_name}. Here&rsquo;s what to expect:
              we&rsquo;ll keep you updated at every stage, ask for your input at clear
              checkpoints, and use this portal as the single place to track progress,
              deliverables, and reports.
            </p>
            <p>
              Use <strong>Requests</strong> to see what we need from you,{" "}
              <strong>Meetings</strong> to find your kickoff call, and{" "}
              <strong>Projects</strong> to follow along once work begins.
            </p>
          </div>
        ) : (
          <EmptyState
            icon={FileStack}
            title="Not sent yet"
            description="Your agency contact hasn't sent your welcome guide yet."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg tracking-tight">Contracts</h2>
        {!contracts?.length ? (
          <EmptyState
            icon={FileStack}
            title="No contracts yet"
            description="Your services agreement will appear here once it's sent."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {contracts.map((contract) => {
              const status = CONTRACT_STATUS[contract.status] ?? CONTRACT_STATUS.draft;
              return (
                <li key={contract.id} className="flex items-center justify-between px-4 py-3">
                  <Link
                    href={`/portal/documents/contracts/${contract.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {contract.title}
                  </Link>
                  <StatusBadge tone={status.tone} label={status.label} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg tracking-tight">Invoices</h2>
        {!invoices?.length ? (
          <EmptyState
            icon={FileStack}
            title="No invoices yet"
            description="Invoices will appear here once your agency sends one."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {invoices.map((invoice) => {
              const displayStatus = displayInvoiceStatus(invoice);
              const status = INVOICE_STATUS[displayStatus] ?? INVOICE_STATUS.draft;
              return (
                <li key={invoice.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{invoice.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">
                      ${invoiceTotal(invoice.invoice_line_items).toFixed(2)}
                      {invoice.due_date
                        ? ` · due ${new Date(invoice.due_date).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <StatusBadge tone={status.tone} label={status.label} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
