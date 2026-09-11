import { CalendarDays } from "lucide-react";
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
import { MEETING_TYPE_LABEL } from "@/lib/project-status";
import { NewMeetingDialog } from "./new-meeting-dialog";

export const metadata = { title: "Meetings" };

export default async function MeetingsPage() {
  const supabase = await createClient();
  const [{ data: meetings, error }, clients] = await Promise.all([
    supabase
      .from("meetings")
      .select("id, title, type, scheduled_at, meeting_link, clients(company_name)")
      .order("scheduled_at", { ascending: true }),
    getClientOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        description="Every call, scheduled and past."
        actions={<NewMeetingDialog clients={clients} />}
      />

      {error ? (
        <EmptyState
          icon={CalendarDays}
          title="We couldn't load meetings"
          description="Something went wrong reaching the database. Try refreshing the page."
        />
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No meetings scheduled"
          description="Schedule a kickoff call or check-in with a client."
          action={<NewMeetingDialog clients={clients} />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meeting</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.map((meeting) => (
              <TableRow key={meeting.id}>
                <TableCell className="font-medium">{meeting.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {meeting.clients?.company_name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {MEETING_TYPE_LABEL[meeting.type]}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(meeting.scheduled_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {meeting.meeting_link ? (
                    <a
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand hover:underline"
                    >
                      Join
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
