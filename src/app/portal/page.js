import Link from "next/link";
import { Compass, CalendarDays, PackageCheck, Inbox } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";
import { PROJECT_STATUS } from "@/lib/project-status";

export const metadata = { title: "Overview" };

export default async function PortalOverviewPage({ searchParams }) {
  const { denied } = (await searchParams) ?? {};
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const [
    { data: project },
    { data: nextMeeting },
    { data: pendingRequests },
    { data: reviewDeliverables },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status")
      .eq("client_id", profile.client_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("meetings")
      .select("id, title, scheduled_at")
      .eq("client_id", profile.client_id)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("access_requests")
      .select("id, item")
      .eq("client_id", profile.client_id)
      .in("status", ["requested", "needs_attention"]),
    supabase
      .from("deliverables")
      .select("id, title, status")
      .eq("client_id", profile.client_id)
      .eq("status", "client_review"),
  ]);

  const hasAnything = project || nextMeeting || pendingRequests?.length || reviewDeliverables?.length;

  return (
    <div className="space-y-8">
      {denied === "role" ? (
        <p role="alert" className="text-sm text-danger-foreground">
          You don&rsquo;t have access to that page.
        </p>
      ) : null}
      <PageHeader title="Overview" description="Your project at a glance." />

      {!hasAnything ? (
        <EmptyState
          icon={Compass}
          title="Your project isn't set up yet"
          description="Once your agency contact starts your onboarding, your current stage, next milestone, and pending actions will appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {project ? (
            <Link
              href={`/portal/projects/${project.id}`}
              className="space-y-1 rounded-lg border border-border p-5 hover:bg-muted"
            >
              <p className="text-sm text-muted-foreground">Current project</p>
              <p className="font-medium">{project.name}</p>
              <StatusBadge
                tone={PROJECT_STATUS[project.status]?.tone ?? "neutral"}
                label={PROJECT_STATUS[project.status]?.label ?? project.status}
              />
            </Link>
          ) : null}

          {nextMeeting ? (
            <Link
              href="/portal/meetings"
              className="space-y-1 rounded-lg border border-border p-5 hover:bg-muted"
            >
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden="true" />
                Next meeting
              </p>
              <p className="font-medium">{nextMeeting.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(nextMeeting.scheduled_at).toLocaleString()}
              </p>
            </Link>
          ) : null}

          {pendingRequests?.length ? (
            <Link
              href="/portal/requests"
              className="space-y-1 rounded-lg border border-border p-5 hover:bg-muted"
            >
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Inbox className="size-4" aria-hidden="true" />
                Pending requests
              </p>
              <p className="font-medium">{pendingRequests.length} item(s) need your attention</p>
            </Link>
          ) : null}

          {reviewDeliverables?.length ? (
            <Link
              href="/portal/deliverables"
              className="space-y-1 rounded-lg border border-border p-5 hover:bg-muted"
            >
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <PackageCheck className="size-4" aria-hidden="true" />
                Ready for review
              </p>
              <p className="font-medium">
                {reviewDeliverables.length} deliverable(s) awaiting your review
              </p>
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
