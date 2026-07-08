const { withRateLimit, verifyJWT } = require('./_middleware');

const _handler = async (req, res) => {
  const origin = process.env.APP_URL || 'https://to-plataforma.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyJWT(req);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      content: 'A chave de API não está configurada no servidor. Configure ANTHROPIC_API_KEY nas variáveis de ambiente da Vercel.'
    });
  }

  const { messages = [], system = '', question = '' } = req.body || {};
  const allMessages = messages.length > 0 ? messages : [{ role: 'user', content: question }];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: system || 'Você é a Reavix AI, assistente clínica especializada em Terapia Ocupacional para TEA. Responda sempre em português do Brasil de forma profissional e empática.',
        messages: allMessages.slice(-10)
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(200).json({ content: 'Não consegui processar sua pergunta agora. Tente novamente em instantes.' });
    }
    return res.status(200).json({ content: data.content?.[0]?.text || 'Sem resposta.' });
  } catch (err) {
    console.error('Reavix error:', err);
    return res.status(200).json({ content: 'Ocorreu um erro ao contatar a IA. Verifique sua conexão e tente novamente.' });
  }
};

module.exports = withRateLimit(_handler, { max: 30, windowMs: 60000 });
