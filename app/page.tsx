import type { Metadata } from 'next';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingPricing from '@/components/landing/LandingPricing';
import LandingFooter from '@/components/landing/LandingFooter';
import './landing.css';

export const metadata: Metadata = {
  title: 'T.O Plataforma — Software para Terapia ABA',
};

const STATS = [
  { n: '1.200+', l: 'Pacientes acompanhados' },
  { n: '98%', l: 'Satisfação das famílias' },
  { n: '4.8★', l: 'Avaliação média' },
  { n: '24/7', l: 'Suporte disponível' },
];

export default function HomePage() {
  return (
    <div id="landing" style={{ background: '#040b18', minHeight: '100vh', color: '#fff' }}>
      {/* Blobs decorativos */}
      <div className="lp-blob lp-b1" />
      <div className="lp-blob lp-b2" />
      <div className="lp-blob lp-b3" />

      {/* Navegação */}
      <LandingNav />

      {/* Conteúdo */}
      <div className="lp-content">
        {/* Hero */}
        <LandingHero />

        {/* Stats */}
        <div className="lp-stats-wrap">
          <div className="lp-stats">
            {STATS.map((s) => (
              <div key={s.l}>
                <div className="lp-stat-n">{s.n}</div>
                <div className="lp-stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <LandingFeatures />

        {/* Pricing */}
        <LandingPricing />
      </div>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
