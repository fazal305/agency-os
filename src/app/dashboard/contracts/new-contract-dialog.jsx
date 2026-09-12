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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createContract } from "./actions";

export function NewContractDialog({ clients }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    setError(null);
    startTransition(async () => {
      const result = await createContract(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        toast.success("Contract draft created");
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
            New contract
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form action={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New contract</DialogTitle>
            <DialogDescription>
              Drafts stay editable until you send them to the client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client</Label>
            <ClientSelect clients={clients} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Services Agreement" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scope_summary">Scope of work</Label>
            <Textarea id="scope_summary" name="scope_summary" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="services">Services &amp; deliverables</Label>
            <Textarea id="services" name="services" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Input id="timeline" name="timeline" placeholder="6 weeks" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment terms</Label>
              <Input id="payment_terms" name="payment_terms" placeholder="50% upfront" />
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
              Create draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
