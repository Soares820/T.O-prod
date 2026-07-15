'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Preencha e-mail e senha'); return; }
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos'
        : authError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div id="login" className="l-screen">
      {/* LEFT — visual side */}
      <div className="l-visual">
        {/* Blobs */}
        <div className="lb lb1" />
        <div className="lb lb2" />
        <div className="lb lb3" />

        {/* Ripple circles */}
        <div className="l-ripple-bg">
          <div className="l-rpl" />
          <div className="l-rpl" />
          <div className="l-rpl" />
          <div className="l-rpl" />
          <div className="l-rpl" />
          <div className="l-rpl" />
        </div>

        {/* Orbiting icons */}
        <div className="l-orb-wrap">
          <div className="l-orb" style={{'--r':'160px','--d':'14s','--dl':'0s'} as React.CSSProperties}>
            <div className="l-orb-inner">🧠</div>
          </div>
          <div className="l-orb l-orb-rev" style={{'--r':'230px','--d':'20s','--dl':'-5s'} as React.CSSProperties}>
            <div className="l-orb-inner">📋</div>
          </div>
          <div className="l-orb" style={{'--r':'310px','--d':'28s','--dl':'-12s'} as React.CSSProperties}>
            <div className="l-orb-inner">📊</div>
          </div>
        </div>

        {/* Center content */}
        <div className="l-visual-center">
          <div className="l-visual-art">
            <Image src="/logo.svg" alt="T.O Plataforma" width={72} height={72} style={{ filter: 'drop-shadow(0 0 20px rgba(59,130,246,.6))' }} />
          </div>
          <div className="l-visual-nm">T.O Plataforma</div>
          <div className="l-visual-sub">Sistema clínico para TEA &amp; ABA</div>
          <div className="l-visual-divider" />
          <div className="l-visual-feats">
            {[
              { i: '✓', t: 'Gestão de pacientes e famílias' },
              { i: '✓', t: 'Avaliações PEDI, SPM e mais' },
              { i: '✓', t: 'PEI com 120+ atividades ABA' },
              { i: '✓', t: 'BI clínico em tempo real' },
            ].map(f => (
              <div key={f.t} className="l-visual-feat">
                <span style={{ color: '#60A5FA', fontWeight: 700, flexShrink: 0 }}>{f.i}</span>
                {f.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form side */}
      <div className="l-form-side">
        <div className="lbox">
          <div className="lbox-inner">
            {/* Brand */}
            <div className="l-brand">
              <div className="l-mark">
                <Image src="/logo.svg" alt="T.O" width={50} height={50} style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <div className="l-brand-name">T.O Plataforma</div>
                <div className="l-brand-tag">Sistema Clínico</div>
              </div>
            </div>

            <h1 className="l-title">Bem-vindo de volta</h1>
            <p className="l-sub">Entre com suas credenciais para acessar a plataforma</p>

            <form onSubmit={handleLogin} noValidate>
              <div className="l-field">
                <label className="l-lbl">E-mail</label>
                <input
                  type="email"
                  className="l-inp"
                  placeholder="seu@email.com.br"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="l-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <label className="l-lbl" style={{ marginBottom: 0 }}>Senha</label>
                  <Link href="/reset-password" style={{ fontSize: 11, color: '#60A5FA', fontWeight: 700, textDecoration: 'none' }}>
                    Esqueci minha senha
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="l-inp"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showPass
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {error && (
                <div className="l-err">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className="l-btn" disabled={loading}>
                {loading
                  ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Entrando...</>
                  : 'Entrar na plataforma →'
                }
              </button>
            </form>

            <div className="l-ftr">
              Não tem conta?{' '}
              <Link href="/register">Criar conta grátis</Link>
              <br />
              <Link href="/">← Voltar ao início</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
