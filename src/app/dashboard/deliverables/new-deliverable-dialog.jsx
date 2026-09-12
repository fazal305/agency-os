"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, Upload } from "lucide-react";
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
import { createDeliverable } from "./actions";

export function NewDeliverableDialog({ clients, projects }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    setError(null);
    startTransition(async () => {
      const result = await createDeliverable(formData);
      if (result?.error) setError(result.error);
      else {
        setOpen(false);
        toast.success("Deliverable uploaded");
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
            <Upload className="size-4" aria-hidden="true" />
            Upload deliverable
          </Button>
        }
      />
      <DialogContent>
        <form action={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Upload a deliverable</DialogTitle>
            <DialogDescription>Starts as a draft, visible only internally.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client</Label>
            <ClientSelect clients={clients} required />
          </div>
          {projects.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="project_id">Project (optional)</Label>
              <Select name="project_id">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None">
                    {(value) => {
                      const project = projects.find((p) => p.id === value);
                      return project ? `${project.name} — ${project.clients?.company_name}` : "None";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} — {project.clients?.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" required />
            <p className="text-xs text-muted-foreground">Up to 25MB.</p>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-danger-foreground">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
