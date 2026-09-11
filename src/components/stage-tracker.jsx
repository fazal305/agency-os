import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A linear step tracker: steps before `currentIndex` are done, the step at
 * `currentIndex` is current, everything after is upcoming. Used for project
 * stages and the client-facing onboarding/production timeline.
 */
export function StageTracker({ steps, currentIndex }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs",
                isDone && "border-success bg-success text-success-foreground",
                isCurrent && "border-brand bg-brand text-brand-foreground",
                !isDone && !isCurrent && "border-border text-transparent"
              )}
              aria-hidden="true"
            >
              {isDone ? <Check className="size-3" /> : null}
            </span>
            <span
              className={cn(
                "text-sm",
                isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {step}
              {isCurrent ? <span className="sr-only"> (current stage)</span> : null}
              {isDone ? <span className="sr-only"> (complete)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
