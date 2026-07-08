const { createClient } = require('@supabase/supabase-js');
const { withRateLimit, verifyJWT } = require('./_middleware');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://sceqtztqdmflabdvrzwt.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

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

  const { clinic_id, email, nome, cargo, role, invited_by } = req.body || {};

  if (!clinic_id || !email || !nome) {
    return res.status(400).json({ error: 'clinic_id, email e nome são obrigatórios' });
  }

  try {
    // Check if user already exists in this clinic
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('clinic_id', clinic_id)
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Este email já está cadastrado nesta clínica.' });
    }

    // Create invite token
    const token    = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // Store invite in users table as pending
    await supabase.from('users').insert({
      clinic_id,
      email,
      nome,
      cargo:  cargo  || 'Terapeuta',
      role:   role   || 'terapeuta',
      status: 'pendente',
      invite_token:      token,
      invite_expires_at: expiresAt,
    });

    // Send invite email via Resend
    const appUrl  = process.env.APP_URL || 'https://to-plataforma.vercel.app';
    const inviteUrl = `${appUrl}/?invite=${token}`;

    if (process.env.RESEND_API_KEY) {
      const html = `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0D1526;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#2563EB,#7C3AED);padding:32px 28px;text-align:center">
            <div style="font-size:24px;font-weight:900">T.O Plataforma</div>
            <div style="font-size:13px;opacity:.8;margin-top:4px">Você foi convidado!</div>
          </div>
          <div style="padding:32px 28px">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 12px">Olá, ${nome.split(' ')[0]}!</h2>
            <p style="color:rgba(255,255,255,.75);line-height:1.6;margin:0 0 20px">
              <strong>${invited_by || 'Sua clínica'}</strong> convidou você para acessar a T.O Plataforma como <strong>${cargo || 'Terapeuta'}</strong>.
            </p>
            <p style="color:rgba(255,255,255,.6);font-size:13px;margin-bottom:24px">
              Este link expira em 7 dias. Clique abaixo para criar sua senha e acessar o sistema.
            </p>
            <a href="${inviteUrl}" style="display:block;background:linear-gradient(135deg,#2563EB,#7C3AED);color:#fff;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none">
              Aceitar convite e criar senha →
            </a>
            <p style="font-size:11px;color:rgba(255,255,255,.3);margin-top:16px;text-align:center">
              Se não esperava este email, ignore-o com segurança.
            </p>
          </div>
        </div>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    'T.O Plataforma <noreply@vero.app>',
          to:      [email],
          subject: `Você foi convidado para a T.O Plataforma`,
          html,
        }),
      });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      clinic_id,
      action:   'CONVIDAR_FUNCIONARIO',
      tabela:   'users',
      detalhes: `Convite enviado para ${email} (${cargo})`,
    });

    return res.status(200).json({ ok: true, message: `Convite enviado para ${email}` });
  } catch (err) {
    console.error('Invite error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = withRateLimit(_handler, { max: 10, windowMs: 60000 });
