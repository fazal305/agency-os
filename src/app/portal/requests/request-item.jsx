"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { ACCESS_STATUS } from "@/lib/workflow-status";
import { submitAccessRequest } from "./actions";

export function RequestItem({ request }) {
  const [notes, setNotes] = useState(request.notes ?? "");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const status = ACCESS_STATUS[request.status] ?? ACCESS_STATUS.requested;
  const canSubmit = ["requested", "needs_attention"].includes(request.status);

  return (
    <li className="space-y-3 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{request.item}</p>
          {request.description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{request.description}</p>
          ) : null}
          {request.due_date ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Due {new Date(request.due_date).toLocaleDateString()}
            </p>
          ) : null}
        </div>
        <StatusBadge tone={status.tone} label={status.label} />
      </div>

      {canSubmit ? (
        <div className="space-y-2">
          <Textarea
            rows={2}
            placeholder="Add a note (a link to the file, where to find it, etc.)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {error ? (
            <p role="alert" className="text-sm text-danger-foreground">
              {error}
            </p>
          ) : null}
          <Button
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await submitAccessRequest(request.id, notes);
                if (result?.error) setError(result.error);
              })
            }
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Mark as submitted
          </Button>
        </div>
      ) : request.notes ? (
        <p className="text-sm text-muted-foreground">Note: {request.notes}</p>
      ) : null}
    </li>
  );
}
