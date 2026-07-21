'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, MONTH_NAMES, getLastNMonths } from '@/lib/utils';
import type { Pagamento, Contrato } from '@/lib/types';

type TabType = 'pagamentos' | 'contratos' | 'relatorios';

// ─── Financial BI (inline) ───────────────────────────────
function BiFinanceiro() {
  const { state } = useApp();
  const { data } = state;
  const months = useMemo(() => getLastNMonths(6), []);

  const revenueByMonth = useMemo(() => months.map((m) => ({
    label: MONTH_NAMES[parseInt(m.slice(5, 7)) - 1].slice(0, 3),
    recebido: data.payments.filter((p) => p.mes === m && (p.status === 'recebido' || p.status === 'parcial')).reduce((s, p) => s + (p.valor_recebido ?? 0), 0),
    previsto: data.payments.filter((p) => p.mes === m).reduce((s, p) => s + (p.valor_previsto ?? 0), 0),
  })), [months, data.payments]);

  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.previsto), 1);
  const totalRecebido = revenueByMonth.reduce((s, m) => s + m.recebido, 0);
  const totalPrevisto = revenueByMonth.reduce((s, m) => s + m.previsto, 0);
  const totalPendente = data.payments.filter((p) => p.status === 'pendente').reduce((s, p) => s + (p.valor_previsto ?? 0), 0);
  const inadimplentes = data.payments.filter((p) => p.status === 'inadimplente').length;
  const taxaRecebimento = totalPrevisto > 0 ? Math.round((totalRecebido / totalPrevisto) * 100) : 0;

  const revenueByChild = useMemo(() => {
    const map: Record<number, { name: string; recebido: number }> = {};
    data.payments.forEach((p) => {
      const child = data.children.find((c) => c.id === p.child_id);
      if (!map[p.child_id]) map[p.child_id] = { name: child?.name ?? `Paciente ${p.child_id}`, recebido: 0 };
      if (p.status === 'recebido' || p.status === 'parcial') map[p.child_id].recebido += p.valor_recebido ?? 0;
    });
    return Object.values(map).sort((a, b) => b.recebido - a.recebido).slice(0, 8);
  }, [data.payments, data.children]);

  const maxChildRevenue = Math.max(...revenueByChild.map((c) => c.recebido), 1);

  const statusCounts = useMemo(() => {
    const counts = { recebido: 0, pendente: 0, inadimplente: 0, parcial: 0 };
    data.payments.forEach((p) => { if (p.status in counts) counts[p.status as keyof typeof counts]++; });
    return counts;
  }, [data.payments]);

  const totalPags = Object.values(statusCounts).reduce((s, v) => s + v, 0) || 1;

  function KpiCard({ value, label, color, sub }: { value: string | number; label: string; color: string; sub?: string }) {
    return (
      <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '18px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color, opacity: .6, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginTop: 6 }}>{label}</div>
      </div>
    );
  }

  function SCard({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
    return (
      <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 18px', ...style }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--t1)', marginBottom: 18, letterSpacing: '-.2px' }}>{title}</div>
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard value={formatCurrency(totalRecebido)} label="Recebido (6 meses)" color="#10b981" />
        <KpiCard value={formatCurrency(totalPrevisto)} label="Previsto (6 meses)" color="var(--p)" />
        <KpiCard value={formatCurrency(totalPendente)} label="Em aberto" color="#f59e0b" />
        <KpiCard value={`${taxaRecebimento}%`} label="Taxa de recebimento" color={taxaRecebimento >= 80 ? '#10b981' : '#f59e0b'} />
        <KpiCard value={inadimplentes} label="Inadimplentes" color="#ef4444" />
        <KpiCard value={data.children.filter((c) => c.status === 'ativo').length} label="Pacientes ativos" color="var(--v)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <SCard title="Receita mensal (6 meses)">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130 }}>
            {revenueByMonth.map((m) => (
              <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>{m.recebido > 0 ? `R$${Math.round(m.recebido / 1000)}k` : ''}</div>
                <div style={{ width: '100%', position: 'relative', borderRadius: '4px 4px 0 0', height: `${Math.max((m.previsto / maxRevenue) * 100, 4)}%` }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--sf2)', borderRadius: '4px 4px 0 0' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(m.previsto > 0 ? m.recebido / m.previsto : 0) * 100}%`, background: '#10b981', borderRadius: '4px 4px 0 0' }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            {[['var(--sf2)', 'Previsto'], ['#10b981', 'Recebido']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--t3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
              </div>
            ))}
          </div>
        </SCard>

        <SCard title="Status de cobranças">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'recebido', label: 'Recebido', color: '#10b981' },
              { key: 'pendente', label: 'Pendente', color: '#f59e0b' },
              { key: 'parcial', label: 'Parcial', color: '#8b5cf6' },
              { key: 'inadimplente', label: 'Inadimplente', color: '#ef4444' },
            ].map(({ key, label, color }) => {
              const count = statusCounts[key as keyof typeof statusCounts];
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 90, fontSize: 12, fontWeight: 600, color: 'var(--t2)', flexShrink: 0 }}>{label}</div>
                  <div style={{ flex: 1, height: 10, background: 'var(--sf2)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / totalPags) * 100}%`, background: color, borderRadius: 5 }} />
                  </div>
                  <div style={{ width: 28, fontSize: 12, fontWeight: 700, color: 'var(--t1)', textAlign: 'right', flexShrink: 0 }}>{count}</div>
                  <div style={{ width: 34, fontSize: 11, color: 'var(--t3)', textAlign: 'right', flexShrink: 0 }}>{Math.round((count / totalPags) * 100)}%</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--bdr)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Ticket médio</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--p)' }}>
              {data.payments.length > 0 ? formatCurrency(totalPrevisto / data.payments.length) : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>por cobrança cadastrada</div>
          </div>
        </SCard>
      </div>

      {revenueByChild.length > 0 && (
        <SCard title="Receita por paciente (acumulado)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {revenueByChild.map((c) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 130, fontSize: 12, fontWeight: 600, color: 'var(--t2)', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ flex: 1, height: 10, background: 'var(--sf2)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max((c.recebido / maxChildRevenue) * 100, c.recebido > 0 ? 2 : 0)}%`, background: 'var(--p)', borderRadius: 5, transition: 'width .4s ease' }} />
                </div>
                <div style={{ width: 72, fontSize: 12, fontWeight: 700, color: 'var(--t1)', textAlign: 'right', flexShrink: 0 }}>{formatCurrency(c.recebido)}</div>
              </div>
            ))}
          </div>
        </SCard>
      )}
    </div>
  );
}

