const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  basico:        'price_1TqKzx5rqO1GLGXfhQgBRbW9',
  profissional:  'price_1TqKzy5rqO1GLGXf8T2csNSm',
  enterprise:    'price_1TqKzy5rqO1GLGXfazg0wfYa',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plano, clinic_id, email } = req.body || {};

  if (!plano || !PRICES[plano]) {
    return res.status(400).json({ error: 'Plano inválido. Use: basico, profissional ou enterprise' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      automatic_payment_methods: { enabled: true },
      line_items: [{ price: PRICES[plano], quantity: 1 }],
      success_url: `${process.env.APP_URL || 'https://to-plataforma-oh0pxny3a-soares820s-projects.vercel.app'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.APP_URL || 'https://to-plataforma-oh0pxny3a-soares820s-projects.vercel.app'}/?payment=cancelled`,
      customer_email: email || undefined,
      metadata: { clinic_id: clinic_id || '', plano },
      subscription_data: {
        metadata: { clinic_id: clinic_id || '', plano },
        trial_period_days: 14,
      },
      locale: 'pt-BR',
    });

    return res.status(200).json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
