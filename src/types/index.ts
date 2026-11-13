export type PlanType = 'emi' | 'loan';

export type PaymentStatus = 'paid' | 'needs_check' | 'due_today' | 'due_soon' | 'upcoming';

export type StorageMode = 'demo' | 'guest' | 'account';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type ReminderDays = 1 | 3 | 5 | 7;

export interface Plan {
  id: string;
  user_id?: string;
  name: string;
  type: PlanType;
  lender_or_card?: string;
  monthly_amount_paise: number; // integer paise (e.g. 400000 for ₹4,000)
  due_day: number; // 1 - 31 (original preserved due day)
  first_instalment_date: string; // YYYY-MM-DD
  total_instalments: number;
  created_at: string;
  updated_at: string;
}

export interface Instalment {
  id: string;
  plan_id: string;
  sequence: number; // 1 to total_instalments
  due_date: string; // YYYY-MM-DD
  scheduled_amount_paise: number;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  instalment_id: string;
  plan_id: string;
  amount_paise: number;
  payment_date: string | null; // YYYY-MM-DD or null if unknown historical payment date
  recorded_at: string; // ISO string
  source: 'manual' | 'historical_declaration';
}

export interface InstalmentWithStatus extends Instalment {
  status: PaymentStatus;
  paymentRecord?: PaymentRecord;
  planName: string;
  planType: PlanType;
  lenderOrCard?: string;
  totalInstalments: number;
  monthlyAmountPaise: number;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  theme: ThemeMode;
  reminder_window_days: ReminderDays;
  sidebar_collapsed: boolean;
  remind_later_until: string | null; // YYYY-MM-DD (hides attention banner until after this calendar day)
  created_at?: string;
  updated_at?: string;
}

export interface OverviewMetrics {
  monthScheduledPaise: number;
  monthRecordedPaidPaise: number;
  monthUnrecordedPaise: number;
  monthPaymentCount: number;
  monthPaidCount: number;
  monthNeedsCheckCount: number;
  monthUpcomingCount: number;
  
  totalRecordedPaise: number;
  totalRemainingScheduledPaise: number;
  totalRecordedInstalments: number;
  totalInstalments: number;
  totalProgressPercent: number;
  
  peakMonthlyCommitmentPaise: number;
  latestFinalPaymentDate: string | null; // e.g. "2028-02-24"
  
  nextPaymentInstalment: InstalmentWithStatus | null;
  attentionBannerInstalment: InstalmentWithStatus | null; // earliest past-due unrecorded instalment
  attentionBannerCount: number;
}

export interface MonthCommitmentPoint {
  monthKey: string; // "YYYY-MM"
  label: string; // e.g. "Nov '26"
  year: number;
  month: number;
  totalScheduledPaise: number;
  isPastOrCurrent: boolean;
  isCurrentMonth: boolean;
  byPlan: {
    planId: string;
    planName: string;
    amountPaise: number;
  }[];
}

export interface ParsedNoteResult {
  name?: string;
  type?: PlanType;
  lender_or_card?: string;
  monthly_amount_inr?: number;
  due_day?: number;
  first_instalment_month?: number; // 1 - 12
  first_instalment_year?: number;
  total_instalments?: number;
  already_paid?: number;
  notes?: string;
  rawText?: string;
}

