-- ============================================================
-- RLS extra: restrições por role (admin/terapeuta)
-- Roda APÓS o schema.sql já ter sido executado
-- ============================================================
-- O schema.sql já habilita RLS e cria as políticas básicas de
-- isolamento por clínica (minha_clinica()). Este arquivo adiciona
-- restrições mais granulares baseadas no role do usuário.
-- ============================================================

-- Função auxiliar: retorna o role do usuário autenticado
CREATE OR REPLACE FUNCTION public.meu_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- ── pacientes: só admin pode deletar ─────────────────────────
-- Substitui a política genérica iso_pacientes por versões split
DROP POLICY IF EXISTS "iso_pacientes" ON public.pacientes;

CREATE POLICY "pac_select"
  ON public.pacientes FOR SELECT
  USING (clinic_id = public.minha_clinica());

CREATE POLICY "pac_insert"
  ON public.pacientes FOR INSERT
  WITH CHECK (clinic_id = public.minha_clinica());

CREATE POLICY "pac_update"
  ON public.pacientes FOR UPDATE
  USING (clinic_id = public.minha_clinica())
  WITH CHECK (clinic_id = public.minha_clinica());

CREATE POLICY "pac_delete"
  ON public.pacientes FOR DELETE
  USING (clinic_id = public.minha_clinica() AND public.meu_role() = 'admin');

-- ── contratos: só admin pode deletar ─────────────────────────
DROP POLICY IF EXISTS "iso_contratos" ON public.contratos;

CREATE POLICY "cont_select"
  ON public.contratos FOR SELECT
  USING (clinic_id = public.minha_clinica());

CREATE POLICY "cont_insert"
  ON public.contratos FOR INSERT
  WITH CHECK (clinic_id = public.minha_clinica());

CREATE POLICY "cont_update"
  ON public.contratos FOR UPDATE
  USING (clinic_id = public.minha_clinica())
  WITH CHECK (clinic_id = public.minha_clinica());

CREATE POLICY "cont_delete"
  ON public.contratos FOR DELETE
  USING (clinic_id = public.minha_clinica() AND public.meu_role() = 'admin');

-- ── pagamentos: ninguém deleta (imutabilidade financeira) ─────
DROP POLICY IF EXISTS "iso_pagamentos" ON public.pagamentos;

CREATE POLICY "pag_select"
  ON public.pagamentos FOR SELECT
  USING (clinic_id = public.minha_clinica());

CREATE POLICY "pag_insert"
  ON public.pagamentos FOR INSERT
  WITH CHECK (clinic_id = public.minha_clinica());

CREATE POLICY "pag_update"
  ON public.pagamentos FOR UPDATE
  USING (clinic_id = public.minha_clinica())
  WITH CHECK (clinic_id = public.minha_clinica());

-- DELETE bloqueado: nenhuma política de DELETE = bloqueado por padrão.

-- ── funcionarios: só admin deleta ────────────────────────────
DROP POLICY IF EXISTS "iso_funcionarios" ON public.funcionarios;

CREATE POLICY "func_select"
  ON public.funcionarios FOR SELECT
  USING (clinic_id = public.minha_clinica());

CREATE POLICY "func_insert"
  ON public.funcionarios FOR INSERT
  WITH CHECK (clinic_id = public.minha_clinica()
              AND public.meu_role() IN ('admin', 'recepcao'));

CREATE POLICY "func_update"
  ON public.funcionarios FOR UPDATE
  USING (clinic_id = public.minha_clinica())
  WITH CHECK (clinic_id = public.minha_clinica());

CREATE POLICY "func_delete"
  ON public.funcionarios FOR DELETE
  USING (clinic_id = public.minha_clinica() AND public.meu_role() = 'admin');

-- ── users: só admin insere/deleta outros usuários ────────────
DROP POLICY IF EXISTS "iso_users" ON public.users;

CREATE POLICY "usr_select"
  ON public.users FOR SELECT
  USING (clinic_id = public.minha_clinica());

CREATE POLICY "usr_update_own"
  ON public.users FOR UPDATE
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid() AND clinic_id = public.minha_clinica());

CREATE POLICY "usr_insert_admin"
  ON public.users FOR INSERT
  WITH CHECK (clinic_id = public.minha_clinica() AND public.meu_role() = 'admin');

CREATE POLICY "usr_delete_admin"
  ON public.users FOR DELETE
  USING (clinic_id = public.minha_clinica() AND public.meu_role() = 'admin');

-- ============================================================
-- IMPORTANTE: As APIs do backend (api/*.js) usam SUPABASE_SERVICE_KEY
-- que bypassa RLS por design — isso é correto e seguro desde que
-- as chaves fiquem APENAS no servidor (Vercel env vars).
-- ============================================================
