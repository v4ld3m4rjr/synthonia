-- RLS policies to allow coach listing without authentication and preserve privacy
-- This migration assumes public.users table exists. If not, run the create table migration first.

-- Ensure RLS is enabled (idempotent)
alter table if exists public.users enable row level security;

-- Create policies only if they do not exist yet
do $$
begin
  -- Allow anonymous users to read coaches only (used on signup screen)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'users' and policyname = 'Anon can select coaches'
  ) then
    create policy "Anon can select coaches"
      on public.users
      for select
      to anon
      using (role = 'coach');
  end if;

  -- Allow authenticated users to read coaches or their own profile
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'users' and policyname = 'Authenticated can select coaches or own profile'
  ) then
    create policy "Authenticated can select coaches or own profile"
      on public.users
      for select
      to authenticated
      using (role = 'coach' or id = auth.uid());
  end if;
end
$$;

-- Helpful index (idempotent)
create index if not exists users_role_idx on public.users (role);