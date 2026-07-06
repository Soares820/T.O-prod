-- ══════════════════════════════════════════════════════════════
-- Software para Terapia ABA — Schema Multi-tenant v1.0
-- Execute no Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ══════════════════════════════════════════════════════════════

-- ── 1. CLÍNICAS (raiz do multi-tenancy) ──────────────────────
CREATE TABLE IF NOT EXISTS public.clinics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  cnpj        TEXT,
  email       TEXT,
  telefone    TEXT,
  plano       TEXT NOT NULL DEFAULT 'trial',   -- trial | basico | pro | enterprise
  status      TEXT NOT NULL DEFAULT 'trial',   -- trial | ativo | suspenso | cancelado
  trial_ends  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. USUÁRIOS (vinculados ao auth.users do Supabase) ───────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id   UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'terapeuta',
  -- roles: admin | terapeuta | recepcao | financeiro | familia
  cargo       TEXT,
  telefone    TEXT,
  status      TEXT NOT NULL DEFAULT 'ativo',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. PACIENTES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pacientes (
  id          BIGSERIAL PRIMARY KEY,
  clinic_id   UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  dob         DATE,
  sex         CHAR(1),
  responsible TEXT,
  diagnosis   TEXT,
  therapist   TEXT,
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'ativo',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. AVALIAÇÕES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id          BIGSERIAL PRIMARY KEY,
  clinic_id   UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  child_id    BIGINT NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,   -- PEDI | PS | SPM | ABLLS | VBMAPP
  date        DATE NOT NULL,
  scores      JSONB NOT NULL DEFAULT '{}',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. CONTRATOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contratos (
  id                BIGSERIAL PRIMARY KEY,
  clinic_id         UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  child_id          BIGINT NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  tipo              TEXT DEFAULT 'particular',   -- particular | convenio
  convenio          TEXT,
  valor_sessao      NUMERIC(10,2),
  sessoes_semanais  INT DEFAULT 1,
  duracao_min       INT DEFAULT 50,
  dia_vencimento    INT DEFAULT 10,
  status            TEXT NOT NULL DEFAULT 'ativo',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. PAGAMENTOS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id              BIGSERIAL PRIMARY KEY,
  clinic_id       UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  child_id        BIGINT NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  mes             TEXT NOT NULL,   -- formato: YYYY-MM
  valor_previsto  NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_recebido  NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pendente',   -- pendente | recebido | parcial | inadimplente
  data_pag        DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. FUNCIONÁRIOS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id          BIGSERIAL PRIMARY KEY,
  clinic_id   UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  auth_id     UUID REFERENCES auth.users(id),
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  cargo       TEXT,
  nivel       TEXT NOT NULL DEFAULT 'terapeuta',   -- admin | terapeuta | recepcao | financeiro
  status      TEXT NOT NULL DEFAULT 'ativo',
  telefone    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. SESSÕES (agenda) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessoes (
  id              BIGSERIAL PRIMARY KEY,
  clinic_id       UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  child_id        BIGINT REFERENCES public.pacientes(id) ON DELETE SET NULL,
  funcionario_id  BIGINT REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  data            DATE NOT NULL,
  hora            TEXT NOT NULL,   -- HH:MM
  tipo            TEXT NOT NULL DEFAULT 'TO',
  status          TEXT NOT NULL DEFAULT 'agendado',   -- agendado | realizado | cancelado | falta
  duracao_min     INT DEFAULT 50,
  notas           TEXT,
  paciente_nome   TEXT,   -- desnormalizado para facilitar leitura
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. AUDIT LOG (imutável por RLS) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  clinic_id   UUID REFERENCES public.clinics(id),
  user_id     UUID REFERENCES public.users(id),
  action      TEXT NOT NULL,        -- INSERT | UPDATE | DELETE | LOGIN | LOGOUT
  table_name  TEXT,
  record_id   TEXT,
  details     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- ÍNDICES para performance
-- ══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_users_auth_id       ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_clinic        ON public.users(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_clinic    ON public.pacientes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_clinic   ON public.avaliacoes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_child    ON public.avaliacoes(child_id);
CREATE INDEX IF NOT EXISTS idx_contratos_clinic    ON public.contratos(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_clinic   ON public.pagamentos(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mes      ON public.pagamentos(mes);
CREATE INDEX IF NOT EXISTS idx_funcionarios_clinic ON public.funcionarios(clinic_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_clinic      ON public.sessoes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_data        ON public.sessoes(data);
CREATE INDEX IF NOT EXISTS idx_audit_clinic        ON public.audit_logs(clinic_id);

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — isolamento total por clínica
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.clinics       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs    ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: retorna clinic_id do usuário autenticado
CREATE OR REPLACE FUNCTION public.minha_clinica()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT clinic_id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- Políticas RLS
CREATE POLICY "iso_clinics"      ON public.clinics      FOR ALL USING (id = public.minha_clinica());
CREATE POLICY "iso_users"        ON public.users        FOR ALL USING (clinic_id = public.minha_clinica());
CREATE POLICY "iso_pacientes"    ON public.pacientes    FOR ALL USING (clinic_id = public.minha_clinica());
CREATE POLICY "iso_avaliacoes"   ON public.avaliacoes   FOR ALL USING (clinic_id = public.minha_clinica());
CREATE POLICY "iso_contratos"    ON public.contratos    FOR ALL USING (clinic_id = public.minha_clinica());
CREATE POLICY "iso_pagamentos"   ON public.pagamentos   FOR ALL USING (clinic_id = public.minha_clinica());
CREATE POLICY "iso_funcionarios" ON public.funcionarios FOR ALL USING (clinic_id = public.minha_clinica());
CREATE POLICY "iso_sessoes"      ON public.sessoes      FOR ALL USING (clinic_id = public.minha_clinica());
CREATE POLICY "iso_audit"        ON public.audit_logs   FOR ALL USING (clinic_id = public.minha_clinica());

-- Audit log: apenas INSERT (ninguém apaga logs)
CREATE POLICY "audit_insert_only" ON public.audit_logs FOR INSERT WITH CHECK (clinic_id = public.minha_clinica());

-- ══════════════════════════════════════════════════════════════
-- SEED — crie uma clínica demo + usuário admin para testar
-- (Execute APÓS criar o usuário no Supabase Auth)
-- Substitua o email e o UUID do auth_id pelo seu
-- ══════════════════════════════════════════════════════════════

/*
-- 1. Criar clínica
INSERT INTO public.clinics (nome, email, plano, status)
VALUES ('Clínica Demo ABA', 'demo@clinica.com', 'pro', 'ativo')
RETURNING id;  -- copie este UUID para o próximo passo

-- 2. Criar usuário admin (coloque o clinic_id retornado acima)
INSERT INTO public.users (auth_id, clinic_id, nome, email, role, cargo, status)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'seu@email.com'),
  'COLE-O-CLINIC-ID-AQUI',
  'Admin',
  'seu@email.com',
  'admin',
  'Administrador',
  'ativo'
);
*/
