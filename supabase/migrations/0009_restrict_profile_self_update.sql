-- profiles_self_update had no column restriction, so a client could set their
-- own role to 'admin' or point client_id at another company. Signed-in users
-- may now only change their display name; role and client_id are managed with
-- the service-role key.
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
