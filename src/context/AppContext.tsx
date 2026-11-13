import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Plan,
  Instalment,
  PaymentRecord,
  InstalmentWithStatus,
  UserSettings,
  StorageMode,
  OverviewMetrics,
  PlanType,
} from '../types';
import {
  loadDemoData,
  saveDemoData,
  resetDemoDataToFixture,
  loadGuestData,
  saveGuestData,
  clearGuestData,
  getStoredMode,
  setStoredMode,
  DEFAULT_SETTINGS,
} from '../utils/storage';
import {
  enrichInstalments,
  calculateOverviewMetrics,
  getKolkataDateString,
  generatePlanInstalments,
  inrToPaise,
} from '../utils/calculations';
import { DEMO_REFERENCE_DATE } from '../data/demoData';
import { useAuth } from './AuthContext';
import {
  fetchAccountData,
  createAccountPlan,
  recordAccountPayment,
  undoAccountPayment,
  deleteAccountPlan,
  saveAccountSettings,
} from '../services/supabase';

interface AppContextType {
  storageMode: StorageMode;
  setStorageMode: (mode: StorageMode) => void;
  plans: Plan[];
  instalments: Instalment[];
  paymentRecords: PaymentRecord[];
  enrichedInstalments: InstalmentWithStatus[];
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  
  // Date & Month context
  currentReferenceDate: string; // "2026-11-10" for demo, or today for guest/account
  selectedMonthKey: string; // "YYYY-MM"
  setSelectedMonthKey: (key: string) => void;
  nextMonth: () => void;
  prevMonth: () => void;

  // Derived metrics
  metrics: OverviewMetrics;

  // Active navigation
  activeTab: 'overview' | 'plans' | 'calendar' | 'history' | 'settings' | 'help';
  setActiveTab: (tab: 'overview' | 'plans' | 'calendar' | 'history' | 'settings' | 'help') => void;

  // Plan detail drawer
  selectedPlanId: string | null;
  openPlanDetail: (planId: string) => void;
  closePlanDetail: () => void;

  // Modals & Panels
  isAddPlanOpen: boolean;
  openAddPlan: (initialData?: Partial<Plan>) => void;
  closeAddPlan: () => void;
  initialAddPlanData?: Partial<Plan>;

  isMarkPaidOpen: boolean;
  activeInstalmentForPayment: InstalmentWithStatus | null;
  openMarkPaid: (inst: InstalmentWithStatus) => void;
  closeMarkPaid: () => void;

  isUndoPaidOpen: boolean;
  activeInstalmentForUndo: InstalmentWithStatus | null;
  openUndoPaid: (inst: InstalmentWithStatus) => void;
  closeUndoPaid: () => void;

  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  isNotificationsOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;

  // CRUD actions
  createPlan: (
    name: string,
    type: PlanType,
    lenderOrCard: string,
    monthlyAmountPaise: number,
    dueDay: number,
    firstDueDateStr: string,
    totalInstalments: number,
    alreadyPaidCount: number
  ) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  markInstalmentPaid: (instalmentId: string, paymentDate: string) => Promise<void>;
  undoInstalmentPayment: (recordId: string) => Promise<void>;
  snoozeAttentionBanner: () => Promise<void>;

  // Data management
  restoreExampleData: () => void;
  clearPlans: () => void;

