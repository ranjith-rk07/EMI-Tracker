import { Plan, Instalment, PaymentRecord, UserSettings, StorageMode } from '../types';
import { createDemoFixture } from '../data/demoData';

const STORAGE_KEYS = {
  ACTIVE_MODE: 'duewise_active_mode',
  DEMO_PLANS: 'duewise_demo_plans',
  DEMO_INSTALMENTS: 'duewise_demo_instalments',
  DEMO_RECORDS: 'duewise_demo_records',
  DEMO_SETTINGS: 'duewise_demo_settings',
  
  GUEST_PLANS: 'duewise_guest_plans',
  GUEST_INSTALMENTS: 'duewise_guest_instalments',
  GUEST_RECORDS: 'duewise_guest_records',
  GUEST_SETTINGS: 'duewise_guest_settings',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  reminder_window_days: 3,
  sidebar_collapsed: false,
  remind_later_until: null,
};

export function getStoredMode(): StorageMode {
  try {
    const mode = localStorage.getItem(STORAGE_KEYS.ACTIVE_MODE) as StorageMode | null;
    if (mode === 'demo' || mode === 'guest' || mode === 'account') {
      return mode;
    }
  } catch (e) {
    console.warn('Could not read storage mode', e);
  }
  return 'demo'; // Default to demo mode
}

export function setStoredMode(mode: StorageMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, mode);
  } catch (e) {
    console.warn('Could not set storage mode', e);
  }
}

// ------------------- Demo Data Storage -------------------
export function loadDemoData(): {
  plans: Plan[];
  instalments: Instalment[];
  paymentRecords: PaymentRecord[];
  settings: UserSettings;
} {
  try {
    const plansJson = localStorage.getItem(STORAGE_KEYS.DEMO_PLANS);
    const instsJson = localStorage.getItem(STORAGE_KEYS.DEMO_INSTALMENTS);
    const recsJson = localStorage.getItem(STORAGE_KEYS.DEMO_RECORDS);
    const settsJson = localStorage.getItem(STORAGE_KEYS.DEMO_SETTINGS);

    if (plansJson && instsJson && recsJson) {
      return {
        plans: JSON.parse(plansJson),
        instalments: JSON.parse(instsJson),
        paymentRecords: JSON.parse(recsJson),
        settings: settsJson ? JSON.parse(settsJson) : DEFAULT_SETTINGS,
      };
    }
  } catch (e) {
    console.warn('Error reading demo data from storage, resetting to fresh fixture', e);
  }

  // Fallback to fresh demo fixture
  const fixture = createDemoFixture();
  saveDemoData(fixture.plans, fixture.instalments, fixture.paymentRecords, DEFAULT_SETTINGS);
  return {
    ...fixture,
    settings: DEFAULT_SETTINGS,
  };
}

export function saveDemoData(
  plans: Plan[],
  instalments: Instalment[],
  paymentRecords: PaymentRecord[],
  settings?: UserSettings
): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEMO_PLANS, JSON.stringify(plans));
    localStorage.setItem(STORAGE_KEYS.DEMO_INSTALMENTS, JSON.stringify(instalments));
    localStorage.setItem(STORAGE_KEYS.DEMO_RECORDS, JSON.stringify(paymentRecords));
    if (settings) {
      localStorage.setItem(STORAGE_KEYS.DEMO_SETTINGS, JSON.stringify(settings));
    }
  } catch (e) {
    console.error('Failed to save demo data', e);
  }
}

export function resetDemoDataToFixture(): {
  plans: Plan[];
  instalments: Instalment[];
  paymentRecords: PaymentRecord[];
  settings: UserSettings;
} {
  const fixture = createDemoFixture();
  saveDemoData(fixture.plans, fixture.instalments, fixture.paymentRecords, DEFAULT_SETTINGS);
  return {
    ...fixture,
    settings: DEFAULT_SETTINGS,
  };
}

// ------------------- Guest Data Storage -------------------
export function loadGuestData(): {
  plans: Plan[];
  instalments: Instalment[];
  paymentRecords: PaymentRecord[];
  settings: UserSettings;
} {
  try {
    const plansJson = localStorage.getItem(STORAGE_KEYS.GUEST_PLANS);
    const instsJson = localStorage.getItem(STORAGE_KEYS.GUEST_INSTALMENTS);
    const recsJson = localStorage.getItem(STORAGE_KEYS.GUEST_RECORDS);
    const settsJson = localStorage.getItem(STORAGE_KEYS.GUEST_SETTINGS);

    return {
      plans: plansJson ? JSON.parse(plansJson) : [],
      instalments: instsJson ? JSON.parse(instsJson) : [],
      paymentRecords: recsJson ? JSON.parse(recsJson) : [],
      settings: settsJson ? JSON.parse(settsJson) : DEFAULT_SETTINGS,
    };
  } catch (e) {
    console.warn('Error reading guest data from storage', e);
    return {
      plans: [],
      instalments: [],
      paymentRecords: [],
      settings: DEFAULT_SETTINGS,
    };
  }
}

export function saveGuestData(
  plans: Plan[],
  instalments: Instalment[],
  paymentRecords: PaymentRecord[],
  settings?: UserSettings
): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GUEST_PLANS, JSON.stringify(plans));
    localStorage.setItem(STORAGE_KEYS.GUEST_INSTALMENTS, JSON.stringify(instalments));
    localStorage.setItem(STORAGE_KEYS.GUEST_RECORDS, JSON.stringify(paymentRecords));
    if (settings) {
      localStorage.setItem(STORAGE_KEYS.GUEST_SETTINGS, JSON.stringify(settings));
    }
  } catch (e) {
    console.error('Failed to save guest data', e);
  }
}

export function clearGuestData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GUEST_PLANS);
    localStorage.removeItem(STORAGE_KEYS.GUEST_INSTALMENTS);
    localStorage.removeItem(STORAGE_KEYS.GUEST_RECORDS);
  } catch (e) {
    console.error('Failed to clear guest data', e);
  }
}

