create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  executive_summary text,
  insights text,
  recommendations text,
  next_priorities text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.report_metrics (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  label text not null,
  value numeric not null default 0,
  unit text,
  previous_value numeric,
  performance text not null default 'on_target'
    check (performance in ('excellent', 'on_target', 'needs_attention', 'below_target')),
  sort_order int not null default 0
);

alter table public.reports enable row level security;
alter table public.report_metrics enable row level security;

create policy "reports_admin_all" on public.reports
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "reports_self_read" on public.reports
  for select using (client_id = public.current_client_id() and status = 'published');

create policy "report_metrics_admin_all" on public.report_metrics
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "report_metrics_self_read" on public.report_metrics
  for select using (
    report_id in (
      select id from public.reports
      where client_id = public.current_client_id() and status = 'published'
    )
  );