  // Error & Sync states
  syncError: string | null;
  clearSyncError: () => void;
  isSaving: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode; workspaceActive?: boolean }> = ({ children, workspaceActive = true }) => {
  const { user } = useAuth();
  const [storageMode, setStorageModeState] = useState<StorageMode>(() => {
    return user ? 'account' : workspaceActive ? getStoredMode() : 'guest';
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [instalments, setInstalments] = useState<Instalment[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-11');
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'calendar' | 'history' | 'settings' | 'help'>('overview');
  
  // Modals
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState<boolean>(false);
  const [initialAddPlanData, setInitialAddPlanData] = useState<Partial<Plan> | undefined>(undefined);
  
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState<boolean>(false);
  const [activeInstalmentForPayment, setActiveInstalmentForPayment] = useState<InstalmentWithStatus | null>(null);

  const [isUndoPaidOpen, setIsUndoPaidOpen] = useState<boolean>(false);
  const [activeInstalmentForUndo, setActiveInstalmentForUndo] = useState<InstalmentWithStatus | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync mode with user login
  useEffect(() => {
    if (user) {
      setStorageModeState('account');
      setStoredMode('account');
    } else if (storageMode === 'account') {
      setStorageModeState('guest');
      setStoredMode('guest');
    }
  }, [user]);

  // Load data according to active mode
  const reloadData = useCallback(async () => {
    if (storageMode === 'demo') {
      const demo = loadDemoData();
      setPlans(demo.plans);
      setInstalments(demo.instalments);
      setPaymentRecords(demo.paymentRecords);
      setSettings(demo.settings || DEFAULT_SETTINGS);
      setSelectedMonthKey('2026-11');
    } else if (storageMode === 'guest') {
      const guest = loadGuestData();
      setPlans(guest.plans);
      setInstalments(guest.instalments);
      setPaymentRecords(guest.paymentRecords);
      setSettings(guest.settings || DEFAULT_SETTINGS);
      const today = getKolkataDateString();
      setSelectedMonthKey(today.substring(0, 7));
    } else if (storageMode === 'account' && user) {
      try {
        setIsSaving(true);
        const accData = await fetchAccountData(user.id);
        setPlans(accData.plans);
        setInstalments(accData.instalments);
        setPaymentRecords(accData.paymentRecords);
        if (accData.settings) {
          setSettings(accData.settings);
        }
        const today = getKolkataDateString();
        setSelectedMonthKey(today.substring(0, 7));
      } catch (err: any) {
        console.error('Failed to load account data from Supabase:', err);
        setSyncError(err?.message || 'Failed to sync with Supabase');
      } finally {
        setIsSaving(false);
      }
    }
  }, [storageMode, user]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const setStorageMode = (newMode: StorageMode) => {
    setStorageModeState(newMode);
    setStoredMode(newMode);
  };

  // Reference date: DEMO_REFERENCE_DATE (2026-11-10) for demo mode; today's date for guest/account
  const currentReferenceDate = useMemo(() => {
    return storageMode === 'demo' ? DEMO_REFERENCE_DATE : getKolkataDateString();
  }, [storageMode]);

  // Enriched instalments and dynamic statuses
  const enrichedInstalments = useMemo(() => {
    return enrichInstalments(
      plans,
      instalments,
      paymentRecords,
      currentReferenceDate,
      settings.reminder_window_days
    );
  }, [plans, instalments, paymentRecords, currentReferenceDate, settings.reminder_window_days]);

  // Overview metrics
  const metrics = useMemo(() => {
    return calculateOverviewMetrics(
      plans,
      enrichedInstalments,
      selectedMonthKey,
      currentReferenceDate,
      settings.remind_later_until
    );
  }, [plans, enrichedInstalments, selectedMonthKey, currentReferenceDate, settings.remind_later_until]);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Keyboard navigation
  useEffect(() => {
    if (!workspaceActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in input/textarea/select
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT' ||
        activeEl?.getAttribute('contenteditable') === 'true';

      // Ctrl+K / Cmd+K search shortcut (works everywhere)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
        return;
      }

      // Close modal/dialog on Escape
      if (e.key === 'Escape') {
        if (isSearchOpen) { setIsSearchOpen(false); return; }
        if (isNotificationsOpen) { setIsNotificationsOpen(false); return; }
        if (isMarkPaidOpen) { setIsMarkPaidOpen(false); return; }
        if (isUndoPaidOpen) { setIsUndoPaidOpen(false); return; }
        if (isAddPlanOpen) { setIsAddPlanOpen(false); return; }
        if (selectedPlanId) { setSelectedPlanId(null); return; }
      }

      if (isInput) return;

      // N: Add plan
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setInitialAddPlanData(undefined);
        setIsAddPlanOpen(true);
      }

      // [ : Previous month
      if (e.key === '[') {
        e.preventDefault();
        prevMonth();
      }

      // ] : Next month
      if (e.key === ']') {
        e.preventDefault();
        nextMonth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspaceActive, isSearchOpen, isNotificationsOpen, isMarkPaidOpen, isUndoPaidOpen, isAddPlanOpen, selectedPlanId]);

  const nextMonth = () => {
    const [y, m] = selectedMonthKey.split('-').map(Number);
    const date = new Date(Date.UTC(y, m, 1));
    const nextKey = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedMonthKey(nextKey);
  };

  const prevMonth = () => {
    const [y, m] = selectedMonthKey.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 2, 1));
    const prevKey = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedMonthKey(prevKey);
  };

  // CRUD actions
  const createPlan = async (
    name: string,
    type: PlanType,
    lenderOrCard: string,
    monthlyAmountPaise: number,
    dueDay: number,
    firstDueDateStr: string,
    totalInstalments: number,
    alreadyPaidCount: number
  ) => {
    setIsSaving(true);
    setSyncError(null);
    try {
      const planId = `plan-${Date.now()}`;
      const newPlan: Plan = {
        id: planId,
        user_id: user?.id,
        name: name.trim(),
        type,
        lender_or_card: lenderOrCard.trim() || undefined,
        monthly_amount_paise: monthlyAmountPaise,
        due_day: dueDay,
        first_instalment_date: firstDueDateStr,
        total_instalments: totalInstalments,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const generatedInstalments = generatePlanInstalments(
        planId,
        dueDay,
        firstDueDateStr,
        totalInstalments,
        monthlyAmountPaise
      );

      const initialRecords: PaymentRecord[] = [];
      const safeAlreadyPaid = Math.min(alreadyPaidCount, totalInstalments);
      for (let i = 0; i < safeAlreadyPaid; i++) {
        initialRecords.push({
          id: `rec-${planId}-${i + 1}`,
          instalment_id: generatedInstalments[i].id,
          plan_id: planId,
          amount_paise: monthlyAmountPaise,
          payment_date: null, // "Payment date not provided" for historical declaration
          recorded_at: new Date().toISOString(),
          source: 'historical_declaration',
        });
      }

      if (storageMode === 'account' && user) {
        await createAccountPlan(user.id, newPlan, generatedInstalments, initialRecords);
      }

      const updatedPlans = [...plans, newPlan];
      const updatedInsts = [...instalments, ...generatedInstalments];
      const updatedRecs = [...paymentRecords, ...initialRecords];

      setPlans(updatedPlans);
      setInstalments(updatedInsts);
      setPaymentRecords(updatedRecs);

      if (storageMode === 'demo') {
        saveDemoData(updatedPlans, updatedInsts, updatedRecs, settings);
      } else if (storageMode === 'guest') {
        saveGuestData(updatedPlans, updatedInsts, updatedRecs, settings);
      }

      setIsAddPlanOpen(false);
    } catch (err: any) {
      console.error('Failed to create plan:', err);
      setSyncError(err?.message || 'Failed to create plan');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const deletePlan = async (planId: string) => {
    setIsSaving(true);
    setSyncError(null);
    try {
      if (storageMode === 'account' && user) {
        await deleteAccountPlan(planId);
      }

      const updatedPlans = plans.filter(p => p.id !== planId);
      const updatedInsts = instalments.filter(i => i.plan_id !== planId);
      const updatedRecs = paymentRecords.filter(r => r.plan_id !== planId);

      setPlans(updatedPlans);
      setInstalments(updatedInsts);
      setPaymentRecords(updatedRecs);

      if (storageMode === 'demo') {
        saveDemoData(updatedPlans, updatedInsts, updatedRecs, settings);
      } else if (storageMode === 'guest') {
        saveGuestData(updatedPlans, updatedInsts, updatedRecs, settings);
      }

      if (selectedPlanId === planId) {
        setSelectedPlanId(null);
      }
    } catch (err: any) {
      console.error('Failed to delete plan:', err);
      setSyncError(err?.message || 'Failed to delete plan');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const markInstalmentPaid = async (instalmentId: string, paymentDate: string) => {
    setIsSaving(true);
    setSyncError(null);
    try {
      const inst = instalments.find(i => i.id === instalmentId);
      if (!inst) throw new Error('Instalment not found');

      // Check if already paid to prevent duplicates
      const existing = paymentRecords.find(r => r.instalment_id === instalmentId);
      if (existing) {
        setIsMarkPaidOpen(false);
        return;
      }

      const newRecord: PaymentRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        instalment_id: instalmentId,
        plan_id: inst.plan_id,
        amount_paise: inst.scheduled_amount_paise,
        payment_date: paymentDate,
        recorded_at: new Date().toISOString(),
        source: 'manual',
      };

      if (storageMode === 'account' && user) {
        await recordAccountPayment(newRecord);
      }

      const updatedRecs = [newRecord, ...paymentRecords];
      setPaymentRecords(updatedRecs);

      if (storageMode === 'demo') {
        saveDemoData(plans, instalments, updatedRecs, settings);
      } else if (storageMode === 'guest') {
        saveGuestData(plans, instalments, updatedRecs, settings);
      }

      setIsMarkPaidOpen(false);
    } catch (err: any) {
      console.error('Failed to record payment:', err);
      setSyncError(err?.message || 'Failed to record payment');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const undoInstalmentPayment = async (recordId: string) => {
    setIsSaving(true);
    setSyncError(null);
    try {
      if (storageMode === 'account' && user) {
        await undoAccountPayment(recordId);
      }

      const updatedRecs = paymentRecords.filter(r => r.id !== recordId);
      setPaymentRecords(updatedRecs);

      if (storageMode === 'demo') {
        saveDemoData(plans, instalments, updatedRecs, settings);
      } else if (storageMode === 'guest') {
        saveGuestData(plans, instalments, updatedRecs, settings);
      }

      setIsUndoPaidOpen(false);
    } catch (err: any) {
      console.error('Failed to undo payment:', err);
      setSyncError(err?.message || 'Failed to undo payment');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const snoozeAttentionBanner = async () => {
    // Hide banner until following app-calendar day
    const [y, m, d] = currentReferenceDate.split('-').map(Number);
    const tomorrow = new Date(Date.UTC(y, m - 1, d + 1));
    const tomorrowStr = `${tomorrow.getUTCFullYear()}-${(tomorrow.getUTCMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getUTCDate().toString().padStart(2, '0')}`;
    
    await updateSettings({ remind_later_until: tomorrowStr });
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);

    if (storageMode === 'account' && user) {
      try {
        await saveAccountSettings(user.id, merged);
      } catch (e) {
        console.warn('Failed to save settings to account', e);
      }
    } else if (storageMode === 'demo') {
      saveDemoData(plans, instalments, paymentRecords, merged);
    } else if (storageMode === 'guest') {
      saveGuestData(plans, instalments, paymentRecords, merged);
    }
  };

  const restoreExampleData = () => {
    const demo = resetDemoDataToFixture();
    setPlans(demo.plans);
    setInstalments(demo.instalments);
    setPaymentRecords(demo.paymentRecords);
    setSettings(demo.settings);
    setSelectedMonthKey('2026-11');
  };

  const clearPlans = () => {
    if (storageMode === 'demo') {
      setPlans([]);
      setInstalments([]);
      setPaymentRecords([]);
      saveDemoData([], [], [], settings);
    } else if (storageMode === 'guest') {
      clearGuestData();
      setPlans([]);
      setInstalments([]);
      setPaymentRecords([]);
    }
  };

  const openPlanDetail = (planId: string) => setSelectedPlanId(planId);
  const closePlanDetail = () => setSelectedPlanId(null);

  const openAddPlan = (initialData?: Partial<Plan>) => {
    setInitialAddPlanData(initialData);
    setIsAddPlanOpen(true);
  };
  const closeAddPlan = () => {
    setIsAddPlanOpen(false);
    setInitialAddPlanData(undefined);
  };

  const openMarkPaid = (inst: InstalmentWithStatus) => {
    setActiveInstalmentForPayment(inst);
    setIsMarkPaidOpen(true);
  };
  const closeMarkPaid = () => {
    setIsMarkPaidOpen(false);
    setActiveInstalmentForPayment(null);
  };

  const openUndoPaid = (inst: InstalmentWithStatus) => {
    setActiveInstalmentForUndo(inst);
    setIsUndoPaidOpen(true);
  };
  const closeUndoPaid = () => {
    setIsUndoPaidOpen(false);
    setActiveInstalmentForUndo(null);
  };

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  const openNotifications = () => setIsNotificationsOpen(true);
  const closeNotifications = () => setIsNotificationsOpen(false);

  return (
    <AppContext.Provider
      value={{
        storageMode,
        setStorageMode,
        plans,
        instalments,
        paymentRecords,
        enrichedInstalments,
        settings,
        updateSettings,
        currentReferenceDate,
        selectedMonthKey,
        setSelectedMonthKey,
        nextMonth,
        prevMonth,
        metrics,
        activeTab,
        setActiveTab,
        selectedPlanId,
        openPlanDetail,
        closePlanDetail,
        isAddPlanOpen,
        openAddPlan,
        closeAddPlan,
        initialAddPlanData,
        isMarkPaidOpen,
        activeInstalmentForPayment,
        openMarkPaid,
        closeMarkPaid,
        isUndoPaidOpen,
        activeInstalmentForUndo,
        openUndoPaid,
        closeUndoPaid,
        isSearchOpen,
        openSearch,
        closeSearch,
        isNotificationsOpen,
        openNotifications,
        closeNotifications,
        createPlan,
        deletePlan,
        markInstalmentPaid,
        undoInstalmentPayment,
        snoozeAttentionBanner,
        restoreExampleData,
        clearPlans,
        syncError,
        clearSyncError: () => setSyncError(null),
        isSaving,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};

