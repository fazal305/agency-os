"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createInvoice(formData) {
  const clientId = formData.get("client_id")?.toString();
  const descriptions = formData.getAll("description[]").map((v) => v.toString().trim());
  const quantities = formData.getAll("quantity[]").map((v) => Number(v) || 0);
  const rates = formData.getAll("rate[]").map((v) => Number(v) || 0);

  if (!clientId) return { error: "Client is required." };

  const lineItems = descriptions
    .map((description, i) => ({ description, quantity: quantities[i], rate: rates[i] }))
    .filter((item) => item.description);

  if (lineItems.length === 0) {
    return { error: "Add at least one line item." };
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true });
  const invoiceNumber = `INV-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      client_id: clientId,
      invoice_number: invoiceNumber,
      due_date: formData.get("due_date")?.toString() || null,
      payment_instructions: formData.get("payment_instructions")?.toString().trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Couldn't create the invoice. Please try again." };
  }

  const { error: lineItemsError } = await supabase.from("invoice_line_items").insert(
    lineItems.map((item, i) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      sort_order: i,
    }))
  );

  if (lineItemsError) {
    return { error: "Invoice created, but line items failed to save." };
  }

  revalidatePath("/dashboard/invoices");
  return { success: true };
}

export async function sendInvoice(invoiceId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .eq("status", "draft");

  if (error) return { error: "Couldn't send the invoice." };
  revalidatePath("/dashboard/invoices");
  return { success: true };
}

export async function markInvoicePaid(invoiceId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) return { error: "Couldn't update the invoice." };
  revalidatePath("/dashboard/invoices");
  return { success: true };
}
