'use client';

import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, getLastNMonths, MONTH_NAMES } from '@/lib/utils';

export default function BiScreen() {
  const { state } = useApp();
  const { data } = state;

  const months = useMemo(() => getLastNMonths(6), []);

  const revenueByMonth = useMemo(() => {
    return months.map((m) => ({
      label: MONTH_NAMES[parseInt(m.slice(5, 7)) - 1].slice(0, 3),
      value: data.payments.filter((p) => p.mes_ref === m && (p.status === 'recebido' || p.status === 'parcial')).reduce((s, p) => s + (p.valor_recebido ?? 0), 0),
    }));
  }, [months, data.payments]);

  const sessionsByMonth = useMemo(() => {
    return months.map((m) => ({
      label: MONTH_NAMES[parseInt(m.slice(5, 7)) - 1].slice(0, 3),
      total: data.sessions.filter((s) => s.data.startsWith(m)).length,
      done: data.sessions.filter((s) => s.data.startsWith(m) && s.status === 'realizado').length,
      miss: data.sessions.filter((s) => s.data.startsWith(m) && s.status === 'falta').length,
    }));
  }, [months, data.sessions]);

  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.value), 1);
  const maxSessions = Math.max(...sessionsByMonth.map((m) => m.total), 1);

  const totalRevenue = revenueByMonth.reduce((s, m) => s + m.value, 0);
  const totalSessions = data.sessions.filter((s) => s.status === 'realizado').length;
  const totalCancelled = data.sessions.filter((s) => s.status === 'cancelado' || s.status === 'falta').length;
  const presenceRate = totalSessions + totalCancelled > 0 ? Math.round((totalSessions / (totalSessions + totalCancelled)) * 100) : 0;

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    data.sessions.forEach((s) => { map[s.tipo] = (map[s.tipo] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [data.sessions]);

  const totalType = byType.reduce((s, [, v]) => s + v, 0) || 1;
  const TYPE_COLORS = ['var(--p)', 'var(--v)', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="view show" id="v-clinic-bi">
      <div className="page-body">
        <div className="page-hero">
          <div className="ph-pre"><span></span>Analytics</div>
          <h1 className="ph-title">BI Clínica</h1>
          <div className="ph-sub">Indicadores dos últimos 6 meses</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Receita 6 meses', value: formatCurrency(totalRevenue), color: 'var(--p)' },
            { label: 'Sessões realizadas', value: totalSessions, color: '#10b981' },
            { label: 'Taxa de presença', value: `${presenceRate}%`, color: presenceRate >= 80 ? '#10b981' : '#f59e0b' },
            { label: 'Pacientes ativos', value: data.children.filter((c) => c.status === 'ativo').length, color: 'var(--v)' },
          ].map((k) => (
            <div key={k.label} style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '18px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 18px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 18 }}>Receita mensal</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
              {revenueByMonth.map((m) => (
                <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>{m.value > 0 ? 'R$' + Math.round(m.value / 100) * 100 / 100 : ''}</div>
                  <div style={{ width: '100%', background: 'var(--p)', borderRadius: '4px 4px 0 0', height: `${Math.max((m.value / maxRevenue) * 100, m.value > 0 ? 4 : 0)}%`, opacity: 0.85 }} />
                  <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 18px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 18 }}>Sessões por mês</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
              {sessionsByMonth.map((m) => (
                <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>{m.total > 0 ? m.total : ''}</div>
                  <div style={{ width: '100%', position: 'relative', borderRadius: '4px 4px 0 0', height: `${Math.max((m.total / maxSessions) * 100, m.total > 0 ? 4 : 0)}%` }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(m.done / (m.total || 1)) * 100}%`, background: '#10b981', borderRadius: '4px 4px 0 0' }} />
                    <div style={{ position: 'absolute', bottom: `${(m.done / (m.total || 1)) * 100}%`, left: 0, right: 0, height: `${(m.miss / (m.total || 1)) * 100}%`, background: '#f59e0b' }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              {[['#10b981', 'Realizadas'], ['#f59e0b', 'Faltas']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--t3)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '20px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 18 }}>Sessões por tipo</div>
          {byType.length === 0 ? (
            <div style={{ color: 'var(--t3)', fontSize: 13 }}>Nenhuma sessão registrada</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byType.map(([type, count], i) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 80, fontSize: 12, fontWeight: 600, color: 'var(--t2)', flexShrink: 0 }}>{type}</div>
                  <div style={{ flex: 1, height: 10, background: 'var(--sf2)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / totalType) * 100}%`, background: TYPE_COLORS[i % TYPE_COLORS.length], borderRadius: 5 }} />
                  </div>
                  <div style={{ width: 36, fontSize: 12, fontWeight: 700, color: 'var(--t1)', textAlign: 'right' }}>{count}</div>
                  <div style={{ width: 36, fontSize: 11, color: 'var(--t3)', textAlign: 'right' }}>{Math.round((count / totalType) * 100)}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
