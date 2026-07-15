'use client';

import { useRouter } from 'next/navigation';

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
              Começar grátis → sem cartão
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button className="lp-btn-s" onClick={() => document.getElementById('lp-pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Ver planos e preços
            </button>
          </div>

          <div className="lp-hero-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Sem cartão de crédito · 14 dias grátis · Cancele quando quiser
          </div>
        </div>

        {/* Right — dashboard visual */}
        <div className="lp-visual" style={{ animation: 'fadeUp .85s cubic-bezier(.22,1,.36,1) .15s both' }}>
          <div className="lp-dash">
            <div className="lp-dash-bar">
              <div className="lp-win-dot" style={{ background: '#FF5F57' }} />
              <div className="lp-win-dot" style={{ background: '#FFBD2E' }} />
              <div className="lp-win-dot" style={{ background: '#28CA41' }} />
              <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 99, marginLeft: 8 }} />
            </div>

            <div className="lp-kpis">
              {[
                { val: '73%',  lbl: 'Progresso',    color: '#60A5FA', grad: 'linear-gradient(90deg,#2563EB,#60A5FA)' },
                { val: '+18%', lbl: 'Comunicação',  color: '#34D399', grad: 'linear-gradient(90deg,#059669,#34D399)' },
                { val: '+9%',  lbl: 'Autonomia',    color: '#A78BFA', grad: 'linear-gradient(90deg,#7C3AED,#A78BFA)' },
                { val: '84%',  lbl: 'Rotina',       color: '#FBBF24', grad: 'linear-gradient(90deg,#D97706,#FBBF24)' },
              ].map((kpi) => (
                <div key={kpi.lbl} className="lp-kc">
                  <div className="lp-kc-bar" style={{ background: kpi.grad }} />
                  <div className="lp-kc-val" style={{ color: kpi.color }}>{kpi.val}</div>
                  <div className="lp-kc-lbl">{kpi.lbl}</div>
                </div>
              ))}
            </div>

            <div className="lp-chart-area">
              <div className="lp-chart-title">Evolução · 6 meses</div>
              <div className="lp-bars">
                {[
                  { h: 36, bg: 'linear-gradient(180deg,#2563EB,#1D4ED8)', op: .55 },
                  { h: 42, bg: 'linear-gradient(180deg,#2563EB,#1D4ED8)', op: .62 },
                  { h: 46, bg: 'linear-gradient(180deg,#2563EB,#1D4ED8)', op: .70 },
                  { h: 48, bg: 'linear-gradient(180deg,#2563EB,#1D4ED8)', op: .78 },
                  { h: 52, bg: 'linear-gradient(180deg,#2563EB,#1D4ED8)', op: .86 },
                  { h: 58, bg: 'linear-gradient(135deg,#2563EB,#7C3AED)',  op: 1,  shadow: '0 -4px 14px rgba(37,99,235,.5)' },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="lp-bar-c"
                    style={{ height: b.h, background: b.bg, opacity: b.op, boxShadow: b.shadow }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lp-float lp-float1">
            <div className="lp-float-row">
              <div className="lp-float-av" style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}>L</div>
              <div>
                <div className="lp-float-t">Nova avaliação PEDI</div>
                <div className="lp-float-s">Lucas · há 2 min</div>
              </div>
            </div>
          </div>

          <div className="lp-float lp-float2">
            <div className="lp-float-row">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', flexShrink: 0 }} />
              <div className="lp-float-t">Evolução acima da meta <span style={{ color: '#34D399' }}>↑ 11%</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
