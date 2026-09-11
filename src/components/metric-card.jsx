import { StatusBadge } from "@/components/status-badge";
import { PERFORMANCE_STATUS } from "@/lib/workflow-status";

export function MetricCard({ metric }) {
  const performance = PERFORMANCE_STATUS[metric.performance] ?? PERFORMANCE_STATUS.on_target;
  const delta =
    metric.previous_value != null ? metric.value - metric.previous_value : null;

  return (
    <div className="space-y-2 rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{metric.label}</p>
      <p className="font-heading text-2xl tracking-tight">
        {metric.value}
        {metric.unit ? <span className="text-base text-muted-foreground">{metric.unit}</span> : null}
      </p>
      {delta !== null ? (
        <p className="text-xs text-muted-foreground">
          {delta >= 0 ? "+" : ""}
          {delta.toFixed(1)}
          {metric.unit} vs. previous period
        </p>
      ) : null}
      <StatusBadge tone={performance.tone} label={performance.label} />
    </div>
  );
}
