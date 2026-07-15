const FEATURES = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    iconBg: 'rgba(37,99,235,.14)', iconColor: '#60A5FA',
    title: 'Avaliações validadas',
    text: 'PEDI, Perfil Sensorial e SPM com entrada de scores, histórico completo e comparação entre avaliações ao longo do tempo.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    iconBg: 'rgba(124,58,237,.14)', iconColor: '#A78BFA',
    title: 'BI de evolução em tempo real',
    text: 'Dashboard com radar PEDI, gráficos de tendência, progresso por área e alertas automáticos de regressão ou avanço.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    iconBg: 'rgba(5,150,105,.14)', iconColor: '#34D399',
    title: 'Chat 24/7 família→clínica',
    text: 'Comunicação direta e segura entre família e equipe terapêutica, com histórico organizado e respostas rápidas.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    iconBg: 'rgba(220,38,38,.14)', iconColor: '#F87171',
    title: 'Central de crises integrada',
    text: 'Protocolo de 3 graus de severidade com registro estruturado, notificação imediata e orientações de emergência.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    iconBg: 'rgba(217,119,6,.14)', iconColor: '#FBBF24',
    title: 'Agenda inteligente',
    text: 'Visualização semanal e diária, confirmação de presença familiar, registro de status de sessão e lembretes automáticos.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    iconBg: 'rgba(14,165,233,.14)', iconColor: '#38BDF8',
    title: 'Financeiro completo',
    text: 'Contratos por paciente, cobrança mensal automática, controle particular/convênio e relatórios de recebimento.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
    iconBg: 'rgba(236,72,153,.14)', iconColor: '#F472B6',
    title: 'PEI com banco de atividades',
    text: 'Plano de Ensino Individualizado com mais de 120 atividades ABA categorizadas, critérios de domínio e histórico de progresso.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    iconBg: 'rgba(124,58,237,.14)', iconColor: '#C084FC',
    title: 'Reavix — IA para terapeutas',
    text: 'Assistente de IA especializado em ABA e TEA para orientação clínica, sugestão de estratégias e análise de progresso.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    iconBg: 'rgba(5,150,105,.14)', iconColor: '#4ADE80',
    title: 'Gestão de equipe',
    text: 'Perfis de acesso por função, administrador, terapeuta e secretaria. Visibilidade controlada por clínica.',
  },
];

export default function LandingFeatures() {
  return (
    <section className="lp-sec" id="lp-features">
      <div className="lp-sec-in">
        <div className="lp-sec-chip">Recursos</div>
        <h2 className="lp-sec-h">Tudo que você precisa em<br />uma só plataforma</h2>
        <p className="lp-sec-sub">
          Do acompanhamento familiar ao BI clínico avançado. Desenvolvido com especialistas em TEA e Terapia Ocupacional.
        </p>

        <div className="lp-feat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-fc">
              <div className="lp-fc-ico" style={{ background: f.iconBg, color: f.iconColor }}>
                {f.icon}
              </div>
              <div className="lp-fc-h">{f.title}</div>
              <p className="lp-fc-p">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
