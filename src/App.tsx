import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { OverviewView } from './components/overview/OverviewView';
import { PlansView } from './components/plans/PlansView';
import { CalendarView } from './components/calendar/CalendarView';
import { PaymentHistoryView } from './components/history/PaymentHistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { HelpSupportView } from './components/help/HelpSupportView';

import { PlanDetailDrawer } from './components/plans/PlanDetailDrawer';
import { AddEditPlanModal } from './components/plans/AddEditPlanModal';
import { MarkPaidModal } from './components/payment/MarkPaidModal';
import { UndoPaidModal } from './components/payment/UndoPaidModal';
import { SearchModal } from './components/search/SearchModal';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const { authError } = useAuth();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'plans':
        return <PlansView />;
      case 'calendar':
        return <CalendarView />;
      case 'history':
        return <PaymentHistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpSupportView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <Layout>
      {authError && <div role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{authError}</div>}
      {renderActiveView()}

      {/* Global Modals & Drawers */}
      <PlanDetailDrawer />
      <AddEditPlanModal />
      <MarkPaidModal />
      <UndoPaidModal />
      <SearchModal />
      <NotificationsDrawer />
      <AuthModal />
    </Layout>
  );
};

const AppEntry: React.FC = () => {
  const { user, loading, guestAccessGranted } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F4F7F5] dark:bg-[#111915]">
        <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Checking your session…</p>
      </main>
    );
  }

  if (!user && !guestAccessGranted) {
    return (
      <AppProvider key="entry" workspaceActive={false}>
        <AuthModal presentation="page" />
      </AppProvider>
    );
  }

  // Remount workspace state when identity changes; never carry account data into guest mode.
  return (
    <AppProvider key={user ? `account-${user.id}` : 'guest'}>
      <AppContent />
    </AppProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppEntry />
    </AuthProvider>
  );
}

