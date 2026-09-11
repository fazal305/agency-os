-- Agency OS — initial schema: profiles, clients, and the RLS policies that
-- enforce client isolation at the database level (never trust the frontend
-- for authorization).

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  primary_contact_name text,
  primary_contact_email text,
  phone text,
  website text,
  industry text,
  status text not null default 'prospect'
    check (status in ('prospect', 'onboarding', 'active', 'paused', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per authenticated user (both agency team members and client
-- contacts), extending auth.users. `client_id` is set only for role='client'
-- and identifies which client company that portal user belongs to.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'client' check (role in ('admin', 'client')),
  full_name text,
  client_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_client_id_idx on public.profiles (client_id);

-- Security-definer helpers so RLS policies can check the caller's role/client
-- without recursively re-triggering RLS on `profiles` itself.
create or replace function public.current_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_client_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select client_id from public.profiles where id = auth.uid();
$$;

-- Auto-create a profile row whenever a new auth user signs up. Role and name
-- come from signup metadata; defaults to 'client' if unspecified.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.clients enable row level security;
alter table public.profiles enable row level security;

-- clients: agency admins have full access; a client contact can only read
-- their own client row.
create policy "clients_admin_all" on public.clients
  for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "clients_self_read" on public.clients
  for select
  using (id = public.current_client_id());

-- profiles: everyone can read/update their own row; admins can read every
-- profile (needed to list team/client contacts).
create policy "profiles_self_read" on public.profiles
  for select
  using (id = auth.uid());

create policy "profiles_admin_read_all" on public.profiles
  for select
  using (public.current_role() = 'admin');

create policy "profiles_self_update" on public.profiles
  for update
  using (id = auth.uid());
