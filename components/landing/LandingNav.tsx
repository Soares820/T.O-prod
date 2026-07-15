'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingNav() {
  const router = useRouter();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <nav className="lp-nav">
      <button className="lp-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="lp-logo-mark">
          <Image src="/logo.svg" alt="T.O Plataforma" width={40} height={40} style={{ objectFit: 'contain' }} />
        </div>
        <div>
          <div className="lp-logo-name">Software para Terapia ABA</div>
          <div className="lp-logo-tag">Sistema Clínico</div>
        </div>
      </button>

      <div className="lp-navlinks">
        <button className="lp-navlink" onClick={() => scrollTo('lp-features')}>Recursos</button>
        <button className="lp-navlink" onClick={() => scrollTo('lp-pricing')}>Preços</button>
        <button className="lp-navlink" onClick={() => router.push('/blog')}>Blog</button>
        <button className="lp-navlink" onClick={() => router.push('/wiki')}>Wiki</button>
      </div>

      <div className="lp-nav-ctas">
        <button className="lp-nav-login" onClick={() => router.push('/login')}>Entrar</button>
        <button className="lp-nav-cta" onClick={() => router.push('/register')}>Começar grátis</button>
      </div>
    </nav>
  );
}
