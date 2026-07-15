'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/utils';
import type { Sessao } from '@/lib/types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const SESSION_TYPES = ['ABA', 'TO', 'Fonoaudiologia', 'Psicologia', 'Avaliação', 'Outro'];
const STATUS_OPTS = [
  { val: 'agendado', label: 'Agendado', color: 'var(--p)' },
  { val: 'realizado', label: 'Realizado', color: '#10b981' },
  { val: 'cancelado', label: 'Cancelado', color: 'var(--d)' },
  { val: 'falta', label: 'Falta', color: 'var(--w)' },
];

export default function AgendaScreen() {
  const { state, dispatch } = useApp();
  const { data } = state;

  const todayStr = new Date().toISOString().slice(0, 10);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Sessao | null>(null);
  const [form, setForm] = useState({ child_id: '', data: todayStr, hora: '09:00', duracao_min: '50', tipo: 'ABA', status: 'agendado', notas: '' });
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'semana' | 'lista'>('semana');

  const weekDates = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() + weekOffset * 7);
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    const f = new Date(weekDates[0] + 'T12:00:00');
    const l = new Date(weekDates[6] + 'T12:00:00');
    return `${f.getDate()}/${f.getMonth() + 1} – ${l.getDate()}/${l.getMonth() + 1}/${l.getFullYear()}`;
  }, [weekDates]);

  const sessionsByDate = useMemo(() => {
    const map: Record<string, Sessao[]> = {};
    for (const s of data.sessions) {
      if (!map[s.data]) map[s.data] = [];
      map[s.data].push(s);
    }
    return map;
  }, [data.sessions]);

  const childName = (id: number) =>
    data.children.find((c) => c.id === id)?.name ?? '—';

  function openNew(date?: string) {
    setSelected(null);
    setForm({ child_id: '', data: date ?? todayStr, hora: '09:00', duracao_min: '50', tipo: 'ABA', status: 'agendado', notas: '' });
    setShowModal(true);
  }

  function openEdit(s: Sessao) {
    setSelected(s);
    setForm({ child_id: String(s.child_id), data: s.data, hora: s.hora, duracao_min: String(s.duracao_min ?? 50), tipo: s.tipo, status: s.status, notas: s.notas ?? '' });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.child_id || !form.data) return;
    setSaving(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const childId = Number(form.child_id);
      const paciente = data.children.find((c) => c.id === childId);
      const payload = {
        clinic_id: state.user?.clinicId,
        child_id: childId,
        data: form.data,
        hora: form.hora,
        duracao_min: Number(form.duracao_min),
        tipo: form.tipo,
        status: form.status,
        notas: form.notas || null,
        paciente_nome: paciente?.name ?? null,
      };

      if (selected) {
        const { data: updated } = await supabase.from('sessoes').update(payload).eq('id', selected.id).select().single();
        if (updated) dispatch({ type: 'UPDATE_SESSION', payload: updated });
      } else {
        const { data: created } = await supabase.from('sessoes').insert(payload).select().single();
        if (created) dispatch({ type: 'ADD_SESSION', payload: created });
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  const statusColor = (s: string) => STATUS_OPTS.find((o) => o.val === s)?.color ?? 'var(--t3)';
  const statusLabel = (s: string) => STATUS_OPTS.find((o) => o.val === s)?.label ?? s;

  return (
    <div className="view show" id="v-agenda">
      <div className="page-body">
        <div className="page-hero">
          <div className="ph-pre"><span></span>Gestão</div>
          <h1 className="ph-title">Agenda</h1>
          <div className="ph-sub">Semana de {weekLabel}</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setWeekOffset(w => w - 1)} style={{ padding: '8px 12px', border: '1px solid var(--bdr)', borderRadius: 8, background: 'none', color: 'var(--t2)', cursor: 'pointer', fontFamily: 'inherit' }}>← Ant.</button>
            <button onClick={() => setWeekOffset(0)} style={{ padding: '8px 12px', border: '1px solid', borderColor: weekOffset === 0 ? 'var(--p)' : 'var(--bdr)', borderRadius: 8, background: weekOffset === 0 ? 'var(--ps)' : 'none', color: weekOffset === 0 ? 'var(--p)' : 'var(--t2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Hoje</button>
            <button onClick={() => setWeekOffset(w => w + 1)} style={{ padding: '8px 12px', border: '1px solid var(--bdr)', borderRadius: 8, background: 'none', color: 'var(--t2)', cursor: 'pointer', fontFamily: 'inherit' }}>Próx. →</button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['semana', 'lista'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '8px 14px', border: '1px solid', borderColor: view === v ? 'var(--p)' : 'var(--bdr)', borderRadius: 8, background: view === v ? 'var(--ps)' : 'none', color: view === v ? 'var(--p)' : 'var(--t2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, textTransform: 'capitalize' }}>{v}</button>
            ))}
          </div>
          <button className="btn-p" onClick={() => openNew()} style={{ marginLeft: 'auto' }}>+ Agendar sessão</button>
        </div>

        {view === 'semana' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
            {weekDates.map((date) => {
              const sessions = (sessionsByDate[date] ?? []).sort((a, b) => a.hora.localeCompare(b.hora));
              const isToday = date === todayStr;
              return (
                <div key={date} style={{ background: isToday ? 'var(--ps)' : 'var(--sf)', border: `1px solid ${isToday ? 'var(--p)' : 'var(--bdr)'}`, borderRadius: 'var(--r)', padding: 10, minHeight: 120 }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: isToday ? 'var(--p)' : 'var(--t3)', textTransform: 'uppercase', marginBottom: 4 }}>{WEEKDAYS[new Date(date + 'T12:00:00').getDay()]}</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: isToday ? 'var(--p)' : 'var(--t1)', marginBottom: 8 }}>{new Date(date + 'T12:00:00').getDate()}</div>
                  {sessions.map((s) => (
                    <div key={s.id} onClick={() => openEdit(s)} style={{ background: 'var(--bg)', border: `2px solid ${statusColor(s.status)}`, borderRadius: 6, padding: '4px 6px', marginBottom: 4, cursor: 'pointer', fontSize: 11 }}>
                      <div style={{ fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.paciente_nome || childName(s.child_id)}
                      </div>
                      <div style={{ color: 'var(--t3)' }}>{s.hora} · {s.tipo}</div>
                    </div>
                  ))}
                  <button onClick={() => openNew(date)} style={{ width: '100%', marginTop: 4, padding: '3px 0', background: 'none', border: '1px dashed var(--bdr)', borderRadius: 6, color: 'var(--t3)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>+ Sessão</button>
                </div>
              );
            })}
          </div>
        )}

        {view === 'lista' && (
          <div>
            {weekDates.map((date) => {
              const sessions = (sessionsByDate[date] ?? []).sort((a, b) => a.hora.localeCompare(b.hora));
              if (sessions.length === 0 && date !== todayStr) return null;
              return (
                <div key={date} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: date === todayStr ? 'var(--p)' : 'var(--t2)', padding: '6px 0', borderBottom: '1px solid var(--bdr)', marginBottom: 8 }}>
                    {WEEKDAYS[new Date(date + 'T12:00:00').getDay()]}, {formatDate(date)}
                    {date === todayStr && <span style={{ marginLeft: 8, fontSize: 10, background: 'var(--p)', color: '#fff', padding: '2px 8px', borderRadius: 20 }}>Hoje</span>}
                  </div>
                  {sessions.length === 0
                    ? <div style={{ fontSize: 12, color: 'var(--t3)', padding: '4px 0' }}>Nenhuma sessão</div>
                    : sessions.map((s) => (
                      <div key={s.id} onClick={() => openEdit(s)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: 'var(--sf)', border: '1px solid var(--bdr)', borderLeft: `4px solid ${statusColor(s.status)}`, borderRadius: 10, marginBottom: 6, cursor: 'pointer' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{s.paciente_nome || childName(s.child_id)}</div>
                          <div style={{ fontSize: 12, color: 'var(--t3)' }}>{s.hora} · {s.duracao_min}min · {s.tipo}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: statusColor(s.status) }}>{statusLabel(s.status)}</span>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', margin: 0 }}>{selected ? 'Editar sessão' : 'Nova sessão'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Paciente *</label>
                <select value={form.child_id} onChange={(e) => setForm(f => ({ ...f, child_id: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
                  <option value="">Selecione...</option>
                  {data.children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Data *</label>
                  <input type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Horário *</label>
                  <input type="time" value={form.hora} onChange={(e) => setForm(f => ({ ...f, hora: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
                    {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Status</label>
                  <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
                    {STATUS_OPTS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Duração (min)</label>
                <input type="number" value={form.duracao_min} onChange={(e) => setForm(f => ({ ...f, duracao_min: e.target.value }))} min="15" max="240" step="5" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Observações</label>
                <textarea rows={2} value={form.notas} onChange={(e) => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Notas da sessão..." style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--bdr)', borderRadius: 10, background: 'none', color: 'var(--t2)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={saving} className="btn-p" style={{ flex: 2 }}>{saving ? 'Salvando...' : selected ? 'Salvar' : 'Agendar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
