'use client';

import { useRouter } from 'next/navigation';

const BAR_HEIGHTS = [35, 52, 42, 68, 55, 72];
const BAR_COLORS = ['#2563EB88', '#2563EBbb', '#2563EB99', '#2563EB', '#2563EBcc', '#2563EB'];

export default function LandingHero() {
  const router = useRouter();

  return (
    <section className="lp-hero">
      <div className="lp-hero-inner">
        {/* Left — text */}
        <div style={{ animation: 'fadeUp .7s cubic-bezier(.22,1,.36,1) both' }}>
          <div className="lp-hero-badge">
            <span className="lp-badge-dot" />
            <span className="lp-badge-txt">Plataforma certificada TEA · v2.1 · Novo BI</span>
          </div>

          <h1 className="lp-hero-h1">
            O acompanhamento<br />que sua família<br />
            <span className="lp-h1-grad">merece e precisa</span>
          </h1>

          <p className="lp-hero-sub">
            A plataforma de gestão clínica completa para terapeutas que atendem TEA.
            Avaliações PEDI, folha de registro DTT, PEI inteligente, BI em tempo real
            e comunicação com famílias — tudo em um só lugar.
          </p>

          <div className="lp-hero-btns">
            <button className="lp-btn-p" onClick={() => router.push('/register')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Começar gratuitamente
            </button>
            <button className="lp-btn-s" onClick={() => document.getElementById('lp-features')?.scrollIntoView({ behavior: 'smooth' })}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Ver funcionalidades
            </button>
          </div>

          <div className="lp-hero-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Sem cartão de crédito · 14 dias grátis · Cancele quando quiser
          </div>
        </div>

        {/* Right — dashboard visual */}
        <div className="lp-visual" style={{ animation: 'fadeUp .9s .15s cubic-bezier(.22,1,.36,1) both' }}>
          <div className="lp-float lp-float1">
            <div className="lp-float-row">
              <div className="lp-float-av" style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>AI</div>
              <div>
                <div className="lp-float-t">Reavix analisou o progresso</div>
                <div className="lp-float-s">Meta PEDI atingida · Área motora</div>
              </div>
            </div>
          </div>

          <div className="lp-dash">
            <div className="lp-dash-bar">
              <div className="lp-win-dot" style={{ background: '#FF5F57' }} />
              <div className="lp-win-dot" style={{ background: '#FFBD2E' }} />
              <div className="lp-win-dot" style={{ background: '#28C840' }} />
              <div style={{ marginLeft: '8px', fontSize: '11px', color: 'rgba(255,255,255,.2)', fontWeight: 600 }}>
                T.O Plataforma · Dashboard
              </div>
            </div>

            <div className="lp-kpis">
              {[
                { val: '24', lbl: 'Pacientes ativos', color: '#2563EB', grad: 'linear-gradient(90deg,#2563EB,#7C3AED)' },
                { val: '93%', lbl: 'Taxa de presença', color: '#059669', grad: 'linear-gradient(90deg,#059669,#0EA5E9)' },
                { val: '18', lbl: 'Sessões esta semana', color: '#7C3AED', grad: 'linear-gradient(90deg,#7C3AED,#EC4899)' },
                { val: 'A+', lbl: 'Progresso médio PEDI', color: '#D97706', grad: 'linear-gradient(90deg,#D97706,#EF4444)' },
              ].map((kpi) => (
                <div key={kpi.lbl} className="lp-kc">
                  <div className="lp-kc-bar" style={{ background: kpi.grad }} />
                  <div className="lp-kc-val" style={{ color: kpi.color }}>{kpi.val}</div>
                  <div className="lp-kc-lbl">{kpi.lbl}</div>
                </div>
              ))}
            </div>

            <div className="lp-chart-area">
              <div className="lp-chart-title">Evolução mensal · Sessões realizadas</div>
              <div className="lp-bars">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="lp-bar-c"
                    style={{ height: `${h}%`, background: BAR_COLORS[i], opacity: i === BAR_HEIGHTS.length - 1 ? 1 : 0.6 }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lp-float lp-float2">
            <div className="lp-float-row">
              <div className="lp-float-av" style={{ background: 'linear-gradient(135deg,#059669,#0EA5E9)' }}>✓</div>
              <div>
                <div className="lp-float-t">Meta atingida</div>
                <div className="lp-float-s">Contato visual intencional · Lucas M.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
