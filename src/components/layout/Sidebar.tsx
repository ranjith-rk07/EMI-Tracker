import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  CreditCard,
  Calendar as CalendarIcon,
  History,
  Settings as SettingsIcon,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  Laptop,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Database
} from 'lucide-react';
import { ThemeMode } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    storageMode,
    setStorageMode,
    plans,
    activeTab,
    setActiveTab,
    metrics,
    settings,
    updateSettings,
    restoreExampleData,
  } = useApp();

  const { user, signOut, openAuthModal } = useAuth();
  const collapsed = settings.sidebar_collapsed;

  const toggleCollapse = () => {
    updateSettings({ sidebar_collapsed: !collapsed });
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: metrics.attentionBannerCount > 0 ? metrics.attentionBannerCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'plans',
      label: 'Payment plans',
      icon: CreditCard,
      badge: plans.length > 0 ? plans.length : null,
      badgeColor: 'text-emerald-200/80 font-normal',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarIcon,
      badge: null,
    },
    {
      id: 'history',
      label: 'Payment history',
      icon: History,
      badge: null,
    },
  ];

  const supportItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
    },
    {
      id: 'help',
      label: 'Help & support',
      icon: HelpCircle,
    },
  ];

  const handleStartTracking = () => {
    setStorageMode('guest');
    setActiveTab('plans');
  };

  return (
    <aside
      className={`relative z-20 shrink-0 bg-brand-dark min-h-screen text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-emerald-900/30 ${
        collapsed ? 'w-20 px-3 py-6' : 'w-64 px-4 py-6'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1">
          <BrandLogo collapsed={collapsed} />
          <button
            onClick={toggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Workspace Indicator Card */}
        <div
          onClick={() => {
            if (storageMode === 'demo') {
              handleStartTracking();
            } else if (storageMode === 'guest' && !user) {
              openAuthModal('signup');
            }
          }}
          className={`flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title={
            storageMode === 'demo'
              ? 'Demo workspace (4 sample plans). Click to start your own tracking.'
              : storageMode === 'guest'
              ? 'Guest workspace (saved in this browser). Click to sync to Supabase account.'
              : `Account workspace (${user?.email})`
          }
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-700/80 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
            {storageMode === 'demo' ? 'DW' : storageMode === 'guest' ? 'GW' : 'AC'}
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">
                {storageMode === 'demo'
                  ? 'Demo workspace'
                  : storageMode === 'guest'
                  ? 'Personal workspace'
                  : user?.email?.split('@')[0] || 'Account'}
              </span>
              <span className="text-[0.68rem] text-emerald-200/60 truncate flex items-center gap-1">
                {plans.length} {plans.length === 1 ? 'plan' : 'plans'} ·{' '}
                {storageMode === 'account' ? 'Synced with Supabase' : 'Saved locally'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1">
          <div className={`px-2 py-1 text-[0.68rem] font-bold tracking-wider uppercase text-emerald-200/50 ${collapsed ? 'sr-only' : ''}`}>
            Workspace
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-brand-dark font-semibold shadow-sm'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-dark' : 'text-emerald-200/70'}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge !== null && (
                  <span
                    className={`text-[0.72rem] px-1.5 py-0.2 rounded-full font-medium ${
                      isActive ? 'bg-brand-dark/10 text-brand-dark' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Support Items */}
        <div className="flex flex-col gap-1">
          <div className={`px-2 py-1 text-[0.68rem] font-bold tracking-wider uppercase text-emerald-200/50 ${collapsed ? 'sr-only' : ''}`}>
            Support
          </div>

          {supportItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-brand-dark font-semibold shadow-sm'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-dark' : 'text-emerald-200/70'}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4 mt-6">
        {/* Guest Promo Card (Demo Mode) */}
        {!collapsed && storageMode === 'demo' && (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2.5 backdrop-blur-sm">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">You're exploring example data</span>
              <p className="text-[0.72rem] text-emerald-200/70 leading-relaxed mt-0.5">
                Clear the samples and start tracking your own EMIs and loans.
              </p>
            </div>
            <button
              onClick={handleStartTracking}
              className="w-full py-2 px-3 rounded-xl bg-white text-brand-dark font-semibold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
            >
              Start tracking
            </button>
          </div>
        )}

        {/* Account Status / Log In Button */}
        {!collapsed && (
          <div className="px-1">
            {user ? (
              <div className="flex items-center justify-between text-xs text-emerald-200/70 py-1">
                <span className="truncate max-w-[130px]">{user.email}</span>
                <button
                  onClick={signOut}
                  title="Sign out"
                  className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="w-full flex items-center justify-between text-xs text-emerald-100/80 hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  Sign in / Sync
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            )}
          </div>
        )}

        {/* Theme Switcher Segmented Control */}
        <div className={`p-1 rounded-xl bg-black/20 border border-white/10 flex items-center ${collapsed ? 'flex-col gap-1' : 'justify-between'}`}>
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            title="Light appearance"
            className={`flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium transition-all ${
              settings.theme === 'light'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-emerald-100/70 hover:text-white'
            } ${collapsed ? 'w-full py-1.5' : 'flex-1'}`}
          >
            <Sun className="w-3.5 h-3.5" />
            {!collapsed && <span>Light</span>}
          </button>

          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            title="Dark appearance"
            className={`flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium transition-all ${
              settings.theme === 'dark'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-emerald-100/70 hover:text-white'
            } ${collapsed ? 'w-full py-1.5' : 'flex-1'}`}
          >
            <Moon className="w-3.5 h-3.5" />
            {!collapsed && <span>Dark</span>}
          </button>

          <button
            onClick={() => updateSettings({ theme: 'auto' })}
            title="Match system theme"
            className={`flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium transition-all ${
              settings.theme === 'auto'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-emerald-100/70 hover:text-white'
            } ${collapsed ? 'w-full py-1.5' : 'flex-1'}`}
          >
            <Laptop className="w-3.5 h-3.5" />
            {!collapsed && <span>Auto</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

