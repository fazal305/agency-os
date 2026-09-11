import { MessageSquareHeart } from "lucide-react";
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
import { TESTIMONIAL_STATUS } from "@/lib/workflow-status";
import { RequestFeedbackButton } from "./request-feedback-button";
import { TestimonialActions } from "./testimonial-actions";

export const metadata = { title: "Feedback" };

export default async function FeedbackPage() {
  const supabase = await createClient();
  const [{ data: clients }, { data: feedback }, { data: testimonials }] = await Promise.all([
    supabase.from("clients").select("id, company_name, feedback_requested_at").order("company_name"),
    supabase
      .from("feedback")
      .select("id, overall_rating, improvement_notes, created_at, clients(company_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("testimonials")
      .select("id, quote, author_name, status, clients(company_name)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader title="Feedback" description="Requests, responses, and testimonials." />

      <section className="space-y-3">
        <h2 className="font-heading text-lg tracking-tight">Request feedback</h2>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {(clients ?? []).map((client) => (
            <li key={client.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium">{client.company_name}</span>
              <RequestFeedbackButton clientId={client.id} requested={client.feedback_requested_at} />
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg tracking-tight">Responses</h2>
        {!feedback?.length ? (
          <EmptyState
            icon={MessageSquareHeart}
            title="No responses yet"
            description="Submitted feedback will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Overall</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="text-muted-foreground">
                    {f.clients?.company_name ?? "—"}
                  </TableCell>
                  <TableCell className="font-medium">{f.overall_rating}/5</TableCell>
                  <TableCell className="max-w-sm truncate text-muted-foreground">
                    {f.improvement_notes || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg tracking-tight">Testimonials</h2>
        {!testimonials?.length ? (
          <EmptyState
            icon={MessageSquareHeart}
            title="No testimonials yet"
            description="Testimonials submitted with feedback will appear here for review."
          />
        ) : (
          <ul className="space-y-3">
            {testimonials.map((t) => {
              const status = TESTIMONIAL_STATUS[t.status] ?? TESTIMONIAL_STATUS.submitted;
              return (
                <li key={t.id} className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm italic">&ldquo;{t.quote}&rdquo;</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.author_name || t.clients?.company_name}
                      </p>
                    </div>
                    <StatusBadge tone={status.tone} label={status.label} />
                  </div>
                  <TestimonialActions testimonialId={t.id} status={t.status} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
