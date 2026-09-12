"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { createAccessRequest } from "./actions";

export function NewRequestDialog({ clients }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    setError(null);
    startTransition(async () => {
      const result = await createAccessRequest(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        toast.success("Access request added");
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
            New request
          </Button>
        }
      />
      <DialogContent>
        <form action={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New access request</DialogTitle>
            <DialogDescription>
              Add an item to the client&rsquo;s onboarding checklist.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client</Label>
            <ClientSelect clients={clients} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item">Item</Label>
            <Input id="item" name="item" placeholder="Logo files" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Notes for the client</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Select name="owner" defaultValue="client">
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value) => (value === "agency" ? "Agency" : "Client")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-danger-foreground">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Add item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
