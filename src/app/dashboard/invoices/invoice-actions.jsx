"use client";

import { useTransition } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendInvoice, markInvoicePaid } from "./actions";

export function InvoiceActions({ invoiceId, status }) {
  const [isPending, startTransition] = useTransition();

  if (status === "draft") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => sendInvoice(invoiceId))}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-3.5" aria-hidden="true" />
        )}
        Send
      </Button>
    );
  }

  if (["sent", "viewed", "due", "overdue"].includes(status)) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => markInvoicePaid(invoiceId))}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
        )}
        Mark paid
      </Button>
    );
  }

  return null;
}
