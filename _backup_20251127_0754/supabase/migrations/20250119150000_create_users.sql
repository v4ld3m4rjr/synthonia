-- Create users table in public schema if it does not exist
create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  name text,
  birth_date date,
  role text check (role in ('athlete','coach','physiotherapist')) default 'athlete',
  coach_id uuid null references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  avatar_url text
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Policies: allow authenticated users to manage their own profile
create policy if not exists "Users can select own profile"
  on public.users
  for select
  to authenticated
  using (id = auth.uid());

create policy if not exists "Users can insert own profile"
  on public.users
  for insert
  to authenticated
  with check (id = auth.uid());

create policy if not exists "Users can update own profile"
  on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Helpful index for lookups
create index if not exists users_email_idx on public.users (email);