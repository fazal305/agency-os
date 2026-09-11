"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DELIVERABLE_STATUS } from "@/lib/workflow-status";
import { updateDeliverableStatus } from "./actions";

export function StatusSelect({ deliverableId, status }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(next) => startTransition(() => updateDeliverableStatus(deliverableId, next))}
    >
      <SelectTrigger size="sm" className="w-44">
        <SelectValue>{(value) => DELIVERABLE_STATUS[value]?.label ?? value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DELIVERABLE_STATUS).map(([value, { label }]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
