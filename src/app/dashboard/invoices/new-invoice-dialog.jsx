"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
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
import { createInvoice } from "./actions";

let nextId = 0;
function makeLineItem() {
  nextId += 1;
  return { key: nextId, description: "", quantity: 1, rate: 0 };
}

export function NewInvoiceDialog({ clients }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [lineItems, setLineItems] = useState([makeLineItem()]);
  const [isPending, startTransition] = useTransition();

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  function handleSubmit(formData) {
    setError(null);
    startTransition(async () => {
      const result = await createInvoice(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setLineItems([makeLineItem()]);
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
            New invoice
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form action={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New invoice</DialogTitle>
            <DialogDescription>Invoice numbers are assigned automatically.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client</Label>
            <ClientSelect clients={clients} required />
          </div>

          <div className="space-y-2">
            <Label>Line items</Label>
            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <div key={item.key} className="flex items-center gap-2">
                  <Input
                    name="description[]"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      setLineItems((items) =>
                        items.map((it, i) =>
                          i === index ? { ...it, description: e.target.value } : it
                        )
                      )
                    }
                    required
                    className="flex-1"
                  />
                  <Input
                    name="quantity[]"
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      setLineItems((items) =>
                        items.map((it, i) =>
                          i === index ? { ...it, quantity: Number(e.target.value) || 0 } : it
                        )
                      )
                    }
                    className="w-16"
                    aria-label="Quantity"
                  />
                  <Input
                    name="rate[]"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) =>
                      setLineItems((items) =>
                        items.map((it, i) =>
                          i === index ? { ...it, rate: Number(e.target.value) || 0 } : it
                        )
                      )
                    }
                    className="w-24"
                    aria-label="Rate"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setLineItems((items) =>
                        items.length > 1 ? items.filter((_, i) => i !== index) : items
                      )
                    }
                    aria-label="Remove line item"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLineItems((items) => [...items, makeLineItem()])}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add line item
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due date</Label>
            <Input id="due_date" name="due_date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_instructions">Payment instructions</Label>
            <Textarea
              id="payment_instructions"
              name="payment_instructions"
              rows={2}
              placeholder="Bank transfer details, payment link, etc."
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-danger-foreground">
              {error}
            </p>
          ) : null}

          <DialogFooter className="items-center justify-between sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-medium text-foreground">${total.toFixed(2)}</span>
            </p>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Create invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
