'use client';

import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Screen } from '@/lib/types';

interface Props {
  onNav: (screen: Screen) => void;
}

export default function DashboardHome({ onNav }: Props) {
  const { state } = useApp();
  const { data, user } = state;

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);

    const active = data.children.filter((c) => c.status === 'ativo').length;
    const todaySessions = data.sessions.filter((s) => s.data === today).length;
    const todayDone = data.sessions.filter((s) => s.data === today && s.status === 'realizado').length;

    const monthPayments = data.payments.filter((p) => p.mes_ref === thisMonth && p.status === 'recebido');
    const monthRevenue = monthPayments.reduce((sum, p) => sum + (p.valor_recebido || 0), 0);

    const pending = data.payments.filter((p) => p.status === 'pendente').length;

    const totalSessions = data.sessions.filter((s) => s.status === 'realizado' || s.status === 'cancelado' || s.status === 'falta').length;
    const realized = data.sessions.filter((s) => s.status === 'realizado').length;
    const presenceRate = totalSessions > 0 ? Math.round((realized / totalSessions) * 100) : 0;

    return { active, todaySessions, todayDone, monthRevenue, pending, presenceRate };
  }, [data]);

  const upcomingSessions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return data.sessions
      .filter((s) => s.data >= today && s.status === 'agendado')
      .slice(0, 5);
  }, [data.sessions]);

  const recentSessions = useMemo(() => {
    return data.sessions.slice(0, 5);
  }, [data.sessions]);

  const childName = (id: number) =>
    data.children.find((c) => c.id === id)?.name ?? '—';

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    agendado: { label: 'Agendado', color: 'var(--p)' },
    realizado: { label: 'Realizado', color: '#10b981' },
    cancelado: { label: 'Cancelado', color: 'var(--d)' },
    falta: { label: 'Falta', color: 'var(--w)' },
  };

  return (
    <div className="view show" id="v-dashboard-clinic">
      <div className="page-body">

        {/* Header */}
        <div className="page-hero">
          <div className="ph-pre"><span></span>Gestão clínica</div>
          <h1 className="ph-title">Olá, {user?.name?.split(' ')[0] ?? 'Terapeuta'} 👋</h1>
          <div className="ph-sub">Visão geral da clínica · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Pacientes ativos', value: stats.active, icon: '👨‍👩‍👦', color: 'var(--p)', action: () => onNav('pacientes') },
            { label: 'Sessões hoje', value: `${stats.todayDone}/${stats.todaySessions}`, icon: '📅', color: 'var(--v)', action: () => onNav('agenda') },
            { label: 'Receita do mês', value: formatCurrency(stats.monthRevenue), icon: '💰', color: '#10b981', action: () => onNav('financeiro') },
            { label: 'Taxa de presença', value: `${stats.presenceRate}%`, icon: '✅', color: stats.presenceRate >= 80 ? '#10b981' : 'var(--w)', action: () => onNav('bi') },
            { label: 'Cobranças pendentes', value: stats.pending, icon: '⏳', color: stats.pending > 0 ? 'var(--w)' : '#10b981', action: () => onNav('financeiro') },
          ].map((kpi) => (
            <div
              key={kpi.label}
              onClick={kpi.action}
              style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 18px', cursor: 'pointer', transition: '.2s' }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{kpi.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4, fontWeight: 600 }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <button className="btn-p" onClick={() => onNav('pacientes')}>+ Novo paciente</button>
          <button className="btn-s" onClick={() => onNav('agenda')}>📅 Ver agenda</button>
          <button className="btn-s" onClick={() => onNav('reavix')}>🤖 Reavix AI</button>
          <button className="btn-s" onClick={() => onNav('financeiro')}>💰 Financeiro</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Upcoming sessions */}
          <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 18px' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: 'var(--t1)' }}>Próximas sessões</div>
            {upcomingSessions.length === 0 ? (
              <div style={{ color: 'var(--t3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nenhuma sessão agendada</div>
            ) : upcomingSessions.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--bdr)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.paciente_nome || childName(s.child_id)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{formatDate(s.data)} · {s.hora} · {s.tipo}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--p)', background: 'var(--ps)', padding: '3px 8px', borderRadius: 20 }}>
                  {STATUS_MAP[s.status]?.label}
                </span>
              </div>
            ))}
            <button
              onClick={() => onNav('agenda')}
              style={{ marginTop: 14, width: '100%', padding: '8px', background: 'none', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--t2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Ver agenda completa →
            </button>
          </div>

          {/* Recent activity */}
          <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 18px' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: 'var(--t1)' }}>Atividade recente</div>
            {recentSessions.length === 0 ? (
              <div style={{ color: 'var(--t3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nenhuma sessão registrada ainda</div>
            ) : recentSessions.map((s) => {
              const st = STATUS_MAP[s.status];
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--bdr)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: st?.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.paciente_nome || childName(s.child_id)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>{formatDate(s.data)} · {s.tipo}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: st?.color }}>{st?.label}</span>
                </div>
              );
            })}
            <button
              onClick={() => onNav('agenda')}
              style={{ marginTop: 14, width: '100%', padding: '8px', background: 'none', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--t2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Ver histórico →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
