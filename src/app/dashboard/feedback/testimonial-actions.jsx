"use client";

import { useTransition } from "react";
import { Loader2, Check, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateTestimonialStatus } from "./actions";

export function TestimonialActions({ testimonialId, status }) {
  const [isPending, startTransition] = useTransition();

  function act(next) {
    startTransition(() => updateTestimonialStatus(testimonialId, next));
  }

  if (status === "submitted") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => act("approved")}>
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          Approve
        </Button>
        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => act("declined")}>
          <X className="size-3.5" />
          Decline
        </Button>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => act("published")}>
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Globe className="size-3.5" />}
        Mark published
      </Button>
    );
  }

  return null;
}
