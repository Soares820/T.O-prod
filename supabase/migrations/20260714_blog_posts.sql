-- Blog posts: leitura pública, escrita apenas pelo service role (cron)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id          BIGSERIAL PRIMARY KEY,
  titulo      TEXT NOT NULL,
  resumo      TEXT NOT NULL,
  conteudo    TEXT,
  fonte       TEXT,
  fonte_url   TEXT UNIQUE,
  categoria   TEXT DEFAULT 'Pesquisa',
  tags        TEXT[] DEFAULT '{}',
  publicado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_publicado ON public.blog_posts(publicado_em DESC);
CREATE INDEX IF NOT EXISTS idx_blog_categoria ON public.blog_posts(categoria);

-- RLS: leitura pública (sem autenticação necessária)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_public_read"
  ON public.blog_posts FOR SELECT
  USING (true);

-- Inserção apenas pelo service role (via api/blog-cron.js no servidor)
-- O service role bypassa RLS por padrão — não precisa de policy de INSERT
