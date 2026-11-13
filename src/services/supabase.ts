import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { Plan, Instalment, PaymentRecord, UserSettings } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Auth helper operations
export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env');
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env');
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
}

export async function signInWithPhoneOtp(phone: string) {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env');
  return await supabase.auth.signInWithOtp({
    phone,
  });
}

export async function verifyPhoneOtp(phone: string, token: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  return await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
}

export async function signInWithGoogleOAuth() {
  if (!supabase) throw new Error('Supabase is not configured. Configure Google OAuth in Supabase dashboard.');
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export async function signOutUser() {
  if (!supabase) return;
  return await supabase.auth.signOut();
}

// Database sync operations for Account Mode
export async function fetchAccountData(userId: string): Promise<{
  plans: Plan[];
  instalments: Instalment[];
  paymentRecords: PaymentRecord[];
  settings: UserSettings | null;
}> {
  if (!supabase) throw new Error('Supabase is not configured.');

  // Fetch plans
  const { data: plansData, error: plansErr } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (plansErr) throw plansErr;

  // Fetch instalments
  const { data: instsData, error: instsErr } = await supabase
    .from('instalments')
    .select('*')
    .order('sequence', { ascending: true });

  if (instsErr) throw instsErr;

  // Fetch payment records
  const { data: recsData, error: recsErr } = await supabase
    .from('payment_records')
    .select('*')
    .order('recorded_at', { ascending: false });

  if (recsErr) throw recsErr;

  // Fetch settings
  const { data: settingsData } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return {
    plans: plansData || [],
    instalments: instsData || [],
    paymentRecords: recsData || [],
    settings: settingsData || null,
  };
}

export async function createAccountPlan(
  userId: string,
  plan: Plan,
  instalments: Instalment[],
  initialRecords: PaymentRecord[]
) {
  if (!supabase) throw new Error('Supabase is not configured.');

  // Insert plan
  const { error: planErr } = await supabase.from('plans').insert({
    id: plan.id,
    user_id: userId,
    name: plan.name,
    type: plan.type,
    lender_or_card: plan.lender_or_card,
    monthly_amount_paise: plan.monthly_amount_paise,
    due_day: plan.due_day,
    first_instalment_date: plan.first_instalment_date,
    total_instalments: plan.total_instalments,
  });
  if (planErr) throw planErr;

  // Insert instalments
  const { error: instErr } = await supabase.from('instalments').insert(
    instalments.map(i => ({
      id: i.id,
      plan_id: plan.id,
      sequence: i.sequence,
      due_date: i.due_date,
      scheduled_amount_paise: i.scheduled_amount_paise,
    }))
  );
  if (instErr) throw instErr;

  // Insert initial payment records if any
  if (initialRecords.length > 0) {
    const { error: recErr } = await supabase.from('payment_records').insert(
      initialRecords.map(r => ({
        id: r.id,
        instalment_id: r.instalment_id,
        plan_id: plan.id,
        amount_paise: r.amount_paise,
        payment_date: r.payment_date,
        source: r.source,
      }))
    );
    if (recErr) throw recErr;
  }
}

export async function recordAccountPayment(
  record: PaymentRecord
) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('payment_records').insert({
    id: record.id,
    instalment_id: record.instalment_id,
    plan_id: record.plan_id,
    amount_paise: record.amount_paise,
    payment_date: record.payment_date,
    source: record.source,
    recorded_at: record.recorded_at,
  });
  if (error) throw error;
}

export async function undoAccountPayment(recordId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('payment_records').delete().eq('id', recordId);
  if (error) throw error;
}

export async function deleteAccountPlan(planId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('plans').delete().eq('id', planId);
  if (error) throw error;
}

export async function saveAccountSettings(userId: string, settings: UserSettings) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('user_settings').upsert({
    user_id: userId,
    theme: settings.theme,
    reminder_window_days: settings.reminder_window_days,
    sidebar_collapsed: settings.sidebar_collapsed,
    remind_later_until: settings.remind_later_until,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

