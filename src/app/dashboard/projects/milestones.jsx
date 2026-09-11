"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addMilestone, toggleMilestone } from "./actions";

export function Milestones({ projectId, milestones }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function handleAdd(formData) {
    setError(null);
    startTransition(async () => {
      const result = await addMilestone(projectId, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(milestone.completed_at)}
              onChange={(e) =>
                startTransition(() => toggleMilestone(milestone.id, projectId, e.target.checked))
              }
              className="size-4 rounded border-border"
              aria-label={`Mark "${milestone.title}" complete`}
            />
            <span
              className={
                milestone.completed_at
                  ? "text-sm text-muted-foreground line-through"
                  : "text-sm"
              }
            >
              {milestone.title}
            </span>
            {milestone.due_date ? (
              <span className="text-xs text-muted-foreground">
                {new Date(milestone.due_date).toLocaleDateString()}
              </span>
            ) : null}
          </li>
        ))}
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No milestones yet.</p>
        ) : null}
      </ul>

      <form action={handleAdd} className="flex items-center gap-2">
        <Input name="title" placeholder="Add a milestone" className="flex-1" required />
        <Input name="due_date" type="date" className="w-40" />
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-3.5" aria-hidden="true" />
          )}
          Add
        </Button>
      </form>
      {error ? (
        <p role="alert" className="text-sm text-danger-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
