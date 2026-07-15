'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/utils';
import type { Avaliacao } from '@/lib/types';

const TIPOS = ['PEDI', 'PS', 'SPM', 'ABLLS', 'VBMAPP', 'CARS', 'Vineland', 'Outro'] as const;

const TIPO_DESC: Record<string, string> = {
  PEDI: 'Inventário de Avaliação Pediátrica de Incapacidade',
  PS: 'Perfil Sensorial',
  SPM: 'Medida de Processamento Sensorial',
  ABLLS: 'Assessment of Basic Language and Learning Skills',
  VBMAPP: 'Verbal Behavior Milestones Assessment',
  CARS: 'Childhood Autism Rating Scale',
  Vineland: 'Escala de Comportamento Adaptativo Vineland',
  Outro: 'Outra avaliação',
};

export default function AvaliacoesScreen() {
  const { state, dispatch } = useApp();
  const { data } = state;

  const [selectedChildId, setSelectedChildId] = useState<number | null>(data.children[0]?.id ?? null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAval, setSelectedAval] = useState<Avaliacao | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo: 'PEDI' as typeof TIPOS[number],
    data: new Date().toISOString().slice(0, 10),
    notas: '',
    scores: '{}',
  });

  const childEvals = useMemo(() =>
    selectedChildId
      ? data.evaluations.filter((e) => e.child_id === selectedChildId)
      : [],
    [data.evaluations, selectedChildId]
  );

  const selectedChild = useMemo(() =>
    data.children.find((c) => c.id === selectedChildId) ?? null,
    [data.children, selectedChildId]
  );

  function openNew() {
    setSelectedAval(null);
    setForm({ tipo: 'PEDI', data: new Date().toISOString().slice(0, 10), notas: '', scores: '{}' });
    setShowModal(true);
  }

  function openEdit(a: Avaliacao) {
    setSelectedAval(a);
    setForm({
      tipo: a.tipo,
      data: a.data,
      notas: a.notas ?? '',
      scores: JSON.stringify(a.scores ?? {}, null, 2),
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChildId) return;
    setSaving(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      let scores: Record<string, unknown> = {};
      try { scores = JSON.parse(form.scores); } catch { scores = {}; }

      const payload = {
        clinic_id: state.user?.clinicId,
        child_id: selectedChildId,
        tipo: form.tipo,
        data: form.data,
        notas: form.notas || null,
        scores,
      };

      if (selectedAval) {
        const { data: upd } = await supabase.from('avaliacoes').update(payload).eq('id', selectedAval.id).select().single();
        if (upd) {
          dispatch({ type: 'SET_DATA', payload: { evaluations: data.evaluations.map((a) => a.id === upd.id ? upd : a) } });
        }
      } else {
        const { data: created } = await supabase.from('avaliacoes').insert(payload).select().single();
        if (created) {
          dispatch({ type: 'SET_DATA', payload: { evaluations: [created, ...data.evaluations] } });
        }
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  const evalsByTipo = useMemo(() => {
    const map: Record<string, Avaliacao[]> = {};
    for (const e of childEvals) {
      if (!map[e.tipo]) map[e.tipo] = [];
      map[e.tipo].push(e);
    }
    return map;
  }, [childEvals]);

  return (
    <div className="view show" id="v-avaliacoes">
      <div className="page-body">
        <div className="page-hero">
          <div className="ph-pre"><span></span>Avaliações</div>
          <h1 className="ph-title">Avaliações</h1>
          <div className="ph-sub">PEDI, PS, SPM, ABLLS, VBMAPP e outras escalas clínicas</div>
        </div>

        {/* Child selector + action */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={selectedChildId ?? ''}
            onChange={(e) => setSelectedChildId(Number(e.target.value))}
            style={{ padding: '10px 14px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}
          >
            {data.children.length === 0 && <option value="">Nenhum paciente</option>}
            {data.children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {selectedChild && (
            <span style={{ fontSize: 12, color: 'var(--t3)', padding: '4px 10px', background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 20 }}>
              {childEvals.length} avaliação(ões)
            </span>
          )}
          <button className="btn-p" onClick={openNew} style={{ marginLeft: 'auto' }}>+ Nova avaliação</button>
        </div>

        {/* Summary cards per type */}
        {TIPOS.filter((t) => evalsByTipo[t]?.length).length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 24 }}>
            {TIPOS.filter((t) => evalsByTipo[t]?.length).map((tipo) => (
              <div key={tipo} style={{ background: 'var(--ps)', border: '1px solid var(--p)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--p)' }}>{evalsByTipo[tipo].length}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginTop: 2 }}>{tipo}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                  {formatDate(evalsByTipo[tipo][0].data)}
                </div>
              </div>
            ))}
          </div>
        )}

        {childEvals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--t3)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>Nenhuma avaliação registrada</div>
            <div style={{ fontSize: 13, marginBottom: 24 }}>Registre a primeira avaliação clínica deste paciente</div>
            <button className="btn-p" onClick={openNew}>+ Nova avaliação</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {childEvals.map((a) => (
              <div key={a.id} onClick={() => openEdit(a)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'var(--sf)', border: '1px solid var(--bdr)', borderRadius: 12, cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ps)', border: '1px solid var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--p)', textAlign: 'center', flexShrink: 0 }}>
                  {a.tipo}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{TIPO_DESC[a.tipo] ?? a.tipo}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                    {formatDate(a.data)}
                    {a.notas && ` · ${a.notas.slice(0, 60)}${a.notas.length > 60 ? '...' : ''}`}
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--t3)', flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', margin: 0 }}>{selectedAval ? 'Editar avaliação' : 'Nova avaliação'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Instrumento *</label>
                  <select value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value as typeof TIPOS[number] }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit' }}>
                    {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Data *</label>
                  <input type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--sf2)', borderRadius: 10, fontSize: 12, color: 'var(--t3)' }}>
                {TIPO_DESC[form.tipo]}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Observações / Conclusões</label>
                <textarea rows={3} value={form.notas} onChange={(e) => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Síntese dos resultados, recomendações..." style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 5 }}>Escores (JSON)</label>
                <textarea rows={4} value={form.scores} onChange={(e) => setForm(f => ({ ...f, scores: e.target.value }))} placeholder={'{\n  "total": 95,\n  "area_motora": 85\n}'} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 10, background: 'var(--sf)', color: 'var(--t1)', fontSize: 13, fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--bdr)', borderRadius: 10, background: 'none', color: 'var(--t2)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={saving} className="btn-p" style={{ flex: 2 }}>{saving ? 'Salvando...' : selectedAval ? 'Salvar' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
