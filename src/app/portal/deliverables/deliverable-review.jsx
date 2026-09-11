"use client";

import { useState, useTransition } from "react";
import { Loader2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveDeliverable, requestRevision } from "./actions";

export function DeliverableReview({ deliverableId }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await approveDeliverable(deliverableId);
            if (result?.error) setError(result.error);
          })
        }
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <ThumbsUp className="size-3.5" aria-hidden="true" />
        )}
        Approve
      </Button>

      <div className="space-y-2">
        <Textarea
          rows={2}
          placeholder="Or describe what needs to change..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={isPending || !note.trim()}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await requestRevision(deliverableId, note);
              if (result?.error) setError(result.error);
              else setNote("");
            })
          }
        >
          Request revision
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
