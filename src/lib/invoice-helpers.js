export function invoiceTotal(lineItems) {
  return (lineItems ?? []).reduce((sum, item) => sum + item.quantity * item.rate, 0);
}

/** Derive a display status without mutating the stored one — "overdue" is a
 * read-time view of an unpaid invoice past its due date, not a separate
 * state the app has to remember to set. */
export function displayInvoiceStatus(invoice) {
  if (["draft", "paid", "cancelled"].includes(invoice.status)) return invoice.status;
  if (invoice.due_date && new Date(invoice.due_date) < new Date()) return "overdue";
  return invoice.status;
}
