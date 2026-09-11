"use client";

import { useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendWelcome } from "./actions";

export function SendWelcomeButton({ clientId, sent }) {
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return <span className="text-xs text-muted-foreground">Sent {new Date(sent).toLocaleDateString()}</span>;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => sendWelcome(clientId))}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <Send className="size-3.5" aria-hidden="true" />
      )}
      Send welcome
    </Button>
  );
}
