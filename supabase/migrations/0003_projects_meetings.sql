-- Projects, milestones, and meetings.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'discovery'
    check (status in ('discovery', 'strategy', 'planning', 'production', 'review', 'revision', 'approval', 'delivered')),
  start_date date,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  due_date date,
  completed_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  type text not null default 'other'
    check (type in ('kickoff', 'consultation', 'feedback', 'review', 'strategy', 'deliverable_review', 'other')),
  scheduled_at timestamptz not null,
  meeting_link text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.meetings enable row level security;

create policy "projects_admin_all" on public.projects
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "projects_self_read" on public.projects
  for select using (client_id = public.current_client_id());

create policy "milestones_admin_all" on public.milestones
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "milestones_self_read" on public.milestones
  for select using (
    project_id in (select id from public.projects where client_id = public.current_client_id())
  );

create policy "meetings_admin_all" on public.meetings
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "meetings_self_read" on public.meetings
  for select using (client_id = public.current_client_id());
