'use client';

import { useRouter } from 'next/navigation';

const CHECK = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CROSS = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PLANS = [
  {
    name: 'Starter', nameColor: 'rgba(255,255,255,.4)',
    desc: 'Para clínicas que estão começando',
    cta: 'Criar conta grátis', ctaStyle: 'lp-cta-out',
    features: [
      { ok: true, text: 'Até 5 pacientes' },
      { ok: true, text: 'Avaliações PEDI/PS/SPM' },
      { ok: true, text: 'Registro de atividades' },
      { ok: true, text: 'Central de crises' },
      { ok: true, text: 'Dashboard familiar incluso' },
      { ok: false, text: 'PEI e folha de registro' },
      { ok: false, text: 'BI avançado' },
      { ok: false, text: 'Reavix AI' },
    ],
  },
  {
    name: 'Clínica', nameColor: '#60A5FA', badge: 'MAIS POPULAR',
    desc: 'Para clínicas em crescimento',
    cta: 'Começar grátis', ctaStyle: 'lp-cta-p',
    highlight: true,
    features: [
      { ok: true, text: 'Pacientes ilimitados' },
      { ok: true, text: 'Avaliações PEDI/PS/SPM' },
      { ok: true, text: 'PEI com 120+ atividades ABA' },
      { ok: true, text: 'Folha de registro DTT' },
      { ok: true, text: 'Agenda e financeiro completo' },
      { ok: true, text: 'BI clínico avançado' },
      { ok: true, text: 'Portal da família' },
      { ok: false, text: 'Reavix AI (add-on)' },
    ],
  },
  {
    name: 'Enterprise', nameColor: '#A78BFA',
    desc: 'Para redes e grupos clínicos',
    cta: 'Falar com consultor', ctaStyle: 'lp-cta-out',
    features: [
      { ok: true, text: 'Tudo do plano Clínica' },
      { ok: true, text: 'Multi-unidades / franquias' },
      { ok: true, text: 'Reavix AI incluso' },
      { ok: true, text: 'Onboarding dedicado' },
      { ok: true, text: 'SLA garantido' },
      { ok: true, text: 'Integrações via API' },
      { ok: true, text: 'Relatórios personalizados' },
      { ok: true, text: 'Suporte prioritário 24/7' },
    ],
  },
];

export default function LandingPricing() {
  const router = useRouter();

  function handleCta(plan: typeof PLANS[0]) {
    if (plan.name === 'Enterprise') {
      window.open('https://wa.me/5511999999999?text=Olá!%20Quero%20conhecer%20o%20plano%20Enterprise%20da%20T.O%20Plataforma', '_blank');
    } else {
      router.push('/register');
    }
  }

  return (
    <section className="lp-sec" id="lp-pricing">
      <div className="lp-sec-in">
        <div className="lp-sec-chip">Planos</div>
        <h2 className="lp-sec-h">Escolha o plano ideal<br />para sua clínica</h2>
        <p className="lp-sec-sub">
          Converse com um de nossos consultores e descubra qual plano atende melhor sua clínica.
        </p>

        <div className="lp-price-grid">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`lp-plan${plan.highlight ? ' pop' : ''}`}>
              {plan.badge && (
                <div className="lp-plan-badge">{plan.badge}</div>
              )}
              <div className="lp-plan-name" style={{ color: plan.nameColor }}>{plan.name}</div>
              <div className="lp-plan-desc">{plan.desc}</div>
              <button
                className={`lp-plan-cta ${plan.ctaStyle === 'lp-cta-p' ? 'lp-cta-prim' : plan.ctaStyle}`}
                onClick={() => handleCta(plan)}
              >
                {plan.cta}
              </button>
              <div className="lp-plan-div" />
              <div className="lp-fl">
                {plan.features.map((f) => (
                  <div key={f.text} className={`lp-fi${f.ok ? '' : ' off'}`}>
                    <span className={`lp-fck ${f.ok ? 'y' : 'n'}`}>
                      {f.ok ? CHECK : CROSS}
                    </span>
                    {f.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
