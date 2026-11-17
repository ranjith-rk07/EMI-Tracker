
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { syncError, clearSyncError } = useApp();

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#1F5A46] dark:bg-[#0B2418] flex text-slate-900 dark:text-slate-100 antialiased p-2 md:p-3 lg:p-4 gap-2 md:gap-3 transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full min-h-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative z-10 w-72 bg-brand-dark h-full shadow-2xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Workspace Container */}
      <main className="flex-1 flex flex-col bg-[#F4F7F5] dark:bg-[#111915] rounded-[24px] md:rounded-[28px] overflow-hidden shadow-2xl border border-white/10 dark:border-white/5 transition-colors min-w-0 min-h-[calc(100vh-16px)] md:min-h-0 md:h-full">
        {/* Header Bar */}
        <Header onToggleMobileNav={() => setMobileNavOpen(prev => !prev)} />

        {/* Sync / Error Notification if any */}
        {syncError && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900 px-6 py-2.5 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200">
            <span>{syncError}</span>
            <button
              onClick={clearSyncError}
              className="font-semibold underline ml-4 hover:text-rose-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page View Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 md:px-8 lg:px-10 py-6 md:py-8 max-w-[1400px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

