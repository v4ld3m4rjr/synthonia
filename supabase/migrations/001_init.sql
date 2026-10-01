-- ============================================================
-- BiomechAI · Schema Supabase
-- Execute no SQL Editor do seu projeto (ou `supabase db push`)
-- ============================================================

-- Perfis dos usuários (vinculados a auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  role text check (role in ('athlete','coach','physiotherapist')) default 'athlete',
  birth_date date,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_upsert_own" on public.users;
create policy "users_upsert_own" on public.users
  for insert with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Avaliações biomecânicas (estáticas e dinâmicas)
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('statico','dinamico')),
  vista text not null check (vista in ('frontal','lateral','posterior')),
  score int not null default 0,
  resumo_ia text,
  achados jsonb not null default '[]'::jsonb,
  exercicios jsonb not null default '[]'::jsonb,
  metricas jsonb not null default '{}'::jsonb,
  video_url text,
  duracao_s numeric default 0,
  frames_analisados int default 0,
  created_at timestamptz not null default now()
);

create index if not exists assessments_user_idx on public.assessments (user_id, created_at desc);

alter table public.assessments enable row level security;

drop policy if exists "assessments_select_own" on public.assessments;
create policy "assessments_select_own" on public.assessments
  for select using (auth.uid() = user_id);

drop policy if exists "assessments_insert_own" on public.assessments;
create policy "assessments_insert_own" on public.assessments
  for insert with check (auth.uid() = user_id);

-- Trigger: cria o perfil automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    case
      when new.raw_user_meta_data ->> 'role' = 'treinador' then 'coach'
      when new.raw_user_meta_data ->> 'role' = 'fisioterapeuta' then 'physiotherapist'
      else 'athlete'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
