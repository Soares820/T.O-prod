'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

type Step = 'tipo' | 'dados' | 'senha' | 'confirmar';

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

      if (data.session) {
        router.push('/dashboard');
      } else {
        setStep('confirmar');
      }
    } catch {
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
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>T.O Plataforma</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Sistema Clínico</div>
          </div>
        </div>

        <div className="auth-form-wrap">
          <h1 className="auth-title">Criar conta grátis</h1>
          <p className="auth-sub">14 dias gratuitos · Sem cartão de crédito</p>

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
                    style={{
                      background: tipo === t.key ? 'rgba(37,99,235,.25)' : 'rgba(255,255,255,.05)',
                      border: `2px solid ${tipo === t.key ? '#3B82F6' : 'rgba(255,255,255,.1)'}`,
                      borderRadius: 12,
                      padding: '20px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all .18s',
                      boxShadow: tipo === t.key ? '0 0 0 3px rgba(59,130,246,.15)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: tipo === t.key ? 'rgba(255,255,255,.65)' : 'rgba(255,255,255,.38)', lineHeight: 1.5 }}>{t.desc}</div>
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
                  style={{ marginTop: 3, accentColor: '#3B82F6', width: 16, height: 16 }}
                />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" style={{ color: '#60A5FA', fontWeight: 600 }}>Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" target="_blank" style={{ color: '#60A5FA', fontWeight: 600 }}>Política de Privacidade</Link>
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

          {step === 'confirmar' && (
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg,rgba(59,130,246,.25),rgba(139,92,246,.25))',
                border: '2px solid rgba(59,130,246,.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: 32,
              }}>
                ✉️
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
                Confirme seu e-mail
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, marginBottom: 28 }}>
                Enviamos um link de confirmação para<br />
                <strong style={{ color: '#60A5FA' }}>{form.email}</strong>
                <br /><br />
                Verifique sua caixa de entrada (e a pasta spam)
                e clique no link para ativar sua conta.
              </p>
              <Link href="/login" className="af-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Ir para o login
              </Link>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 16 }}>
                Não recebeu?{' '}
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.resend({ type: 'signup', email: form.email });
                    alert('E-mail reenviado!');
                  }}
                  style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: 12, padding: 0 }}
                >
                  Reenviar e-mail
                </button>
              </p>
            </div>
          )}

          {step !== 'confirmar' && (
            <p className="auth-switch">
              Já tem conta? <Link href="/login">Entrar</Link>
            </p>
          )}
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
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)',
              borderRadius: 20, padding: '6px 14px', marginBottom: 24,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>Trial gratuito · Sem cartão</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 20 }}>
              Tudo que sua clínica<br />precisa em um só lugar
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
            {[
              { icon: '📋', title: 'Prontuários digitais', desc: 'PEDI, SPM e avaliações completas' },
              { icon: '📅', title: 'Agenda inteligente', desc: 'Sessões, confirmações automáticas' },
              { icon: '👨‍👩‍👦', title: 'Portal da família', desc: 'Evolução em tempo real para os pais' },
              { icon: '📊', title: 'BI e relatórios', desc: 'Insights clínicos e financeiros' },
            ].map((f) => (
              <div key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-stats">
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
