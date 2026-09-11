alter table public.clients
  add column if not exists feedback_requested_at timestamptz;

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  communication_rating int check (communication_rating between 1 and 5),
  quality_rating int check (quality_rating between 1 and 5),
  timeline_rating int check (timeline_rating between 1 and 5),
  overall_rating int check (overall_rating between 1 and 5),
  improvement_notes text,
  wants_testimonial boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  feedback_id uuid references public.feedback (id) on delete set null,
  quote text not null,
  author_name text,
  status text not null default 'submitted'
    check (status in ('requested', 'opened', 'submitted', 'approved', 'published', 'declined')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  published_at timestamptz
);

alter table public.feedback enable row level security;
alter table public.testimonials enable row level security;

create policy "feedback_admin_all" on public.feedback
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "feedback_self_read" on public.feedback
  for select using (client_id = public.current_client_id());
create policy "feedback_self_insert" on public.feedback
  for insert with check (client_id = public.current_client_id());

create policy "testimonials_admin_all" on public.testimonials
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "testimonials_self_read" on public.testimonials
  for select using (client_id = public.current_client_id());
