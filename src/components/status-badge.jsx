import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  brand: "bg-brand/10 text-brand border-transparent",
  success: "bg-success text-success-foreground border-transparent",
  warning: "bg-warning text-warning-foreground border-transparent",
  danger: "bg-danger text-danger-foreground border-transparent",
  info: "bg-info text-info-foreground border-transparent",
};

/**
 * A status indicator that always pairs color with a text label —
 * status must never be communicated by color alone.
 */
export function StatusBadge({ tone = "neutral", label, className, ...props }) {
  return (
    <Badge
      variant="outline"
      className={cn(TONE_CLASSES[tone] ?? TONE_CLASSES.neutral, className)}
      {...props}
    >
      {label}
    </Badge>
  );
}
