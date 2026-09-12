"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClientSelect } from "@/components/client-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PERFORMANCE_STATUS } from "@/lib/workflow-status";
import { createReport } from "./actions";

let nextId = 0;
function makeMetric() {
  nextId += 1;
  return { key: nextId };
}

export function NewReportDialog({ clients }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState([makeMetric()]);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    setError(null);
    startTransition(async () => {
      const result = await createReport(formData);
      if (result?.error) setError(result.error);
      else {
        setOpen(false);
        setMetrics([makeMetric()]);
        toast.success("Report draft saved");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError(null);
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" aria-hidden="true" />
            New report
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form action={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <DialogHeader>
            <DialogTitle>New monthly report</DialogTitle>
            <DialogDescription>Saved as a draft until you publish it.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client</Label>
            <ClientSelect clients={clients} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_start">Period start</Label>
              <Input id="period_start" name="period_start" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end">Period end</Label>
              <Input id="period_end" name="period_end" type="date" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Metrics</Label>
            {metrics.map((metric, index) => (
              <div key={metric.key} className="flex items-center gap-2">
                <Input name="metric_label[]" placeholder="Opens" className="flex-1" />
                <Input name="metric_value[]" type="number" step="0.01" className="w-20" aria-label="Value" />
                <Input name="metric_unit[]" placeholder="%" className="w-14" aria-label="Unit" />
                <Select name="metric_performance[]" defaultValue="on_target">
                  <SelectTrigger size="sm" className="w-36">
                    <SelectValue>{(value) => PERFORMANCE_STATUS[value]?.label ?? value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PERFORMANCE_STATUS).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setMetrics((items) => (items.length > 1 ? items.filter((_, i) => i !== index) : items))
                  }
                  aria-label="Remove metric"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMetrics((items) => [...items, makeMetric()])}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add metric
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="executive_summary">Executive summary</Label>
            <Textarea id="executive_summary" name="executive_summary" rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insights">Insights</Label>
            <Textarea id="insights" name="insights" rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea id="recommendations" name="recommendations" rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_priorities">Next month&rsquo;s priorities</Label>
            <Textarea id="next_priorities" name="next_priorities" rows={2} />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-danger-foreground">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Save draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
