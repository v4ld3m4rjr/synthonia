# Configuração de Provedor de E-mail (SMTP) para Supabase

Este guia ajuda a configurar um provedor de e-mail confiável para envio de mensagens de confirmação (signup) no Supabase.

Objetivo: alta taxa de entrega, suporte a templates personalizados (no Supabase) e segurança adequada.

## Campos no Supabase (Custom SMTP)
- SMTP Host: endereço do servidor SMTP do provedor
- SMTP Port: `587` (STARTTLS) ou `465` (TLS)
- Secure: `false` para 587 (STARTTLS); `true` para 465 (TLS)
- Username: usuário SMTP (varia por provedor)
- Password: senha/credencial SMTP
- Sender name: nome exibido (ex.: `Synthonia AI`)
- Sender email: remetente (ex.: `no-reply@synthonia.app`) — use domínio autenticado

## Provedores recomendados

### SendGrid
- Entregabilidade: alta, boa reputação e fácil autenticação de domínio
- SMTP:
  - Host: `smtp.sendgrid.net`
  - Port: `587` (STARTTLS) ou `465` (TLS)
  - Secure: `false` para 587; `true` para 465
  - Username: `apikey`
  - Password: `SEU_API_KEY` (criado em SendGrid → Settings → API Keys)
  - Sender email: `no-reply@synthonia.app` (domínio autenticado)
- Autenticação de domínio:
  - SendGrid → Settings → Sender Authentication → Domain Authentication
  - Adicione os registros DNS (CNAME) fornecidos e aguarde verificação
- Observações:
  - Use `apikey` como usuário e o valor real do API Key como senha
  - Templates de e-mail são gerenciados no Supabase (Authentication → Templates)

### Mailgun
- Entregabilidade: alta, especialmente com domínios raiz e subdomínios dedicados
- SMTP:
  - Host: `smtp.mailgun.org`
  - Port: `587` (STARTTLS) ou `465` (TLS)
  - Secure: `false` para 587; `true` para 465
  - Username: `postmaster@SEU-DOMINIO.mailgun.org`
  - Password: gerada no painel Mailgun
  - Sender email: `no-reply@synthonia.app` (domínio autenticado)
- Autenticação de domínio:
  - Mailgun → Domains → Add New Domain → siga os passos
  - Adicione registros DNS (TXT para SPF/DKIM) e verifique

### Amazon SES
- Entregabilidade: muito alta com configuração adequada (DKIM, Mail From)
- SMTP:
  - Host: `email-smtp.<regiao>.amazonaws.com` (ex.: `email-smtp.us-east-1.amazonaws.com`)
  - Port: `587` (STARTTLS) ou `465` (TLS)
  - Secure: `false` para 587; `true` para 465
  - Username/Password: credenciais SMTP geradas no SES (não use Access Keys AWS diretamente)
  - Sender email: `no-reply@synthonia.app` (domínio verificado)
- Autenticação de domínio:
  - SES → Verified Identities → Domain → verifique o domínio com registros DKIM
  - Configure “Mail From Domain” para melhorar SPF

## DNS do domínio (entregabilidade)
Para `synthonia.app`, configure:
- SPF (TXT): valor dependendo do provedor
  - SendGrid: `v=spf1 include:_spf.sendgrid.net ~all`
  - Mailgun: `v=spf1 include:mailgun.org ~all`
  - SES: via Mail From (CNAME) e SPF apropriado
- DKIM: chaves fornecidas pelo provedor (TXT ou CNAME)
- DMARC (TXT em `_dmarc.synthonia.app`): `v=DMARC1; p=none; rua=mailto:seu-email@dominio.com`
  - Depois, ajuste para `quarantine`/`reject` quando estiver estável

## URL de redirecionamento (Supabase)
- Authentication → URL Configuration:
  - Site URL: `https://synthonia.app/`
  - Additional Redirect URLs: `https://synthonia.app/`
- O app usa `emailRedirectTo = window.location.origin + '/'` e fará a confirmação retornando ao site.

## Templates de e-mail
- Configure em Supabase → Authentication → Templates → Confirm signup
- Use os arquivos:
  - HTML: `supabase/email_templates/confirm-signup.html`
  - Texto: `supabase/email_templates/confirm-signup.txt`

## Teste e logs
- Cadastre um usuário e verifique em Supabase → Authentication → Logs
- Sucesso: “Email sent”
- Problemas comuns:
  - `Mailer error`: credenciais/host/porta/TLS incorretos
  - `redirect_to not allowed`: inclua `https://synthonia.app/` na allowlist
  - `rate-limited`: aguarde e reduza volume
- Reenvio: pelo app (“Reenviar e‑mail de confirmação”) ou painel de usuários do Supabase