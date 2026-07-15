'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppProvider, useApp } from '@/contexts/AppContext';
import Sidebar from '@/components/dashboard/Sidebar';
import type { Screen } from '@/lib/types';

// Lazy screens — each screen is a component
import DashboardHome from '@/components/dashboard/screens/DashboardHome';
import PacientesScreen from '@/components/dashboard/screens/PacientesScreen';
import AgendaScreen from '@/components/dashboard/screens/AgendaScreen';
import FinanceiroScreen from '@/components/dashboard/screens/FinanceiroScreen';
import BiScreen from '@/components/dashboard/screens/BiScreen';
import EquipeScreen from '@/components/dashboard/screens/EquipeScreen';
import ReavixScreen from '@/components/dashboard/screens/ReavixScreen';
import PortalScreen from '@/components/dashboard/screens/PortalScreen';
import ContaScreen from '@/components/dashboard/screens/ContaScreen';
import PeiScreen from '@/components/dashboard/screens/PeiScreen';
import AvaliacoesScreen from '@/components/dashboard/screens/AvaliacoesScreen';

function AppShell() {
  const { state } = useApp();
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (state.initialized && !state.user) {
      router.replace('/login');
    }
  }, [state.initialized, state.user, router]);

  if (!state.initialized || state.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div className="spin-anim" style={{ width: 36, height: 36, border: '3px solid var(--bdr)', borderTopColor: 'var(--p)', borderRadius: '50%' }} />
        <div style={{ color: 'var(--t3)', fontSize: 14 }}>Carregando...</div>
      </div>
    );
  }

  if (!state.user) return null;

  const SCREENS: Record<Screen, React.ReactNode> = {
    dashboard: <DashboardHome onNav={setScreen} />,
    pacientes: <PacientesScreen />,
    pei: <PeiScreen />,
    avaliacoes: <AvaliacoesScreen />,
    agenda: <AgendaScreen />,
    financeiro: <FinanceiroScreen />,
    bi: <BiScreen />,
    equipe: <EquipeScreen />,
    reavix: <ReavixScreen />,
    portal: <PortalScreen />,
    conta: <ContaScreen />,
  };

  return (
    <div className="app-layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sb-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200 }}
        />
      )}

      {/* Sidebar */}
      <Sidebar active={screen} onNav={(s) => { setScreen(s); setSidebarOpen(false); }} />

      {/* Main content */}
      <main className="main-area">
        {/* Mobile top bar */}
        <div className="mob-topbar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--t1)', cursor: 'pointer', padding: 8 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div style={{ fontWeight: 700, fontSize: 15 }}>T.O Plataforma</div>
          <div style={{ width: 36 }} />
        </div>

        {/* Screen content */}
        <div className="screen-content">
          {SCREENS[screen]}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
