'use client';

import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, getLastNMonths, MONTH_NAMES } from '@/lib/utils';

type BiTab = 'financeiro' | 'evolucao';

// ─── Mini bar chart ──────────────────────────────────────
function Bar({ pct, color, label, sub }: { pct: number; color: string; label: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 110, fontSize: 12, fontWeight: 600, color: 'var(--t2)', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ flex: 1, height: 10, background: 'var(--sf2)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.max(pct, pct > 0 ? 2 : 0)}%`, background: color, borderRadius: 5, transition: 'width .4s ease' }} />
      </div>
      {sub && <div style={{ width: 44, fontSize: 12, fontWeight: 700, color: 'var(--t1)', textAlign: 'right', flexShrink: 0 }}>{sub}</div>}
    </div>
  );
}

// ─── KPI card ────────────────────────────────────────────
function KpiCard({ value, label, color, sub }: { value: string | number; label: string; color: string; sub?: string }) {
  return (
    <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '18px 16px' }}>
      <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color, opacity: .6, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginTop: 6 }}>{label}</div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────
function Card({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 18px', ...style }}>
      <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--t1)', marginBottom: 18, letterSpacing: '-.2px' }}>{title}</div>
      {children}
    </div>
  );
}

// ═══ BI FINANCEIRO ══════════════════════════════════════
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
    return Object.values(map).sort((a, b) => b.recebido - a.recebido).slice(0, 6);
  }, [data.payments, data.children]);

  const maxChildRevenue = Math.max(...revenueByChild.map((c) => c.recebido), 1);

  const statusCounts = useMemo(() => {
    const counts = { recebido: 0, pendente: 0, inadimplente: 0, parcial: 0 };
    data.payments.forEach((p) => { if (p.status in counts) counts[p.status as keyof typeof counts]++; });
    return counts;
  }, [data.payments]);

  const totalPags = Object.values(statusCounts).reduce((s, v) => s + v, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard value={formatCurrency(totalRecebido)} label="Recebido (6 meses)" color="#10b981" />
        <KpiCard value={formatCurrency(totalPrevisto)} label="Previsto (6 meses)" color="var(--p)" />
        <KpiCard value={formatCurrency(totalPendente)} label="Em aberto" color="#f59e0b" />
        <KpiCard value={`${taxaRecebimento}%`} label="Taxa de recebimento" color={taxaRecebimento >= 80 ? '#10b981' : '#f59e0b'} />
        <KpiCard value={inadimplentes} label="Inadimplentes" color="#ef4444" />
        <KpiCard value={data.children.filter((c) => c.status === 'ativo').length} label="Pacientes ativos" color="var(--v)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Bar chart: receita mensal */}
        <Card title="Receita mensal (6 meses)">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130 }}>
            {revenueByMonth.map((m) => (
              <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>
                  {m.recebido > 0 ? `R$${Math.round(m.recebido / 1000)}k` : ''}
                </div>
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
        </Card>

        {/* Status de pagamentos */}
        <Card title="Status de cobranças">
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
        </Card>
      </div>

      {/* Receita por paciente */}
      {revenueByChild.length > 0 && (
        <Card title="Receita por paciente (acumulado)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {revenueByChild.map((c) => (
              <Bar
                key={c.name}
                label={c.name}
                pct={(c.recebido / maxChildRevenue) * 100}
                color="var(--p)"
                sub={formatCurrency(c.recebido).replace('R$ ', 'R$').replace(',00', '')}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══ BI EVOLUÇÃO ════════════════════════════════════════
function BiEvolucao() {
  const { state } = useApp();
  const { data } = state;
  const [selectedChildId, setSelectedChildId] = useState<number | null>(
    data.children.find((c) => c.status === 'ativo')?.id ?? data.children[0]?.id ?? null
  );

  const months = useMemo(() => getLastNMonths(6), []);

  const child = useMemo(() => data.children.find((c) => c.id === selectedChildId), [data.children, selectedChildId]);

  const childGoals = useMemo(() => {
    if (!selectedChildId) return [];
    return data.goals.filter((g) => g.child_id === selectedChildId);
  }, [data.goals, selectedChildId]);

  const childSessions = useMemo(() => {
    if (!selectedChildId) return [];
    return data.sessions.filter((s) => s.child_id === selectedChildId);
  }, [data.sessions, selectedChildId]);

  const goalStats = useMemo(() => {
    const total = childGoals.length;
    const atingido = childGoals.filter((g) => g.status === 'atingido').length;
    const ativo = childGoals.filter((g) => g.status === 'ativo').length;
    const pausado = childGoals.filter((g) => g.status === 'pausado').length;
    const pct = total > 0 ? Math.round((atingido / total) * 100) : 0;
    return { total, atingido, ativo, pausado, pct };
  }, [childGoals]);

  const sessionStats = useMemo(() => {
    const total = childSessions.length;
    const realizadas = childSessions.filter((s) => s.status === 'realizado').length;
    const faltas = childSessions.filter((s) => s.status === 'falta' || s.status === 'cancelado').length;
    const presenca = total > 0 ? Math.round((realizadas / total) * 100) : 0;
    return { total, realizadas, faltas, presenca };
  }, [childSessions]);

  const sessionsByMonth = useMemo(() => months.map((m) => {
    const ms = childSessions.filter((s) => s.data.startsWith(m));
    return {
      label: MONTH_NAMES[parseInt(m.slice(5, 7)) - 1].slice(0, 3),
      total: ms.length,
      realizadas: ms.filter((s) => s.status === 'realizado').length,
      faltas: ms.filter((s) => s.status === 'falta' || s.status === 'cancelado').length,
    };
  }), [months, childSessions]);

  const maxSess = Math.max(...sessionsByMonth.map((m) => m.total), 1);

  const goalsByArea = useMemo(() => {
    const map: Record<string, { total: number; atingido: number }> = {};
    childGoals.forEach((g) => {
      const area = g.area || 'Geral';
      if (!map[area]) map[area] = { total: 0, atingido: 0 };
      map[area].total++;
      if (g.status === 'atingido') map[area].atingido++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [childGoals]);

  const AREA_COLORS = ['var(--p)', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  // Progresso de metas ao longo dos últimos 6 meses (simulado via created_at)
  const goalProgressByMonth = useMemo(() => months.map((m) => {
    const atingidasAteMes = childGoals.filter((g) => g.status === 'atingido' && g.created_at && g.created_at.startsWith(m)).length;
    return { label: MONTH_NAMES[parseInt(m.slice(5, 7)) - 1].slice(0, 3), count: atingidasAteMes };
  }), [months, childGoals]);

  const activeChildren = data.children.filter((c) => c.status === 'ativo');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Seletor de paciente */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', flexShrink: 0 }}>Paciente:</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {activeChildren.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChildId(c.id)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                border: `1.5px solid ${selectedChildId === c.id ? 'var(--p)' : 'var(--bdr)'}`,
                background: selectedChildId === c.id ? 'var(--ps)' : 'none',
                color: selectedChildId === c.id ? 'var(--p)' : 'var(--t2)',
                transition: 'all .15s',
              }}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
          {activeChildren.length === 0 && data.children.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChildId(c.id)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                border: `1.5px solid ${selectedChildId === c.id ? 'var(--p)' : 'var(--bdr)'}`,
                background: selectedChildId === c.id ? 'var(--ps)' : 'none',
                color: selectedChildId === c.id ? 'var(--p)' : 'var(--t2)',
                transition: 'all .15s',
              }}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {!child ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--t3)', fontSize: 14 }}>
          Nenhum paciente cadastrado
        </div>
      ) : (
        <>
          {/* KPIs do paciente */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(145px,1fr))', gap: 12 }}>
            <KpiCard value={goalStats.pct + '%'} label="Metas atingidas" color={goalStats.pct >= 60 ? '#10b981' : '#f59e0b'} sub={`${goalStats.atingido}/${goalStats.total}`} />
            <KpiCard value={goalStats.ativo} label="Metas ativas" color="var(--p)" />
            <KpiCard value={sessionStats.presenca + '%'} label="Taxa de presença" color={sessionStats.presenca >= 80 ? '#10b981' : '#f59e0b'} sub={`${sessionStats.realizadas} sessões`} />
            <KpiCard value={sessionStats.realizadas} label="Sessões realizadas" color="#10b981" />
            <KpiCard value={sessionStats.faltas} label="Faltas / Canceladas" color="#ef4444" />
            <KpiCard value={data.evaluations.filter((e) => e.child_id === selectedChildId).length} label="Avaliações" color="var(--v)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Progresso de metas */}
            <Card title="Progresso de metas">
              {/* Donut-style progress ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
                <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
                  <svg width="88" height="88" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r="36" fill="none" stroke="var(--sf2)" strokeWidth="10" />
                    <circle
                      cx="44" cy="44" r="36" fill="none"
                      stroke={goalStats.pct >= 60 ? '#10b981' : goalStats.pct >= 30 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - goalStats.pct / 100)}`}
                      transform="rotate(-90 44 44)"
                      style={{ transition: 'stroke-dashoffset .6s ease' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--t1)', lineHeight: 1 }}>{goalStats.pct}%</div>
                    <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>atingido</div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Atingidas', count: goalStats.atingido, color: '#10b981' },
                    { label: 'Em andamento', count: goalStats.ativo, color: 'var(--p)' },
                    { label: 'Pausadas', count: goalStats.pausado, color: 'var(--t3)' },
                  ].map(({ label, count, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>{label}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metas por área */}
              {goalsByArea.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Por área</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {goalsByArea.slice(0, 5).map(([area, { total, atingido }], i) => (
                      <Bar
                        key={area}
                        label={area}
                        pct={total > 0 ? (atingido / total) * 100 : 0}
                        color={AREA_COLORS[i % AREA_COLORS.length]}
                        sub={`${atingido}/${total}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {goalStats.total === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--t3)', fontSize: 13 }}>
                  Nenhuma meta cadastrada para este paciente
                </div>
              )}
            </Card>

            {/* Sessões por mês */}
            <Card title="Frequência de sessões (6 meses)">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130 }}>
                {sessionsByMonth.map((m) => (
                  <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>{m.total > 0 ? m.total : ''}</div>
                    <div style={{ width: '100%', position: 'relative', borderRadius: '4px 4px 0 0', height: `${Math.max((m.total / maxSess) * 100, m.total > 0 ? 4 : 0)}%` }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'var(--sf2)', borderRadius: '4px 4px 0 0' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(m.total > 0 ? m.realizadas / m.total : 0) * 100}%`, background: '#10b981', borderRadius: '4px 4px 0 0' }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                {[['var(--sf2)', 'Total'], ['#10b981', 'Realizadas']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--t3)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
                  </div>
                ))}
              </div>

              {/* Taxa de presença visual */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--bdr)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>Taxa de presença</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: sessionStats.presenca >= 80 ? '#10b981' : '#f59e0b' }}>{sessionStats.presenca}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--sf2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${sessionStats.presenca}%`, background: sessionStats.presenca >= 80 ? '#10b981' : '#f59e0b', borderRadius: 4, transition: 'width .4s ease' }} />
                </div>
              </div>
            </Card>
          </div>

          {/* Últimas avaliações */}
          {data.evaluations.filter((e) => e.child_id === selectedChildId).length > 0 && (
            <Card title="Avaliações realizadas">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.evaluations
                  .filter((e) => e.child_id === selectedChildId)
                  .sort((a, b) => b.data.localeCompare(a.data))
                  .map((e) => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--sf2)', borderRadius: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ps)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--p)' }}>{e.tipo.slice(0, 3)}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)' }}>{e.tipo}</div>
                        {e.notas && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.notas}</div>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--t3)', flexShrink: 0 }}>
                        {new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ═══ MAIN BI SCREEN ════════════════════════════════════
export default function BiScreen() {
  const [tab, setTab] = useState<BiTab>('financeiro');

  return (
    <div className="view show" id="v-bi">
      <div className="page-body">
        <div className="page-hero">
          <div className="ph-pre"><span></span>Analytics</div>
          <h1 className="ph-title">BI Clínico</h1>
          <div className="ph-sub">Indicadores financeiros e evolução dos pacientes</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid var(--bdr)' }}>
          {([
            { key: 'financeiro', label: '💰 BI Financeiro' },
            { key: 'evolucao',   label: '📈 BI Evolução' },
          ] as { key: BiTab; label: string }[]).map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '9px 20px', border: 'none', borderBottom: `2.5px solid ${tab === key ? 'var(--p)' : 'transparent'}`,
              background: 'none', color: tab === key ? 'var(--p)' : 'var(--t2)',
              fontWeight: tab === key ? 800 : 500, fontSize: 14, cursor: 'pointer',
              fontFamily: 'inherit', marginBottom: -1, transition: 'color .15s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'financeiro' ? <BiFinanceiro /> : <BiEvolucao />}
      </div>
    </div>
  );
}
