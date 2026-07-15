'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function ContaScreen() {
  const { state, logout } = useApp();
  const { user } = state;

  const [tab, setTab] = useState<'perfil' | 'plano' | 'seguranca'>('perfil');
  const [form, setForm] = useState({ name: user?.name ?? '', clinicName: user?.clinicName ?? '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      await supabase.from('users').update({ nome: form.name }).eq('auth_id', uid);
      if (user?.role === 'admin' && form.clinicName) {
        await supabase.from('clinics').update({ nome: form.clinicName }).eq('id', user.clinicId);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const PLAN_FEATURES: Record<string, { name: string; price: string; features: string[] }> = {
    trial: { name: 'Trial', price: 'Grátis por 14 dias', features: ['Todos os recursos do Pro', 'Suporte por e-mail', 'Sem cartão de crédito'] },
    basico: { name: 'Básico', price: 'R$ 149/mês', features: ['Até 10 pacientes', 'Agenda e sessões', 'Financeiro básico', 'Portal da família'] },
    pro: { name: 'Pro', price: 'R$ 299/mês', features: ['Pacientes ilimitados', 'BI avançado', 'Reavix AI', 'PEI completo', 'Equipe ilimitada', 'Suporte prioritário'] },
    enterprise: { name: 'Enterprise', price: 'Sob consulta', features: ['Multi-unidades', 'API de integração', 'SLA dedicado', 'Treinamento exclusivo'] },
  };

  const plan = PLAN_FEATURES[user?.plan ?? 'trial'];

  return (
    <div className="view show" id="v-conta">
      <div className="page-body">
        <div className="page-hero">
          <div className="ph-pre"><span></span>Configurações</div>
          <h1 className="ph-title">Minha conta</h1>
          <div className="ph-sub">Gerencie seu perfil, plano e segurança</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid var(--bdr)', paddingBottom: 0 }}>
          {(['perfil', 'plano', 'seguranca'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--p)' : 'transparent'}`, background: 'none', color: tab === t ? 'var(--p)' : 'var(--t2)', fontWeight: tab === t ? 700 : 500, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1, textTransform: 'capitalize' }}>
              {t === 'seguranca' ? 'Segurança' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'perfil' && (
          <div style={{ maxWidth: 500 }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{ width: 68, height: 68, borderRadius: 20, background: 'linear-gradient(135deg,var(--p),var(--v))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 26 }}>
                {user?.name?.charAt(0) ?? 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)' }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--t3)' }}>{user?.email}</div>
                <div style={{ fontSize: 12, color: 'var(--p)', fontWeight: 700, marginTop: 4, textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Nome completo</label>
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>E-mail</label>
                <input value={user?.email ?? ''} disabled style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf2)', color: 'var(--t3)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>O e-mail não pode ser alterado</div>
              </div>
              {user?.role === 'admin' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Nome da clínica</label>
                  <input value={form.clinicName} onChange={(e) => setForm(f => ({ ...f, clinicName: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              )}
              <button type="submit" disabled={saving} className="btn-p" style={{ marginTop: 4 }}>
                {saved ? '✓ Salvo!' : saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          </div>
        )}

        {tab === 'plano' && (
          <div style={{ maxWidth: 520 }}>
            {/* Current plan */}
            <div style={{ background: 'var(--ps)', border: '2px solid var(--p)', borderRadius: 'var(--r)', padding: '20px 22px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--p)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Plano atual</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--t1)' }}>{plan?.name}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--p)' }}>{plan?.price}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan?.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t2)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--p)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {user?.plan !== 'pro' && (
              <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 22px' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)', marginBottom: 6 }}>Fazer upgrade para Clínica</div>
                <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 16 }}>Pacientes ilimitados, Reavix AI, BI avançado e muito mais.</div>
                <button
                  onClick={() => window.open('https://wa.me/5511999999999?text=Quero+fazer+upgrade+do+plano', '_blank')}
                  className="btn-p"
                >
                  Falar com vendas →
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'seguranca' && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 22px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)', marginBottom: 6 }}>Alterar senha</div>
              <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 16 }}>Enviaremos um link de redefinição para o seu e-mail.</div>
              <button
                onClick={async () => {
                  const { supabase } = await import('@/lib/supabase');
                  await supabase.auth.resetPasswordForEmail(user?.email ?? '');
                  alert('E-mail de redefinição enviado!');
                }}
                style={{ padding: '10px 20px', border: '1px solid var(--p)', borderRadius: 10, background: 'none', color: 'var(--p)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Enviar link de redefinição
              </button>
            </div>

            <div style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 'var(--r)', padding: '20px 22px' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#ef4444', marginBottom: 6 }}>Sair da conta</div>
              <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 16 }}>Você será desconectado de todos os dispositivos.</div>
              <button
                onClick={logout}
                style={{ padding: '10px 20px', border: '1px solid #ef4444', borderRadius: 10, background: 'none', color: '#ef4444', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Sair da plataforma
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
