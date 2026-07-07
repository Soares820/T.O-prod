const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL     || 'https://sceqtztqdmflabdvrzwt.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

const PLANO_MAP = {
  'price_1TqKzx5rqO1GLGXfhQgBRbW9': 'basico',
  'price_1TqKzy5rqO1GLGXf8T2csNSm': 'profissional',
  'price_1TqKzy5rqO1GLGXfazg0wfYa': 'enterprise',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const data = event.data.object;

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const clinicId = data.metadata?.clinic_id;
        const plano    = data.metadata?.plano || 'basico';
        if (clinicId) {
          await supabase.from('clinics').update({
            plano,
            status: 'ativo',
            stripe_customer_id:     data.customer,
            stripe_subscription_id: data.subscription,
          }).eq('id', clinicId);

          // Send payment confirmation email
          const email = data.customer_details?.email || data.customer_email;
          if (email && process.env.RESEND_API_KEY) {
            const appUrl = process.env.APP_URL || 'https://to-plataforma.vercel.app';
            fetch(`${appUrl}/api/email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'payment_confirmed', to: email, plano }),
            }).catch(() => {});
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const clinicId = data.metadata?.clinic_id;
        const priceId  = data.items?.data?.[0]?.price?.id;
        const plano    = PLANO_MAP[priceId] || 'basico';
        const status   = data.status === 'active' ? 'ativo'
                       : data.status === 'past_due' ? 'suspenso'
                       : data.status === 'canceled'  ? 'cancelado'
                       : data.status;
        if (clinicId) {
          await supabase.from('clinics').update({ plano, status }).eq('id', clinicId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const clinicId = data.metadata?.clinic_id;
        if (clinicId) {
          await supabase.from('clinics').update({ status: 'cancelado' }).eq('id', clinicId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const sub      = await stripe.subscriptions.retrieve(data.subscription);
        const clinicId = sub.metadata?.clinic_id;
        if (clinicId) {
          await supabase.from('clinics').update({ status: 'suspenso' }).eq('id', clinicId);
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
  }

  return res.status(200).json({ received: true });
};

// Vercel precisa do body raw para verificar assinatura Stripe
export const config = { api: { bodyParser: false } };
