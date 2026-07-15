'use client';

import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function PortalScreen() {
  const { state } = useApp();
  const { data, user } = state;

  const isFamiliar = user?.role === 'familia';
  const myChild = data.children[0] ?? null;

  const childSessions = useMemo(() => {
    if (!myChild) return [];
    return data.sessions.filter((s) => s.child_id === myChild.id).slice(0, 10);
  }, [data.sessions, myChild]);

  const childGoals = useMemo(() => {
    if (!myChild) return [];
    return data.goals.filter((g) => g.child_id === myChild.id);
  }, [data.goals, myChild]);

  const childPayments = useMemo(() => {
    if (!myChild) return [];
    return data.payments.filter((p) => p.child_id === myChild.id).slice(0, 6);
  }, [data.payments, myChild]);

  const presenceRate = useMemo(() => {
    const done = childSessions.filter((s) => s.status === 'realizado').length;
    const total = childSessions.filter((s) => s.status !== 'agendado').length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [childSessions]);

  const STATUS_COLORS: Record<string, string> = {
    agendado: 'var(--p)',
    realizado: '#10b981',
    cancelado: '#ef4444',
    falta: '#f59e0b',
  };

  const STATUS_LABELS: Record<string, string> = {
    agendado: 'Agendado',
    realizado: 'Realizado',
    cancelado: 'Cancelado',
    falta: 'Falta',
  };

  if (!myChild) {
    return (
      <div className="view show" id="v-portal">
        <div className="page-body" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>Portal da Família</div>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Nenhum paciente cadastrado ainda.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="view show" id="v-portal">
      <div className="page-body">
        <div className="page-hero">
          <div className="ph-pre"><span></span>Portal Família</div>
          <h1 className="ph-title">Olá, família! 👨‍👩‍👦</h1>
          <div className="ph-sub">{isFamiliar ? 'Seu espaço de acompanhamento' : `Preview do portal — ${myChild.name}`}</div>
        </div>

        {!isFamiliar && (
          <div style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
            👁️ Preview — Assim as famílias verão o portal
          </div>
        )}

        {/* Child card */}
        <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg,var(--p),var(--v))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
            {myChild.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)' }}>{myChild.name}</div>
            {myChild.diagnosis && <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 2 }}>{myChild.diagnosis}</div>}
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { v: childSessions.length, l: 'SESSÕES' },
              { v: `${presenceRate}%`, l: 'PRESENÇA', c: '#10b981' },
              { v: childGoals.length, l: 'METAS' },
            ].map(({ v, l, c }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: c ?? 'var(--p)' }}>{v}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Sessions */}
          <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '18px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 14 }}>📅 Sessões recentes</div>
            {childSessions.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--t3)', padding: '10px 0' }}>Nenhuma sessão registrada</div>
            ) : childSessions.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--bdr)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s.status] ?? 'var(--t3)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{formatDate(s.data)}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{s.hora} · {s.tipo} · {s.duracao_min}min</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLORS[s.status] ?? 'var(--t3)' }}>
                  {STATUS_LABELS[s.status] ?? s.status}
                </span>
              </div>
            ))}
          </div>

          {/* Goals */}
          <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '18px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 14 }}>🎯 Metas do PEI</div>
            {childGoals.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--t3)', padding: '10px 0' }}>Nenhuma meta cadastrada</div>
            ) : childGoals.map((g) => (
              <div key={g.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--bdr)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 2 }}>{g.descricao}</div>
                <div style={{ fontSize: 11, color: g.status === 'atingido' ? '#10b981' : 'var(--t3)' }}>
                  {g.area} · {g.status === 'atingido' ? '✓ Atingido' : g.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {childPayments.length > 0 && (
          <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '18px', marginTop: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 14 }}>💳 Histórico financeiro</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {childPayments.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--t2)' }}>{p.mes_ref}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{formatCurrency(p.valor_previsto ?? 0)}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: p.status === 'recebido' ? '#10b981' : '#f59e0b', background: p.status === 'recebido' ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)', padding: '3px 10px', borderRadius: 20 }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
