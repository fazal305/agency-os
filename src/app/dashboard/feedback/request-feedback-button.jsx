"use client";

import { useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestFeedback } from "./actions";

export function RequestFeedbackButton({ clientId, requested }) {
  const [isPending, startTransition] = useTransition();

  if (requested) {
    return (
      <span className="text-xs text-muted-foreground">
        Requested {new Date(requested).toLocaleDateString()}
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => requestFeedback(clientId))}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <Send className="size-3.5" aria-hidden="true" />
      )}
      Request feedback
    </Button>
  );
}
