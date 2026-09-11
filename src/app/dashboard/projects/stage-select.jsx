"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS } from "@/lib/project-status";
import { updateProjectStatus } from "./actions";

export function StageSelect({ projectId, status }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(next) => startTransition(() => updateProjectStatus(projectId, next))}
    >
      <SelectTrigger size="sm" className="w-40">
        <SelectValue>{(value) => PROJECT_STATUS[value]?.label ?? value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(PROJECT_STATUS).map(([value, { label }]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
