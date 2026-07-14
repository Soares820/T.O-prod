-- ============================================================
-- Row Level Security (RLS) — T.O Plataforma
-- Roda no Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

-- ── Habilitar RLS em todas as tabelas ────────────────────────
ALTER TABLE clinics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs      ENABLE ROW LEVEL SECURITY;

-- ── Dropar políticas antigas (idempotente) ────────────────────
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies
           WHERE schemaname = 'public' LOOP
    EXECUTE 'DROP POLICY IF EXISTS '||quote_ident(r.policyname)||' ON '||quote_ident(r.tablename);
  END LOOP;
END $$;

-- ── Helper: clinic_id do usuário autenticado ──────────────────
-- A tabela users associa auth.uid() ao clinic_id da clínica.
-- Usamos uma função para evitar subquery repetida e garantir segurança.
CREATE OR REPLACE FUNCTION auth_clinic_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT clinic_id FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION auth_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- ── clinics ───────────────────────────────────────────────────
-- Cada usuário vê/edita apenas sua própria clínica.
CREATE POLICY "clinics: read own"
  ON clinics FOR SELECT
  USING (id = auth_clinic_id());

CREATE POLICY "clinics: update own"
  ON clinics FOR UPDATE
  USING (id = auth_clinic_id())
  WITH CHECK (id = auth_clinic_id());

-- Somente admins criam clínicas (via service role na API)
-- INSERT bloqueado para usuários normais.

-- ── users ─────────────────────────────────────────────────────
CREATE POLICY "users: read same clinic"
  ON users FOR SELECT
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "users: update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND clinic_id = auth_clinic_id());

-- Só admins podem inserir/remover usuários na clínica
CREATE POLICY "users: admin insert"
  ON users FOR INSERT
  WITH CHECK (clinic_id = auth_clinic_id() AND auth_role() = 'admin');

CREATE POLICY "users: admin delete"
  ON users FOR DELETE
  USING (clinic_id = auth_clinic_id() AND auth_role() = 'admin');

-- ── pacientes ─────────────────────────────────────────────────
CREATE POLICY "pacientes: read same clinic"
  ON pacientes FOR SELECT
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "pacientes: write same clinic"
  ON pacientes FOR INSERT
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "pacientes: update same clinic"
  ON pacientes FOR UPDATE
  USING (clinic_id = auth_clinic_id())
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "pacientes: delete admin only"
  ON pacientes FOR DELETE
  USING (clinic_id = auth_clinic_id() AND auth_role() = 'admin');

-- ── sessoes ───────────────────────────────────────────────────
CREATE POLICY "sessoes: read same clinic"
  ON sessoes FOR SELECT
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "sessoes: write same clinic"
  ON sessoes FOR INSERT
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "sessoes: update same clinic"
  ON sessoes FOR UPDATE
  USING (clinic_id = auth_clinic_id())
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "sessoes: delete same clinic"
  ON sessoes FOR DELETE
  USING (clinic_id = auth_clinic_id());

-- ── avaliacoes ────────────────────────────────────────────────
CREATE POLICY "avaliacoes: read same clinic"
  ON avaliacoes FOR SELECT
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "avaliacoes: write same clinic"
  ON avaliacoes FOR INSERT
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "avaliacoes: update same clinic"
  ON avaliacoes FOR UPDATE
  USING (clinic_id = auth_clinic_id())
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "avaliacoes: delete same clinic"
  ON avaliacoes FOR DELETE
  USING (clinic_id = auth_clinic_id());

-- ── contratos ─────────────────────────────────────────────────
CREATE POLICY "contratos: read same clinic"
  ON contratos FOR SELECT
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "contratos: write same clinic"
  ON contratos FOR INSERT
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "contratos: update same clinic"
  ON contratos FOR UPDATE
  USING (clinic_id = auth_clinic_id())
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "contratos: delete admin only"
  ON contratos FOR DELETE
  USING (clinic_id = auth_clinic_id() AND auth_role() = 'admin');

-- ── pagamentos ────────────────────────────────────────────────
CREATE POLICY "pagamentos: read same clinic"
  ON pagamentos FOR SELECT
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "pagamentos: write same clinic"
  ON pagamentos FOR INSERT
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "pagamentos: update same clinic"
  ON pagamentos FOR UPDATE
  USING (clinic_id = auth_clinic_id())
  WITH CHECK (clinic_id = auth_clinic_id());

-- Pagamentos não podem ser deletados (imutabilidade financeira)
-- DELETE bloqueado para todos.

-- ── funcionarios ──────────────────────────────────────────────
CREATE POLICY "funcionarios: read same clinic"
  ON funcionarios FOR SELECT
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "funcionarios: write same clinic"
  ON funcionarios FOR INSERT
  WITH CHECK (clinic_id = auth_clinic_id() AND auth_role() IN ('admin', 'secretaria'));

CREATE POLICY "funcionarios: update same clinic"
  ON funcionarios FOR UPDATE
  USING (clinic_id = auth_clinic_id())
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "funcionarios: delete admin only"
  ON funcionarios FOR DELETE
  USING (clinic_id = auth_clinic_id() AND auth_role() = 'admin');

-- ── audit_logs ────────────────────────────────────────────────
-- Somente admins leem. Inserções via service role (API backend).
CREATE POLICY "audit_logs: admin read"
  ON audit_logs FOR SELECT
  USING (clinic_id = auth_clinic_id() AND auth_role() = 'admin');

-- Ninguém no frontend pode inserir/deletar audit_logs diretamente.
-- A API usa a service role key que bypassa RLS.

-- ============================================================
-- IMPORTANTE: As APIs do backend (api/*.js) usam SUPABASE_SERVICE_KEY
-- que bypassa RLS por design — isso é correto e seguro desde que
-- as chaves fiquem APENAS no servidor (Vercel env vars).
-- ============================================================
