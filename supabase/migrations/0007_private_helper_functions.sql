-- Keep the RLS helper functions out of the API-exposed public schema so they
-- can't be called directly via /rest/v1/rpc. Policies reference functions by
-- OID, so moving them does not require recreating any policy.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

alter function public."current_role"() set schema private;
alter function public.current_client_id() set schema private;

revoke execute on function private."current_role"(), private.current_client_id() from public;
grant execute on function private."current_role"(), private.current_client_id() to anon, authenticated, service_role;

-- Only ever fired by the on_auth_user_created trigger; nobody needs to call it.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
