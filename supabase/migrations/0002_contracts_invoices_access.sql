-- Contracts, invoices, and access requests — the pre-kickoff onboarding
-- workflow. All client-owned rows follow the same isolation pattern as
-- 0001_init.sql: admins get full access, clients can only read/touch rows
-- matching their own client_id.

alter table public.clients
  add column if not exists welcome_sent_at timestamptz,
  add column if not exists welcome_viewed_at timestamptz;

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  title text not null,
  scope_summary text,
  services text,
  timeline text,
  payment_terms text,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'viewed', 'signed', 'declined', 'expired')),
  sent_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  signed_by_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  contract_id uuid references public.contracts (id) on delete set null,
  invoice_number text not null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'viewed', 'due', 'paid', 'overdue', 'cancelled')),
  issue_date date not null default current_date,
  due_date date,
  payment_instructions text,
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  rate numeric not null default 0,
  sort_order int not null default 0
);

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  item text not null,
  description text,
  owner text not null default 'client' check (owner in ('agency', 'client')),
  status text not null default 'requested'
    check (status in ('not_requested', 'requested', 'received', 'verified', 'needs_attention', 'complete')),
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contracts enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.access_requests enable row level security;

create policy "contracts_admin_all" on public.contracts
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "contracts_self_read" on public.contracts
  for select using (client_id = public.current_client_id());
-- A client may only sign: RLS can't restrict which columns change, so the
-- app only ever sends status/signed_at/signed_by_name from the client sign
-- action, and only while the contract already belongs to them.
create policy "contracts_self_sign" on public.contracts
  for update using (client_id = public.current_client_id())
  with check (client_id = public.current_client_id());

create policy "invoices_admin_all" on public.invoices
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "invoices_self_read" on public.invoices
  for select using (client_id = public.current_client_id());

create policy "line_items_admin_all" on public.invoice_line_items
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "line_items_self_read" on public.invoice_line_items
  for select using (
    invoice_id in (select id from public.invoices where client_id = public.current_client_id())
  );

create policy "access_requests_admin_all" on public.access_requests
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "access_requests_self_read" on public.access_requests
  for select using (client_id = public.current_client_id());
create policy "access_requests_self_update" on public.access_requests
  for update using (client_id = public.current_client_id())
  with check (client_id = public.current_client_id());
