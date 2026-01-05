Synthonia2

Guia rápido para configurar Supabase (tabela users e políticas RLS)

- Objetivo: eliminar o erro 404 ao consultar `public.users` na tela de cadastro e permitir o envio de e-mail de confirmação sem bloquear o fluxo.

1) Criar a tabela `public.users` (se ainda não existir)

```
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

alter table public.users enable row level security;

create index if not exists users_email_idx on public.users (email);
```

2) Adicionar políticas RLS para listar treinadores sem autenticação (apenas leitura)

```
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='Anon can select coaches'
  ) then
    create policy "Anon can select coaches"
      on public.users
      for select
      to anon
      using (role = 'coach');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='Authenticated can select coaches or own profile'
  ) then
    create policy "Authenticated can select coaches or own profile"
      on public.users
      for select
      to authenticated
      using (role = 'coach' or id = auth.uid());
  end if;
end
$$;
```

3) Políticas de CRUD do próprio perfil (para usuários autenticados)

```
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
```

Como aplicar no Supabase

- Dashboard → SQL editor → cole e execute os blocos acima na ordem (1 → 2 → 3).
- Alternativa (CLI): usando `supabase` CLI com projeto vinculado, execute os arquivos em `supabase/migrations/` (ex.: `supabase db execute -f supabase/migrations/20250119150000_create_users.sql` e `supabase/migrations/20251015170500_users_policies_coach_select.sql`).

Configuração de e-mail de confirmação

- Em Authentication → Email → habilitar “Confirm email”.
- Em Authentication → URL → definir `Site URL` com seu domínio (ex.: `https://seu-dominio.com/`) ou durante testes `http://localhost:4173/`.
- O app usa `emailRedirectTo` com a origem atual, então após confirmar você será redirecionado ao host do app.

Observações

- Se a lista de treinadores estiver vazia, o cadastro não será bloqueado e o e-mail de confirmação será enviado normalmente.
- Para povoar treinadores, você pode inserir registros diretamente na tabela `public.users` com `role = 'coach'`.

Templates de e-mail (Supabase)

- Em Authentication → Templates → Confirm signup:
  - Assunto: `Confirme seu e‑mail — Synthonia AI`.
  - HTML: use o arquivo `supabase/email_templates/confirm-signup.html` deste repositório.
  - Texto: use o arquivo `supabase/email_templates/confirm-signup.txt`.
  - Salve as alterações.
- Dica: mantenha o link `{{ .ConfirmationURL }}` exatamente como nos exemplos.

Logs e entregabilidade

- Authentication → Logs: monitore eventos “Email sent”, “Mailer error”, “Redirect not allowed”, “Rate limit”.
- Authentication → Email:
  - Ative “Confirm email”.
  - Configure “From email” e, se usar SMTP custom, valide host/porta/TLS/usuário/senha.
- Authentication → URL Configuration:
  - `Site URL`: `https://synthonia.app/`.
  - `Additional Redirect URLs`: `https://synthonia.app/`, `http://localhost:5177/` (dev) e `http://localhost:4173/` (preview).
- DNS do domínio (se usar remetente próprio): configure SPF, DKIM e DMARC para melhorar entregabilidade.

Reenvio de confirmação

- A tela de cadastro exibe confirmação e um botão “Reenviar e‑mail de confirmação”.
- Alternativamente, use o painel de usuários do Supabase: selecione o usuário e clique em “Resend confirmation email”.

Configurar provedor de e‑mail (SMTP)

- Use o guia em `supabase/email_provider_config.md` para configurar SendGrid, Mailgun ou Amazon SES.
- Em Supabase → Authentication → Email → Mail provider: selecione “Custom SMTP” e preencha:
  - `SMTP Host`, `SMTP Port` (587/465), `Secure` (false para 587, true para 465)
  - `Username`, `Password`
  - `Sender name` (ex.: Synthonia AI) e `Sender email` (ex.: no-reply@synthonia.app)
- Autentique o domínio no provedor (SPF, DKIM e DMARC) para alta entregabilidade.
- Após salvar, teste o cadastro e verifique “Email sent” em Authentication → Logs.