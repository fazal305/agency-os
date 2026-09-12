import Link from "next/link";
import { ClipboardList, CalendarDays, PackageCheck, BarChart3, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { DELIVERABLE_STATUS } from "@/lib/workflow-status";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }) {
  const { denied } = (await searchParams) ?? {};
  const supabase = await createClient();

  const [
    { data: unsignedContracts },
    { data: unpaidInvoices },
    { data: staleAccessRequests },
    { data: upcomingMeetings },
    { data: recentDeliverables },
    { data: recentReports },
  ] = await Promise.all([
    supabase
      .from("contracts")
      .select("id, title, sent_at, clients(company_name)")
      .eq("status", "sent")
      .order("sent_at"),
    supabase
      .from("invoices")
      .select("id, invoice_number, due_date, clients(company_name)")
      .in("status", ["sent", "viewed", "due"])
      .order("due_date"),
    supabase
      .from("access_requests")
      .select("id, item, due_date, clients(company_name)")
      .in("status", ["requested", "needs_attention"])
      .order("due_date"),
    supabase
      .from("meetings")
      .select("id, title, scheduled_at, clients(company_name)")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at")
      .limit(5),
    supabase
      .from("deliverables")
      .select("id, title, status, clients(company_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("reports")
      .select("id, period_start, period_end, status, clients(company_name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const pendingActions = [
    ...(unsignedContracts ?? []).map((c) => ({
      id: `contract-${c.id}`,
      label: `${c.clients?.company_name} — contract awaiting signature`,
      detail: c.title,
      href: `/dashboard/contracts/${c.id}`,
    })),
    ...(unpaidInvoices ?? []).map((i) => ({
      id: `invoice-${i.id}`,
      label: `${i.clients?.company_name} — invoice unpaid`,
      detail: i.invoice_number,
      href: "/dashboard/invoices",
    })),
    ...(staleAccessRequests ?? []).map((a) => ({
      id: `access-${a.id}`,
      label: `${a.clients?.company_name} — access still needed`,
      detail: a.item,
      href: "/dashboard/access-requests",
    })),
  ];

  return (
    <div className="space-y-10">
      {denied === "role" ? (
        <p role="alert" className="text-sm text-danger-foreground">
          You don&rsquo;t have access to that page.
        </p>
      ) : null}
      <PageHeader title="Dashboard" description="What needs your attention right now." />

      <section className="space-y-3">
        <h2 className="font-heading text-lg tracking-tight">Pending client actions</h2>
        {pendingActions.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nothing pending"
            description="Once contracts, invoices, or access requests are outstanding, they'll show up here."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {pendingActions.map((action) => (
              <li key={action.id}>
                <Link
                  href={action.href}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted"
                >
                  <span>
                    <span className="font-medium">{action.label}</span>
                    <span className="text-muted-foreground"> · {action.detail}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-heading text-lg tracking-tight">
            <CalendarDays className="size-4" aria-hidden="true" />
            Upcoming meetings
          </h2>
          {!upcomingMeetings?.length ? (
            <EmptyState
              icon={CalendarDays}
              title="Nothing scheduled"
              description="Upcoming calls will appear here."
            />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {upcomingMeetings.map((m) => (
                <li key={m.id} className="px-4 py-3 text-sm">
                  <p className="font-medium">{m.title}</p>
                  <p className="text-muted-foreground">
                    {m.clients?.company_name} · {new Date(m.scheduled_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-heading text-lg tracking-tight">
            <PackageCheck className="size-4" aria-hidden="true" />
            Recent deliverables
          </h2>
          {!recentDeliverables?.length ? (
            <EmptyState
              icon={PackageCheck}
              title="Nothing yet"
              description="Uploaded deliverables will appear here."
            />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {recentDeliverables.map((d) => {
                const status = DELIVERABLE_STATUS[d.status] ?? DELIVERABLE_STATUS.draft;
                return (
                  <li key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span>
                      <span className="font-medium">{d.title}</span>
                      <span className="text-muted-foreground"> · {d.clients?.company_name}</span>
                    </span>
                    <StatusBadge tone={status.tone} label={status.label} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-heading text-lg tracking-tight">
          <BarChart3 className="size-4" aria-hidden="true" />
          Recent reports
        </h2>
        {!recentReports?.length ? (
          <EmptyState
            icon={BarChart3}
            title="No reports yet"
            description="Reports you create will appear here."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {recentReports.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>
                  <span className="font-medium">{r.clients?.company_name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {new Date(r.period_start).toLocaleDateString()} –{" "}
                    {new Date(r.period_end).toLocaleDateString()}
                  </span>
                </span>
                <StatusBadge
                  tone={r.status === "published" ? "success" : "neutral"}
                  label={r.status === "published" ? "Published" : "Draft"}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
