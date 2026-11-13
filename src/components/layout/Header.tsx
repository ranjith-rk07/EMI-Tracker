import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Plus, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav }) => {
  const {
    activeTab,
    storageMode,
    metrics,
    openSearch,
    openNotifications,
    openAddPlan,
  } = useApp();

  const { user } = useAuth();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview';
      case 'plans': return 'Payment plans';
      case 'calendar': return 'Calendar';
      case 'history': return 'Payment history';
      case 'settings': return 'Settings';
      case 'help': return 'Help & support';
      default: return 'Overview';
    }
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 py-4 px-6 md:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 transition-colors">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Workspace</span>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">{getTabTitle()}</span>
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Search Input Trigger */}
        <button
          onClick={openSearch}
          className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-all w-48 md:w-64"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="flex-1 text-left truncate">Search plans or actions</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[0.65rem] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
            Ctrl K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={openSearch}
          className="sm:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Storage / Environment Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>
            {storageMode === 'demo'
              ? 'Example data'
              : storageMode === 'guest'
              ? 'Saved in browser'
              : 'Supabase synced'}
          </span>
        </div>

        {/* Notifications Icon Button */}
        <button
          onClick={openNotifications}
          title="Notifications and attention items"
          className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {metrics.attentionBannerCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[0.62rem] font-bold flex items-center justify-center shadow-xs">
              {metrics.attentionBannerCount}
            </span>
          )}
        </button>

        {/* Add Plan Primary Button */}
        <button
          onClick={() => openAddPlan()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#143D2B] text-white text-xs font-semibold hover:bg-[#1A4F38] active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add plan</span>
        </button>
      </div>
    </header>
  );
};

