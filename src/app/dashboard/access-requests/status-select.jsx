"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCESS_STATUS } from "@/lib/workflow-status";
import { updateAccessRequestStatus } from "./actions";

export function StatusSelect({ requestId, status }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(next) => startTransition(() => updateAccessRequestStatus(requestId, next))}
    >
      <SelectTrigger size="sm" className="w-40">
        <SelectValue>{(value) => ACCESS_STATUS[value]?.label ?? value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ACCESS_STATUS).map(([value, { label }]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
