-- ============================================================
-- Cria tabelas faltando: metas e avaliacoes
-- Execute no Supabase: Dashboard → SQL Editor → New Query
-- ============================================================

-- ── METAS (PEI — Plano de Ensino Individualizado) ────────────
CREATE TABLE IF NOT EXISTS public.metas (
  id          BIGSERIAL PRIMARY KEY,
  clinic_id   UUID    NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  child_id    BIGINT  REFERENCES public.pacientes(id) ON DELETE CASCADE,
  descricao   TEXT    NOT NULL,
  area        TEXT,
  status      TEXT    NOT NULL DEFAULT 'ativo',
  criterio    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metas_clinic ON public.metas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_metas_child  ON public.metas(child_id);

ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "iso_metas" ON public.metas;
CREATE POLICY "iso_metas" ON public.metas
  FOR ALL USING (clinic_id = public.minha_clinica());

-- ── AVALIAÇÕES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id          BIGSERIAL PRIMARY KEY,
  clinic_id   UUID    NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  child_id    BIGINT  NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  type        TEXT    NOT NULL,
  date        DATE    NOT NULL,
  scores      JSONB   NOT NULL DEFAULT '{}',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_clinic ON public.avaliacoes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_child  ON public.avaliacoes(child_id);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "iso_avaliacoes" ON public.avaliacoes;
CREATE POLICY "iso_avaliacoes" ON public.avaliacoes
  FOR ALL USING (clinic_id = public.minha_clinica());
