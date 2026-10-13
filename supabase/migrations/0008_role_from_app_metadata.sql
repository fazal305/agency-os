-- raw_user_meta_data is supplied by whoever signs up, so trusting its "role"
-- let anyone register as an admin. raw_app_meta_data can only be set with the
-- service-role key, so the role now comes from there.
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
    case when new.raw_app_meta_data ->> 'role' = 'admin' then 'admin' else 'client' end,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
