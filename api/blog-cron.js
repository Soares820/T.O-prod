// api/blog-cron.js — chamado pelo GitHub Actions 1x por dia
// Busca artigos no PubMed → resume com Claude → salva no Supabase

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sceqtztqdmflabdvrzwt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const CRON_SECRET = process.env.BLOG_CRON_SECRET;

// Queries PubMed — rotacionadas para variedade de conteúdo
const QUERIES = [
  'applied+behavior+analysis+autism+children+intervention',
  'terapia+ocupacional+TEA+crianca+brasil',
  'ABA+autism+spectrum+disorder+early+intervention',
  'sensory+integration+autism+occupational+therapy',
  'PECS+AAC+autism+communication+therapy',
  'parent+training+autism+ABA+home',
  'social+skills+autism+intervention+children',
];

async function sbInsert(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(rows),
  });
  return res;
}

async function sbSelect(table, filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}&select=id`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function fetchPubMed() {
  // Escolhe query aleatória para variedade
  const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
  const today = new Date();
  const day = String(today.getDate()).padStart(2,'0');
  const month = String(today.getMonth()+1).padStart(2,'0');
  const year = today.getFullYear();

  // Busca IDs dos últimos 60 dias
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=8&sort=date&retmode=json&datetype=pdat&reldate=60`;
  const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'TO-Plataforma/1.0 (cleberflip@gmail.com)' } });
  const searchData = await searchRes.json();
  const ids = searchData.esearchresult?.idlist || [];
  if (!ids.length) return [];

  // Busca resumos
  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.slice(0,5).join(',')}&retmode=json`;
  const summaryRes = await fetch(summaryUrl, { headers: { 'User-Agent': 'TO-Plataforma/1.0 (cleberflip@gmail.com)' } });
  const summaryData = await summaryRes.json();

  const articles = [];
  const result = summaryData.result || {};
  for (const id of result.uids || []) {
    const art = result[id];
    if (!art || !art.title) continue;
    articles.push({
      pmid: id,
      title: art.title,
      authors: (art.authors || []).slice(0,3).map(a => a.name).join(', '),
      journal: art.source || '',
      pubdate: art.pubdate || '',
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
    });
  }
  return articles;
}

async function generatePost(article) {
  const prompt = `Você é especialista em Terapia Ocupacional e ABA/TEA no contexto clínico brasileiro.

Com base neste artigo científico recente, crie um post de blog educativo em português do Brasil para terapeutas ocupacionais e famílias de crianças com TEA:

TÍTULO DO ARTIGO: ${article.title}
AUTORES: ${article.authors}
PERIÓDICO: ${article.journal} (${article.pubdate})
LINK: ${article.url}

Instruções:
- Escreva de forma acessível mas profissional
- Contextualize a relevância para a prática clínica no Brasil
- Inclua dica prática aplicável ao consultório ou em casa
- NÃO use markdown (sem **, *, #) — apenas texto corrido com parágrafos
- Máximo 550 palavras no conteúdo principal

Retorne SOMENTE um JSON válido neste formato exato (sem texto antes ou depois):
{
  "titulo": "Título atraente em PT-BR (máx 90 caracteres)",
  "resumo": "2 frases de resumo para preview do card (máx 180 caracteres)",
  "conteudo": "Post completo em PT-BR com 4-5 parágrafos. Sem markdown.",
  "categoria": "uma de: Pesquisa, ABA, Terapia Ocupacional, TEA, Família, Desenvolvimento",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Claude não retornou JSON válido');
  return JSON.parse(match[0]);
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  // Segurança: requer header secreto
  const secret = req.headers['x-cron-secret'];
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' });
  if (!SUPABASE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' });

  try {
    const articles = await fetchPubMed();
    const results = { saved: 0, skipped: 0, errors: [], total: articles.length };

    for (const article of articles.slice(0, 3)) {
      // Verifica se já existe
      const existing = await sbSelect('blog_posts', `fonte_url=eq.${encodeURIComponent(article.url)}`);
      if (existing && existing.length > 0) {
        results.skipped++;
        continue;
      }

      try {
        const post = await generatePost(article);

        // Aguarda 800ms para não estourar rate limit do Claude
        await new Promise(r => setTimeout(r, 800));

        const insertRes = await sbInsert('blog_posts', [{
          titulo: post.titulo,
          resumo: post.resumo,
          conteudo: post.conteudo,
          fonte: `PubMed — ${article.journal}`,
          fonte_url: article.url,
          categoria: post.categoria || 'Pesquisa',
          tags: post.tags || [],
          publicado_em: new Date().toISOString(),
        }]);

        if (insertRes.ok) {
          results.saved++;
        } else {
          const errText = await insertRes.text();
          results.errors.push(`Insert failed: ${errText}`);
        }
      } catch (e) {
        results.errors.push(`Artigo ${article.pmid}: ${e.message}`);
      }
    }

    return res.status(200).json({ ok: true, ...results });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
