-- Deliverables: agency-uploaded files that move through a review pipeline,
-- with a private Storage bucket scoped per-client so no client can ever list
-- or download another client's files.

create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  description text,
  version int not null default 1,
  status text not null default 'draft'
    check (status in ('draft', 'internal_review', 'client_review', 'revision_requested', 'approved', 'delivered')),
  file_path text,
  file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliverable_comments (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.deliverables enable row level security;
alter table public.deliverable_comments enable row level security;

create policy "deliverables_admin_all" on public.deliverables
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "deliverables_self_read" on public.deliverables
  for select using (
    client_id = public.current_client_id() and status in ('client_review', 'revision_requested', 'approved', 'delivered')
  );
-- A client may only approve or request a revision on a deliverable already
-- in client_review; the app only ever writes the `status` column here.
create policy "deliverables_self_review" on public.deliverables
  for update
  using (client_id = public.current_client_id() and status = 'client_review')
  with check (client_id = public.current_client_id());

create policy "deliverable_comments_admin_all" on public.deliverable_comments
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "deliverable_comments_self_read" on public.deliverable_comments
  for select using (
    deliverable_id in (select id from public.deliverables where client_id = public.current_client_id())
  );
create policy "deliverable_comments_self_insert" on public.deliverable_comments
  for insert with check (
    deliverable_id in (
      select id from public.deliverables
      where client_id = public.current_client_id()
        and status in ('client_review', 'revision_requested', 'approved', 'delivered')
    )
  );

-- Private storage bucket: files live at <client_id>/<deliverable_id>/<filename>
insert into storage.buckets (id, name, public)
values ('deliverables', 'deliverables', false)
on conflict (id) do nothing;

create policy "deliverables_storage_admin_all" on storage.objects
  for all
  using (bucket_id = 'deliverables' and public.current_role() = 'admin')
  with check (bucket_id = 'deliverables' and public.current_role() = 'admin');

create policy "deliverables_storage_client_read" on storage.objects
  for select
  using (
    bucket_id = 'deliverables'
    and (storage.foldername(name))[1] = public.current_client_id()::text
  );