export default function FinanceiroScreen() {
  const { state, dispatch } = useApp();
  const { data } = state;

  const [tab, setTab] = useState<TabType>('pagamentos');
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));

  // Payment state
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPay, setSelectedPay] = useState<Pagamento | null>(null);
  const [payForm, setPayForm] = useState({ child_id: '', mes: new Date().toISOString().slice(0, 7), valor_previsto: '', valor_recebido: '0', status: 'pendente' });
  const [savingPay, setSavingPay] = useState(false);

  // Contract state
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({ child_id: '', tipo: 'particular', convenio: '', valor_sessao: '', sessoes_semanais: '5', duracao_min: '50', dia_vencimento: '5', status: 'ativo' });
  const [savingContract, setSavingContract] = useState(false);

  const monthPayments = useMemo(() => data.payments.filter((p) => !monthFilter || p.mes === monthFilter), [data.payments, monthFilter]);

  const stats = useMemo(() => {
    const recebido = monthPayments.filter((p) => p.status === 'recebido' || p.status === 'parcial').reduce((s, p) => s + (p.valor_recebido ?? 0), 0);
    const previsto = monthPayments.reduce((s, p) => s + (p.valor_previsto ?? 0), 0);
    const pendente = monthPayments.filter((p) => p.status === 'pendente').reduce((s, p) => s + (p.valor_previsto ?? 0), 0);
    return { recebido, previsto, pendente, count: monthPayments.length };
  }, [monthPayments]);

  const childName = (id: number) => data.children.find((c) => c.id === id)?.name ?? '—';

  const monthOptions = useMemo(() => {
    const opts = [];
    const now = new Date();
    for (let i = -12; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const val = d.toISOString().slice(0, 7);
      const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      opts.push({ val, label });
    }
    return opts;
  }, []);

  function openNewPay() {
    setSelectedPay(null);
    setPayForm({ child_id: '', mes: monthFilter, valor_previsto: '', valor_recebido: '0', status: 'pendente' });
    setShowPayModal(true);
  }

  function openEditPay(p: Pagamento) {
    setSelectedPay(p);
    setPayForm({ child_id: String(p.child_id), mes: p.mes, valor_previsto: String(p.valor_previsto ?? ''), valor_recebido: String(p.valor_recebido ?? 0), status: p.status });
    setShowPayModal(true);
  }

  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSavePay(e: React.FormEvent) {
    e.preventDefault();
    if (!payForm.child_id) return;
    setSavingPay(true);
    setSaveError(null);
    try {
      const { supabase } = await import('@/lib/supabase');
      const payload = {
        clinic_id: state.user?.clinicId,
        child_id: Number(payForm.child_id),
        mes: payForm.mes,
        valor_previsto: Number(payForm.valor_previsto),
        valor_recebido: Number(payForm.valor_recebido),
        status: payForm.status,
        data_pag: payForm.status === 'recebido' ? new Date().toISOString().slice(0, 10) : null,
      };
      if (selectedPay) {
        const { data: upd, error } = await supabase.from('pagamentos').update(payload).eq('id', selectedPay.id).select().single();
        if (error) { console.error('pagamentos UPDATE:', error); setSaveError([error.message, error.details].filter(Boolean).join(' | ')); return; }
        if (upd) dispatch({ type: 'UPDATE_PAYMENT', payload: upd });
      } else {
        const { data: created, error } = await supabase.from('pagamentos').insert(payload).select().single();
        if (error) { console.error('pagamentos INSERT:', error); setSaveError([error.message, error.details].filter(Boolean).join(' | ')); return; }
        if (created) dispatch({ type: 'ADD_PAYMENT', payload: created });
      }
      setShowPayModal(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSavingPay(false);
    }
  }

  async function markReceived(p: Pagamento) {
    const { supabase } = await import('@/lib/supabase');
    const { data: upd } = await supabase.from('pagamentos').update({ status: 'recebido', valor_recebido: p.valor_previsto, data_pag: new Date().toISOString().slice(0, 10) }).eq('id', p.id).select().single();
    if (upd) dispatch({ type: 'UPDATE_PAYMENT', payload: upd });
  }

  async function handleSaveContract(e: React.FormEvent) {
    e.preventDefault();
    if (!contractForm.child_id) return;
    setSavingContract(true);
    setSaveError(null);
    try {
      const { supabase } = await import('@/lib/supabase');
      const payload: Partial<Contrato> = {
        clinic_id: state.user?.clinicId,
        child_id: Number(contractForm.child_id),
        tipo: contractForm.tipo,
        convenio: contractForm.tipo === 'convenio' ? contractForm.convenio || null : null,
        valor_sessao: Number(contractForm.valor_sessao) || null,
        sessoes_semanais: Number(contractForm.sessoes_semanais) || null,
        duracao_min: Number(contractForm.duracao_min) || null,
        dia_vencimento: Number(contractForm.dia_vencimento) || null,
        status: contractForm.status as Contrato['status'],
      };
      const { data: created, error } = await supabase.from('contratos').insert(payload).select().single();
      if (error) {
        const msg = [error.message, error.details, error.hint].filter(Boolean).join(' | ');
        console.error('contratos INSERT error:', error);
        setSaveError(msg || JSON.stringify(error));
        return;
      }
      if (created) dispatch({ type: 'ADD_CONTRACT', payload: created });
      setShowContractModal(false);
    } catch (err: unknown) {
      console.error('handleSaveContract exception:', err);
      setSaveError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setSavingContract(false);
    }
  }

  const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
    recebido: { color: '#10b981', bg: 'rgba(16,185,129,.12)' },
    pendente: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
    inadimplente: { color: '#ef4444', bg: 'rgba(239,68,68,.12)' },
    parcial: { color: '#8b5cf6', bg: 'rgba(139,92,246,.12)' },
  };

  const statusLabel: Record<string, string> = {
    recebido: 'Recebido',
    pendente: 'Pendente',
    inadimplente: 'Inadimplente',
    parcial: 'Parcial',
  };

  return (
    <div className="view show" id="v-financeiro">
      <div className="page-body">
        <div className="page-hero">
          <div className="ph-pre"><span></span>Financeiro</div>
          <h1 className="ph-title">Financeiro</h1>
          <div className="ph-sub">Gestão de pagamentos e contratos</div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Recebido', value: formatCurrency(stats.recebido), color: '#10b981' },
            { label: 'Pendente', value: formatCurrency(stats.pendente), color: '#f59e0b' },
            { label: 'Previsto total', value: formatCurrency(stats.previsto), color: 'var(--p)' },
            { label: 'Cobranças', value: stats.count, color: 'var(--v)' },
          ].map((k) => (
            <div key={k.label} style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '18px 16px' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, borderBottom: '1px solid var(--bdr)' }}>
          {([
            { key: 'pagamentos', label: 'Pagamentos' },
            { key: 'contratos',  label: 'Contratos' },
            { key: 'relatorios', label: '📊 Relatórios' },
          ] as { key: TabType; label: string }[]).map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '8px 18px', border: 'none', borderBottom: `2px solid ${tab === key ? 'var(--p)' : 'transparent'}`, background: 'none', color: tab === key ? 'var(--p)' : 'var(--t2)', fontWeight: tab === key ? 700 : 500, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'pagamentos' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 13, fontFamily: 'inherit' }}>
                {monthOptions.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
              <button className="btn-p" onClick={openNewPay} style={{ marginLeft: 'auto' }}>+ Cobrar pagamento</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {monthPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)' }}>Nenhum pagamento neste mês</div>
              ) : monthPayments.map((p) => {
                const st = STATUS_BADGE[p.status] ?? { color: 'var(--t3)', bg: 'var(--sf2)' };
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{childName(p.child_id)}</div>
                      <div style={{ fontSize: 12, color: 'var(--t3)' }}>{p.mes} · Previsto: {formatCurrency(p.valor_previsto)}</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>{formatCurrency(p.valor_recebido)}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      {statusLabel[p.status] ?? p.status}
                    </span>
                    {p.status === 'pendente' && (
                      <button onClick={() => markReceived(p)} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Recebido</button>
                    )}
                    <button onClick={() => openEditPay(p)} style={{ background: 'none', border: '1px solid var(--bdr)', borderRadius: 8, padding: '6px 10px', color: 'var(--t2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Editar</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'relatorios' && <BiFinanceiro />}

        {tab === 'contratos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className="btn-p" onClick={() => setShowContractModal(true)}>+ Novo contrato</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.contracts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)' }}>Nenhum contrato cadastrado</div>
              ) : data.contracts.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{childName(c.child_id)}</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                      {c.sessoes_semanais}x/semana · Vto dia {c.dia_vencimento} · {c.tipo ?? 'particular'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>
                    {formatCurrency(c.valor_sessao ?? 0)}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--t3)' }}>/sessão</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: c.status === 'ativo' ? 'rgba(16,185,129,.12)' : 'var(--sf2)', color: c.status === 'ativo' ? '#10b981' : 'var(--t3)' }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowPayModal(false)}>
          <div style={{ background: 'var(--bg)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', margin: 0 }}>{selectedPay ? 'Editar pagamento' : 'Novo pagamento'}</h2>
              <button onClick={() => setShowPayModal(false)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSavePay} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Paciente *</label>
                <select value={payForm.child_id} onChange={(e) => setPayForm(f => ({ ...f, child_id: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
                  <option value="">Selecione...</option>
                  {data.children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Mês ref.</label>
                  <input type="month" value={payForm.mes} onChange={(e) => setPayForm(f => ({ ...f, mes: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Valor previsto (R$)</label>
                  <input type="number" value={payForm.valor_previsto} onChange={(e) => setPayForm(f => ({ ...f, valor_previsto: e.target.value }))} required min="0" step="0.01" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Status</label>
                  <select value={payForm.status} onChange={(e) => setPayForm(f => ({ ...f, status: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
                    <option value="pendente">Pendente</option>
                    <option value="recebido">Recebido</option>
                    <option value="parcial">Parcial</option>
                    <option value="inadimplente">Inadimplente</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Valor recebido (R$)</label>
                  <input type="number" value={payForm.valor_recebido} onChange={(e) => setPayForm(f => ({ ...f, valor_recebido: e.target.value }))} min="0" step="0.01" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </div>
              {saveError && (
                <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#ef4444', wordBreak: 'break-word' }}>
                  <strong>Erro:</strong> {saveError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowPayModal(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--bdr)', borderRadius: 10, background: 'none', color: 'var(--t2)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={savingPay} className="btn-p" style={{ flex: 2 }}>{savingPay ? 'Salvando...' : selectedPay ? 'Salvar' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {showContractModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowContractModal(false)}>
          <div style={{ background: 'var(--bg)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', margin: 0 }}>Novo contrato</h2>
              <button onClick={() => setShowContractModal(false)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSaveContract} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Paciente *</label>
                <select value={contractForm.child_id} onChange={(e) => setContractForm(f => ({ ...f, child_id: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
                  <option value="">Selecione...</option>
                  {data.children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Tipo</label>
                  <select value={contractForm.tipo} onChange={(e) => setContractForm(f => ({ ...f, tipo: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
                    <option value="particular">Particular</option>
                    <option value="convenio">Convênio</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Valor/sessão (R$)</label>
                  <input type="number" value={contractForm.valor_sessao} onChange={(e) => setContractForm(f => ({ ...f, valor_sessao: e.target.value }))} min="0" step="0.01" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </div>
              {contractForm.tipo === 'convenio' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Convênio</label>
                  <input value={contractForm.convenio} onChange={(e) => setContractForm(f => ({ ...f, convenio: e.target.value }))} placeholder="Nome do convênio" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Sessões/semana</label>
                  <input type="number" value={contractForm.sessoes_semanais} onChange={(e) => setContractForm(f => ({ ...f, sessoes_semanais: e.target.value }))} min="1" max="30" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Duração (min)</label>
                  <input type="number" value={contractForm.duracao_min} onChange={(e) => setContractForm(f => ({ ...f, duracao_min: e.target.value }))} min="15" max="240" step="5" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Vto. dia</label>
                  <input type="number" value={contractForm.dia_vencimento} onChange={(e) => setContractForm(f => ({ ...f, dia_vencimento: e.target.value }))} min="1" max="31" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </div>
              {saveError && (
                <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#ef4444', wordBreak: 'break-word' }}>
                  <strong>Erro:</strong> {saveError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowContractModal(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--bdr)', borderRadius: 10, background: 'none', color: 'var(--t2)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={savingContract} className="btn-p" style={{ flex: 2 }}>{savingContract ? 'Salvando...' : 'Criar contrato'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
