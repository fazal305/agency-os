import { test } from "node:test";
import assert from "node:assert/strict";
import { invoiceTotal, displayInvoiceStatus } from "../src/lib/invoice-helpers.js";

test("invoiceTotal sums quantity * rate across line items", () => {
  assert.equal(
    invoiceTotal([
      { quantity: 2, rate: 50 },
      { quantity: 1, rate: 25 },
    ]),
    125
  );
});

test("invoiceTotal returns 0 for no line items", () => {
  assert.equal(invoiceTotal([]), 0);
  assert.equal(invoiceTotal(undefined), 0);
});

test("displayInvoiceStatus leaves draft/paid/cancelled untouched even if overdue", () => {
  const pastDue = { status: "paid", due_date: "2020-01-01" };
  assert.equal(displayInvoiceStatus(pastDue), "paid");
});

test("displayInvoiceStatus reports overdue for unpaid invoices past due_date", () => {
  const overdue = { status: "sent", due_date: "2020-01-01" };
  assert.equal(displayInvoiceStatus(overdue), "overdue");
});

test("displayInvoiceStatus keeps stored status when not yet due", () => {
  const future = { status: "sent", due_date: "2999-01-01" };
  assert.equal(displayInvoiceStatus(future), "sent");
});

test("displayInvoiceStatus keeps stored status when there is no due_date", () => {
  const noDueDate = { status: "sent", due_date: null };
  assert.equal(displayInvoiceStatus(noDueDate), "sent");
});
