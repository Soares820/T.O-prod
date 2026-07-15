'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

type Step = 'tipo' | 'dados' | 'senha';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('tipo');
  const [tipo, setTipo] = useState<'clinica' | 'familiar'>('clinica');
  const [form, setForm] = useState({ name: '', clinicName: '', email: '', phone: '', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) { setError('Você deve aceitar os Termos de Uso para continuar'); return; }
    if (form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return; }
    if (form.password !== form.confirm) { setError('As senhas não coincidem'); return; }
    if (!form.name || !form.email) { setError('Preencha todos os campos obrigatórios'); return; }

    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            clinic_name: tipo === 'clinica' ? (form.clinicName || form.name) : null,
            role: tipo === 'clinica' ? 'admin' : 'familiar',
            phone: form.phone,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message === 'User already registered'
          ? 'Este e-mail já está cadastrado. Faça login.'
          : signUpError.message);
        return;
      }

      router.push('/dashboard');
    } catch (e) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="register" className="auth-screen">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="lp-logo-mark" style={{ width: 44, height: 44, borderRadius: 12 }}>
            <Image src="/logo.svg" alt="T.O Plataforma" width={44} height={44} style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>T.O Plataforma</div>
            <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Sistema Clínico</div>
          </div>
        </div>

        <div className="auth-form-wrap">
          <h1 className="auth-title">Criar conta grátis</h1>
          <p className="auth-sub">14 dias gratuitos · Sem cartão de crédito</p>

          {/* Tipo de conta */}
          {step === 'tipo' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '28px 0' }}>
                {[
                  { key: 'clinica', icon: '🏥', label: 'Clínica / Terapeuta', desc: 'Gerencie pacientes, sessões e relatórios' },
                  { key: 'familiar', icon: '👨‍👩‍👦', label: 'Familiar', desc: 'Acompanhe o progresso do seu filho' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTipo(t.key as typeof tipo)}
                    className={`reg-type-card${tipo === t.key ? ' active' : ''}`}
                    style={{
                      background: tipo === t.key ? 'var(--ps)' : 'var(--sf2)',
                      border: `2px solid ${tipo === t.key ? 'var(--p)' : 'var(--bdr)'}`,
                      borderRadius: 12, padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
              <button className="af-btn" onClick={() => setStep('dados')}>
                Continuar
              </button>
            </div>
          )}

          {step === 'dados' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('senha'); }} className="auth-form" style={{ marginTop: 24 }}>
              <div className="af-group">
                <label className="af-label">Seu nome completo *</label>
                <input className="af-input" type="text" placeholder="Ex: Ana Beatriz Santos" value={form.name} onChange={(e) => update('name', e.target.value)} required autoFocus />
              </div>
              {tipo === 'clinica' && (
                <div className="af-group">
                  <label className="af-label">Nome da clínica</label>
                  <input className="af-input" type="text" placeholder="Ex: Clínica TEA Esperança" value={form.clinicName} onChange={(e) => update('clinicName', e.target.value)} />
                </div>
              )}
              <div className="af-group">
                <label className="af-label">E-mail *</label>
                <input className="af-input" type="email" placeholder="seu@email.com.br" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              </div>
              <div className="af-group">
                <label className="af-label">WhatsApp</label>
                <input className="af-input" type="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="af-btn-out" onClick={() => setStep('tipo')}>Voltar</button>
                <button type="submit" className="af-btn" style={{ flex: 1 }}>Continuar</button>
              </div>
            </form>
          )}

          {step === 'senha' && (
            <form onSubmit={handleRegister} className="auth-form" style={{ marginTop: 24 }}>
              <div className="af-group">
                <label className="af-label">Senha *</label>
                <input className="af-input" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => update('password', e.target.value)} required autoFocus />
              </div>
              <div className="af-group">
                <label className="af-label">Confirmar senha *</label>
                <input className="af-input" type="password" placeholder="Repita a senha" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} required />
              </div>

              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', margin: '4px 0 16px' }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--p)', width: 16, height: 16 }}
                />
                <span style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}>
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" style={{ color: 'var(--p)', fontWeight: 600 }}>Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" target="_blank" style={{ color: 'var(--p)', fontWeight: 600 }}>Política de Privacidade</Link>
                </span>
              </label>

              {error && (
                <div className="af-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="af-btn-out" onClick={() => setStep('dados')}>Voltar</button>
                <button type="submit" className="af-btn" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Criando conta...' : 'Criar conta grátis'}
                </button>
              </div>
            </form>
          )}

          <p className="auth-switch">
            Já tem conta? <Link href="/login">Entrar</Link>
          </p>
        </div>

        <div className="auth-footer">
          <Link href="/">← Início</Link>
          <span>·</span>
          <Link href="/termos">Termos</Link>
          <span>·</span>
          <Link href="/privacidade">Privacidade</Link>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-right-content">
          <div style={{ fontSize: 28, marginBottom: 20 }}>🚀</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            Comece hoje, sem compromisso
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              '✓ 14 dias gratuitos, sem cartão de crédito',
              '✓ Configuração em menos de 5 minutos',
              '✓ Todos os recursos do plano Clínica disponíveis',
              '✓ Suporte dedicado durante o período trial',
              '✓ Cancele quando quiser, sem multa',
            ].map((item) => (
              <div key={item} style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', display: 'flex', alignItems: 'center', gap: 10 }}>
                {item}
              </div>
            ))}
          </div>
          <div className="auth-stats" style={{ marginTop: 36 }}>
            {[['1.200+', 'clínicas ativas'], ['98%', 'satisfação'], ['5★', 'avaliação']].map(([n, l]) => (
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
