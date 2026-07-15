'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { Meta } from '@/lib/types';

const AREAS = ['Comunicação', 'Cognitivo', 'Social', 'Motor', 'Autocuidado', 'Comportamento', 'Acadêmico'];
const GOAL_STATUS = [
  { val: 'ativo', label: 'Em andamento', color: 'var(--p)' },
  { val: 'atingido', label: 'Atingido', color: '#10b981' },
  { val: 'pausado', label: 'Pausado', color: '#f59e0b' },
];

export default function PeiScreen() {
  const { state, dispatch } = useApp();
  const { data } = state;

  const [selectedChildId, setSelectedChildId] = useState<number | null>(data.children[0]?.id ?? null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Meta | null>(null);
  const [areaFilter, setAreaFilter] = useState<string>('Todos');
  const [form, setForm] = useState({ descricao: '', criterio: '', area: 'Comunicação', status: 'ativo' });
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGoals, setAiGoals] = useState<string[]>([]);

  const selectedChild = useMemo(() => data.children.find((c) => c.id === selectedChildId) ?? null, [data.children, selectedChildId]);

  const goals = useMemo(() => {
    if (!selectedChildId) return [];
    return data.goals.filter((g) => g.child_id === selectedChildId);
  }, [data.goals, selectedChildId]);

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => areaFilter === 'Todos' || g.area === areaFilter);
  }, [goals, areaFilter]);

  const goalsByArea = useMemo(() => {
    const map: Record<string, Meta[]> = {};
    filteredGoals.forEach((g) => {
      const key = g.area ?? 'Geral';
      if (!map[key]) map[key] = [];
      map[key].push(g);
    });
    return map;
  }, [filteredGoals]);

  function openNew() {
    setSelectedGoal(null);
    setForm({ descricao: '', criterio: '', area: 'Comunicação', status: 'ativo' });
    setShowModal(true);
  }

  function openEdit(g: Meta) {
    setSelectedGoal(g);
    setForm({ descricao: g.descricao, criterio: g.criterio ?? '', area: g.area ?? 'Comunicação', status: g.status });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.descricao || !selectedChildId) return;
    setSaving(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const payload = { clinic_id: state.user?.clinicId, child_id: selectedChildId, descricao: form.descricao, criterio: form.criterio || null, area: form.area, status: form.status };
      if (selectedGoal) {
        const { data: upd } = await supabase.from('metas').update(payload).eq('id', selectedGoal.id).select().single();
        if (upd) dispatch({ type: 'UPDATE_GOAL', payload: upd });
      } else {
        const { data: created } = await supabase.from('metas').insert(payload).select().single();
        if (created) dispatch({ type: 'ADD_GOAL', payload: created });
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function generateAIGoals() {
    if (!selectedChild) return;
    setAiLoading(true);
    setAiGoals([]);
    try {
      const res = await fetch('/api/reavix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Gere 5 objetivos terapêuticos para o PEI de uma criança com ${selectedChild.diagnosis ?? 'TEA'}. Formate como lista simples com uma meta por linha, sem numeração, sem marcadores.`,
          history: [],
        }),
      });
      const json = await res.json();
      const lines = (json.response ?? '').split('\n').filter((l: string) => l.trim().length > 10).slice(0, 5);
      setAiGoals(lines);
    } finally {
      setAiLoading(false);
    }
  }

  const statusInfo = (s: string) => GOAL_STATUS.find((x) => x.val === s) ?? { label: s, color: 'var(--t3)' };

  return (
    <div className="view show" id="v-pei">
      <div className="page-body">
        <div className="page-hero">
          <div className="ph-pre"><span></span>PEI</div>
          <h1 className="ph-title">PEI <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--t3)' }}>Plano de Ensino Individualizado</span></h1>
          <div className="ph-sub">Metas e objetivos terapêuticos por paciente</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={selectedChildId ?? ''} onChange={(e) => setSelectedChildId(Number(e.target.value))} style={{ padding: '10px 14px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
            {data.children.length === 0 && <option value="">Nenhum paciente</option>}
            {data.children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Todos', ...AREAS].map((a) => (
              <button key={a} onClick={() => setAreaFilter(a)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid', borderColor: areaFilter === a ? 'var(--p)' : 'var(--bdr)', background: areaFilter === a ? 'var(--ps)' : 'none', color: areaFilter === a ? 'var(--p)' : 'var(--t2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{a}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => { setShowAI(true); generateAIGoals(); }} style={{ padding: '10px 16px', border: '1px solid var(--p)', borderRadius: 10, background: 'var(--ps)', color: 'var(--p)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🤖 Gerar com AI</button>
            <button onClick={openNew} className="btn-p">+ Nova meta</button>
          </div>
        </div>

        {/* Status summary */}
        {goals.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {GOAL_STATUS.map((s) => {
              const count = goals.filter((g) => g.status === s.val).length;
              return (
                <div key={s.val} style={{ background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{count}</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {filteredGoals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--t3)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>Nenhuma meta cadastrada</div>
            <div style={{ fontSize: 13, marginBottom: 24 }}>Crie as primeiras metas do PEI para este paciente</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => { setShowAI(true); generateAIGoals(); }} style={{ padding: '10px 18px', border: '1px solid var(--p)', borderRadius: 10, background: 'var(--ps)', color: 'var(--p)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🤖 Sugerir metas com AI</button>
              <button className="btn-p" onClick={openNew}>+ Nova meta</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Object.entries(goalsByArea).map(([area, areaGoals]) => (
              <div key={area}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t2)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: 'var(--p)' }} />
                  {area} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)' }}>({areaGoals.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {areaGoals.map((g) => {
                    const st = statusInfo(g.status);
                    return (
                      <div key={g.id} onClick={() => openEdit(g)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'var(--sf)', border: '1px solid var(--bdr)', borderLeft: `4px solid ${st.color}`, borderRadius: 12, cursor: 'pointer' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: g.criterio ? 4 : 0 }}>{g.descricao}</div>
                          {g.criterio && <div style={{ fontSize: 12, color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Critério: {g.criterio}</div>}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.color + '22', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', margin: 0 }}>{selectedGoal ? 'Editar meta' : 'Nova meta'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Descrição do objetivo *</label>
                <textarea rows={2} value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} required placeholder="Ex: Nomear 20 objetos funcionais do cotidiano" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Critério de domínio</label>
                <input value={form.criterio} onChange={(e) => setForm(f => ({ ...f, criterio: e.target.value }))} placeholder="Ex: 80% de acertos em 3 sessões consecutivas" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Área</label>
                  <select value={form.area} onChange={(e) => setForm(f => ({ ...f, area: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Status</label>
                  <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
                    {GOAL_STATUS.map((s) => <option key={s.val} value={s.val}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--bdr)', borderRadius: 10, background: 'none', color: 'var(--t2)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={saving} className="btn-p" style={{ flex: 2 }}>{saving ? 'Salvando...' : selectedGoal ? 'Salvar' : 'Criar meta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Suggestions Modal */}
      {showAI && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowAI(false)}>
          <div style={{ background: 'var(--bg)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', margin: 0 }}>🤖 Sugestões de metas — AI</h2>
              <button onClick={() => setShowAI(false)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            {aiLoading ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--t3)' }}>Gerando sugestões personalizadas...</div>
            ) : aiGoals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aiGoals.map((goal, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 10 }}>
                    <div style={{ flex: 1, fontSize: 13, color: 'var(--t1)', lineHeight: 1.5 }}>{goal}</div>
                    <button onClick={() => { setForm(f => ({ ...f, descricao: goal.replace(/^[-•*]\s*/, '') })); setSelectedGoal(null); setShowAI(false); setShowModal(true); }} style={{ padding: '6px 12px', background: 'var(--p)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                      Usar
                    </button>
                  </div>
                ))}
                <button onClick={generateAIGoals} style={{ marginTop: 8, padding: '10px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'none', color: 'var(--t2)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>↻ Gerar novas sugestões</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--t3)' }}>Nenhuma sugestão gerada</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
