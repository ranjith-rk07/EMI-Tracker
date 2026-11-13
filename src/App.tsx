import React from 'react';
import { AuthProvider } from './context/AuthContext';
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

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

