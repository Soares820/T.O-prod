# Software para Terapia ABA
### SaaS para Clínicas e Consultórios TEA

Sistema completo de gestão clínica para terapeutas ABA, desenvolvido como SaaS multi-tenant com foco em segurança, LGPD e experiência do usuário.

---

## Funcionalidades

- **Gestão de Pacientes** — cadastro, prontuário, histórico de evolução
- **Avaliações Clínicas** — PEDI, SPM, ABLLS, VBMAPP com gráficos de progresso
- **Agenda** — calendário de sessões com status (agendado, realizado, falta, cancelado)
- **Atividades ABA** — biblioteca de atividades DTT com registro de execução e tentativas
- **Financeiro** — contratos, cobranças mensais, controle de inadimplência
- **Gestão de Equipe** — cadastro de terapeutas, fonoaudiólogos, recepção com controle de acesso por nível
- **Reavix AI** — assistente inteligente integrado com IA para suporte clínico
- **Dashboard** — KPIs em tempo real: receita, sessões, evolução dos pacientes
- **PWA** — funciona como app instalável no celular e desktop

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | HTML + CSS + JavaScript (SPA vanilla) |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage) |
| Deploy | Vercel (serverless) |
| IA | Claude Haiku via API Anthropic |
| Autenticação | Supabase Auth (JWT) |
| Segurança | Row Level Security (RLS) multi-tenant |

---

## Arquitetura Multi-tenant

Cada clínica é completamente isolada via **Row Level Security** no Supabase. Nenhum dado de uma clínica é acessível por outra — isolamento garantido em nível de banco de dados.

```
clinics (raiz)
  └── users       (equipe da clínica)
  └── pacientes   (pacientes)
  └── avaliacoes  (PEDI, SPM, ABLLS, VBMAPP)
  └── contratos   (contratos por paciente)
  └── pagamentos  (controle financeiro mensal)
  └── funcionarios (equipe com níveis de acesso)
  └── sessoes     (agenda)
  └── audit_logs  (rastreabilidade LGPD)
```

---

## Setup

### 1. Clone o repositório

```bash
git clone https://github.com/Soares820/T.O-prod.git
cd T.O-prod
```

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, rode o arquivo `supabase/schema.sql`
3. Em **Authentication → Settings**, desative confirmação de e-mail para desenvolvimento

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz (ou configure no Vercel):

```env
ANTHROPIC_API_KEY=sua_chave_aqui
```

As chaves do Supabase já estão no `index.html` — para produção, mova para variáveis de ambiente.

### 4. Deploy

```bash
# Instale o Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

---

## Estrutura do Projeto

```
T.O-prod/
├── index.html          # SPA principal (~5000 linhas)
├── sw.js               # Service Worker (PWA, cache v4)
├── manifest.json       # PWA manifest
├── Vero_logo.jpeg      # Logo da plataforma
├── api/
│   └── reavix.js       # Serverless function — Reavix AI
├── icons/              # Ícones PWA (72px → 512px)
├── supabase/
│   └── schema.sql      # Schema completo do banco de dados
└── .gitignore
```

---

## Planos e Preços

| Plano | Preço | Usuários | Pacientes |
|---|---|---|---|
| Trial | Grátis 14 dias | 3 | 20 |
| Básico | R$ 197/mês | 3 | 20 |
| Profissional | R$ 397/mês | 10 | 100 |
| Enterprise | R$ 797/mês | Ilimitado | Ilimitado |

---

## Roadmap (até Out/2026)

- [x] Sistema base com dados mockados
- [x] PWA instalável
- [x] Supabase Auth (login real)
- [x] Schema multi-tenant com RLS
- [x] Tela de cadastro de clínicas
- [ ] Dados reais em produção (Jul/2026)
- [ ] Stripe billing + planos (Ago/2026)
- [ ] Emails transacionais (Ago/2026)
- [ ] Compliance LGPD completo (Set/2026)
- [ ] Pentest e auditoria de segurança (Set/2026)
- [ ] Lançamento público v1.0 (Out/2026)

---

## Segurança

- Autenticação JWT via Supabase Auth
- Row Level Security em todas as tabelas
- HTTPS forçado (Vercel)
- Dados de saúde protegidos pela **LGPD**
- Audit log imutável de todas as ações

---

## Licença

Proprietário — todos os direitos reservados.  
© 2026 Software para Terapia ABA