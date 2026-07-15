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
    <div id="login" className="auth-screen">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="lp-logo-mark" style={{ width: 44, height: 44, borderRadius: 12 }}>
            <Image src="/logo.svg" alt="T.O Plataforma" width={44} height={44} style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-.2px' }}>T.O Plataforma</div>
            <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Sistema Clínico</div>
          </div>
        </div>

        <div className="auth-form-wrap">
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-sub">Entre com suas credenciais para acessar a plataforma</p>

          <form onSubmit={handleLogin} className="auth-form" noValidate>
            <div className="af-group">
              <label className="af-label">E-mail</label>
              <input
                type="email"
                className="af-input"
                placeholder="seu@email.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="af-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="af-label" style={{ marginBottom: 0 }}>Senha</label>
                <Link href="/reset-password" style={{ fontSize: 12, color: 'var(--p)', fontWeight: 600 }}>
                  Esqueci minha senha
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="af-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}
                >
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div className="af-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="af-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spin-anim" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                  Entrando...
                </>
              ) : 'Entrar na plataforma'}
            </button>
          </form>

          <p className="auth-switch">
            Não tem conta?{' '}
            <Link href="/register">Criar conta grátis</Link>
          </p>
        </div>

        <div className="auth-footer">
          <Link href="/">← Voltar ao início</Link>
          <span>·</span>
          <Link href="/privacidade">Privacidade</Link>
          <span>·</span>
          <Link href="/wiki">Manual</Link>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-visual">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
          <div className="auth-grid-lines" />
          <div className="auth-float-card auth-float-card-1">
            <div className="auth-fc-icon">📋</div>
            <div className="auth-fc-val">247</div>
            <div className="auth-fc-lbl">sessões este mês</div>
            <div className="auth-fc-badge">↑ 12% vs anterior</div>
          </div>
          <div className="auth-float-card auth-float-card-2">
            <div className="auth-fc-icon">👨‍👩‍👦</div>
            <div className="auth-fc-val">98%</div>
            <div className="auth-fc-lbl">satisfação das famílias</div>
            <div className="auth-fc-badge">✓ Verificado</div>
          </div>
        </div>
        <div className="auth-right-content">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(59,130,246,.12)', border: '1px solid rgba(59,130,246,.25)',
            borderRadius: 20, padding: '6px 14px', marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 8px #22C55E' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', fontWeight: 600, letterSpacing: '.04em' }}>+1.200 clínicas ativas hoje</span>
          </div>
          <div className="auth-quote">
            &quot;A T.O Plataforma transformou como gerenciamos nossa clínica. O BI em tempo real e o Portal da Família são simplesmente incríveis.&quot;
          </div>
          <div className="auth-quote-author">
            <div className="auth-qa-av" style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>DT</div>
            <div>
              <div className="auth-qa-name">Dra. Tatiane Silva</div>
              <div className="auth-qa-role">Terapeuta Ocupacional · São Paulo</div>
            </div>
          </div>
          <div className="auth-stats">
            {[['24', 'pacientes gerenciados'], ['93%', 'presença média'], ['4.9★', 'avaliação da família']].map(([n, l]) => (
              <div key={l} className="auth-stat">
                <div className="auth-stat-n">{n}</div>
                <div className="auth-stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
