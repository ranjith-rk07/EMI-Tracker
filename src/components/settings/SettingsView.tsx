import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeMode, ReminderDays } from '../../types';
import {
  Sun,
  Moon,
  Laptop,
  Bell,
  Database,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    storageMode,
    restoreExampleData,
    clearPlans,
  } = useApp();

  const { user } = useAuth();

  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSetTheme = (theme: ThemeMode) => {
    updateSettings({ theme });
  };

  const handleSetReminderDays = (days: ReminderDays) => {
    updateSettings({ reminder_window_days: days });
  };

  const handleRestore = () => {
    if (!confirmRestore) {
      setConfirmRestore(true);
      return;
    }
    restoreExampleData();
    setConfirmRestore(false);
    setSuccessMessage('Sample demo plans restored successfully.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearPlans();
    setConfirmClear(false);
    setSuccessMessage('All plans in this workspace cleared.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const reminderOptions: ReminderDays[] = [1, 3, 5, 7];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <span className="text-[0.68rem] font-bold tracking-widest uppercase text-emerald-800 dark:text-emerald-400">
          SETTINGS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
          Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Personalise how Duewise looks and when it nudges you.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Appearance Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 sm:p-6 transition-colors">
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Appearance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose a theme, or follow your device's setting automatically.
            </p>
          </div>
        </div>

        {/* 3 Visual Theme Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Theme */}
          <button
            onClick={() => handleSetTheme('light')}
            className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
              settings.theme === 'light'
                ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {/* Visual Mini Mockup */}
            <div className="w-full h-20 rounded-xl bg-[#F4F7F5] border border-slate-200 p-2 flex gap-1.5 overflow-hidden">
              <div className="w-4 h-full rounded-md bg-[#143D2B]" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="w-full h-3 rounded bg-white" />
                <div className="w-full flex-1 rounded bg-[#184E38]" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" /> Light
              </span>
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                settings.theme === 'light' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
              }`}>
                {settings.theme === 'light' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
          </button>

          {/* Dark Theme */}
          <button
            onClick={() => handleSetTheme('dark')}
            className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
              settings.theme === 'dark'
                ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {/* Visual Mini Mockup */}
            <div className="w-full h-20 rounded-xl bg-[#111915] border border-slate-800 p-2 flex gap-1.5 overflow-hidden">
              <div className="w-4 h-full rounded-md bg-[#0B2418]" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="w-full h-3 rounded bg-slate-800" />
                <div className="w-full flex-1 rounded bg-[#164831]" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" /> Dark
              </span>
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                settings.theme === 'dark' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
              }`}>
                {settings.theme === 'dark' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
          </button>

          {/* Auto Match System */}
          <button
            onClick={() => handleSetTheme('auto')}
            className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
              settings.theme === 'auto'
                ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {/* Split Visual Mini Mockup */}
            <div className="w-full h-20 rounded-xl bg-gradient-to-r from-[#F4F7F5] to-[#111915] border border-slate-300 p-2 flex gap-1.5 overflow-hidden">
              <div className="w-4 h-full rounded-md bg-[#143D2B]" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="w-full h-3 rounded bg-white/70" />
                <div className="w-full flex-1 rounded bg-[#184E38]" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" /> Match system
              </span>
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                settings.theme === 'auto' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
              }`}>
                {settings.theme === 'auto' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Reminders Window Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 sm:p-6 transition-colors">
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Reminders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              Unrecorded payments due within this window are flagged as "Due soon" across the app and in your notifications.
            </p>
          </div>
        </div>

        {/* Reminder Days Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {reminderOptions.map((days) => (
            <button
              key={days}
              onClick={() => handleSetReminderDays(days)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                settings.reminder_window_days === days
                  ? 'bg-[#184E38] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {days} {days === 1 ? 'day' : 'days'} before
            </button>
          ))}
        </div>

        <p className="text-[0.68rem] text-slate-400 mt-3">
          Payments past their due date without a record are always marked "Needs check".
        </p>
      </div>

      {/* 3. Your Data Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 sm:p-6 transition-colors">
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Your data
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {storageMode === 'demo'
                ? 'You are exploring example data. Plans and records are stored in this browser.'
                : storageMode === 'guest'
                ? 'Plans and records are saved in this browser. Nothing is sent anywhere.'
                : `Connected to Supabase account (${user?.email}). Data syncs across your devices.`}
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Restore example data */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Restore example data
              </span>
              <span className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Replace your current plans with the four standard sample plans (Phone, Loan, Laptop, Bike).
              </span>
            </div>

            <button
              onClick={handleRestore}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto transition-all ${
                confirmRestore
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{confirmRestore ? 'Confirm restore?' : 'Restore'}</span>
            </button>
          </div>

          {/* Clear all plans */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Clear all plans
              </span>
              <span className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Remove every plan and payment record in this workspace.
              </span>
            </div>

            <button
              onClick={handleClear}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto transition-all ${
                confirmClear
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmClear ? 'Confirm clear all?' : 'Clear'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

