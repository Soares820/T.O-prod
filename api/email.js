const { withRateLimit } = require('./_middleware');
const _handler = async (req, res) => {
  const origin = process.env.APP_URL || 'https://to-plataforma.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Allow internal server-to-server calls with API_INTERNAL_SECRET header
  const internalSecret = process.env.API_INTERNAL_SECRET;
  if (internalSecret && req.headers['x-api-key'] !== internalSecret) {
    // Not an internal call — still allow (protected by CORS + rate limit)
    // but reject obviously invalid email formats
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { to: toAddr } = req.body || {};
    if (toAddr && !emailRx.test(toAddr)) {
      return res.status(400).json({ error: 'Endereço de email inválido' });
    }
  }

  const { type, to, name, clinicName, plano } = req.body || {};
  const RESEND_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  if (!to || !type) return res.status(400).json({ error: 'Missing to or type' });

  const templates = {
    welcome: {
      subject: `Bem-vindo(a) à T.O Plataforma, ${name ? name.split(' ')[0] : ''}! 🎉`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0D1526;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#2563EB,#7C3AED);padding:32px 28px;text-align:center">
            <div style="font-size:28px;font-weight:900;letter-spacing:-1px">T.O Plataforma</div>
            <div style="font-size:13px;opacity:.8;margin-top:4px">Software para Terapia ABA</div>
          </div>
          <div style="padding:32px 28px">
            <h2 style="font-size:22px;font-weight:800;margin:0 0 12px">Olá, ${name ? name.split(' ')[0] : 'terapeuta'}! 👋</h2>
            <p style="color:rgba(255,255,255,.75);line-height:1.6;margin:0 0 20px">Sua conta em <strong>${clinicName || 'sua clínica'}</strong> foi criada com sucesso. Você tem <strong>14 dias grátis</strong> para explorar tudo que o sistema oferece.</p>
            <div style="background:rgba(255,255,255,.06);border-radius:12px;padding:16px;margin-bottom:24px">
              <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:10px">O que você pode fazer agora</div>
              <div style="font-size:14px;color:rgba(255,255,255,.85);line-height:2">
                ✅ Cadastrar pacientes e famílias<br>
                ✅ Agendar sessões e atendimentos<br>
                ✅ Registrar evoluções e avaliações<br>
                ✅ Controle financeiro e contratos<br>
                ✅ Relatórios e BI clínico
              </div>
            </div>
            <a href="${process.env.APP_URL || 'https://to-plataforma.vercel.app'}" style="display:block;background:linear-gradient(135deg,#2563EB,#7C3AED);color:#fff;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none">Acessar o sistema →</a>
          </div>
          <div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,.08);font-size:12px;color:rgba(255,255,255,.4);text-align:center">
            T.O Plataforma · Suporte: suporte@vero.app · <a href="${process.env.APP_URL || 'https://to-plataforma.vercel.app'}/#privacidade" style="color:rgba(255,255,255,.4)">Política de Privacidade</a>
          </div>
        </div>
      `,
    },
    trial_ending: {
      subject: `Seu trial acaba em 3 dias — garanta seu plano, ${name ? name.split(' ')[0] : ''}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0D1526;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px 28px;text-align:center">
            <div style="font-size:28px;font-weight:900">⏰ 3 dias restantes</div>
            <div style="font-size:13px;opacity:.8;margin-top:4px">Seu trial gratuito está acabando</div>
          </div>
          <div style="padding:32px 28px">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 12px">Não perca o acesso ao sistema</h2>
            <p style="color:rgba(255,255,255,.75);line-height:1.6;margin:0 0 24px">Seu trial de 14 dias termina em breve. Para continuar acessando todos os recursos e dados de seus pacientes, escolha um plano.</p>
            <a href="${process.env.APP_URL || 'https://to-plataforma.vercel.app'}/#upgrade" style="display:block;background:linear-gradient(135deg,#2563EB,#7C3AED);color:#fff;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none">Ver planos e preços →</a>
          </div>
        </div>
      `,
    },
    payment_confirmed: {
      subject: `Pagamento confirmado! Bem-vindo ao plano ${plano || 'escolhido'} 🎊`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0D1526;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#10b981,#2563EB);padding:32px 28px;text-align:center">
            <div style="font-size:48px">✅</div>
            <div style="font-size:22px;font-weight:900;margin-top:8px">Pagamento confirmado!</div>
          </div>
          <div style="padding:32px 28px">
            <p style="color:rgba(255,255,255,.75);line-height:1.6;margin:0 0 20px">Obrigado por assinar o plano <strong>${plano || ''}</strong>. Sua assinatura está ativa e você tem acesso completo à plataforma.</p>
            <a href="${process.env.APP_URL || 'https://to-plataforma.vercel.app'}" style="display:block;background:linear-gradient(135deg,#10b981,#2563EB);color:#fff;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none">Acessar o sistema →</a>
          </div>
        </div>
      `,
    },
  };

  const tpl = templates[type];
  if (!tpl) return res.status(400).json({ error: `Unknown email type: ${type}` });

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'T.O Plataforma <noreply@vero.app>',
        to: [to],
        subject: tpl.subject,
        html: tpl.html,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Resend error');
    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
module.exports = withRateLimit(_handler, { max: 5, windowMs: 60000 });
