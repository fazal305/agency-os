import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/require-role";
import { MEETING_TYPE_LABEL } from "@/lib/project-status";

export const metadata = { title: "Meetings" };

export default async function PortalMeetingsPage() {
  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, title, type, scheduled_at, meeting_link, notes")
    .eq("client_id", profile.client_id)
    .order("scheduled_at", { ascending: true });

  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        description="Your calls with us, scheduled and past."
        actions={
          bookingUrl ? (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:underline"
            >
              Schedule a call
            </a>
          ) : null
        }
      />

      {!meetings?.length ? (
        <EmptyState
          icon={CalendarDays}
          title="No meetings scheduled"
          description="When a call is booked, it'll show up here with the link and time."
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {meetings.map((meeting) => (
            <li key={meeting.id} className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm font-medium">{meeting.title}</p>
                <p className="text-xs text-muted-foreground">
                  {MEETING_TYPE_LABEL[meeting.type]} ·{" "}
                  {new Date(meeting.scheduled_at).toLocaleString()}
                </p>
              </div>
              {meeting.meeting_link ? (
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand hover:underline"
                >
                  Join
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
