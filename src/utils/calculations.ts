import {
  Plan,
  Instalment,
  PaymentRecord,
  InstalmentWithStatus,
  PaymentStatus,
  OverviewMetrics,
  MonthCommitmentPoint,
  ReminderDays
} from '../types';

/**
 * Format paise into Indian Rupee representation (e.g. ₹2,15,250).
 * Handles Indian grouping (thousands, then lakhs, crores).
 */
export function formatINR(paise: number, options?: { showPaise?: boolean; compact?: boolean }): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const remainingPaise = absPaise % 100;

  if (options?.compact && rupees >= 1000) {
    if (rupees >= 10000000) {
      return `${isNegative ? '-' : ''}₹${(rupees / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
    }
    if (rupees >= 100000) {
      return `${isNegative ? '-' : ''}₹${(rupees / 100000).toFixed(1).replace(/\.0$/, '')}L`;
    }
    if (rupees >= 1000) {
      return `${isNegative ? '-' : ''}₹${(rupees / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
  }

  // Format integer rupees with Indian number format (12,34,567)
  const rupeeStr = rupees.toString();
  let formattedRupees = '';
  
  if (rupeeStr.length <= 3) {
    formattedRupees = rupeeStr;
  } else {
    const lastThree = rupeeStr.substring(rupeeStr.length - 3);
    const otherNumbers = rupeeStr.substring(0, rupeeStr.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedRupees = `${withCommas},${lastThree}`;
  }

  const sign = isNegative ? '-' : '';
  if (options?.showPaise && remainingPaise > 0) {
    return `${sign}₹${formattedRupees}.${remainingPaise.toString().padStart(2, '0')}`;
  }
  return `${sign}₹${formattedRupees}`;
}

/**
 * Convert INR number/string to paise integer.
 */
export function inrToPaise(rupees: number | string): number {
  if (typeof rupees === 'string') {
    const cleaned = rupees.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned) || 0;
    return Math.round(num * 100);
  }
  return Math.round(rupees * 100);
}

/**
 * Convert paise integer to INR number.
 */
export function paiseToInr(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Get current calendar date string in YYYY-MM-DD in Asia/Kolkata timezone.
 */
export function getKolkataDateString(date: Date = new Date()): string {
  // Use Intl.DateTimeFormat with Asia/Kolkata
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // Output format in en-CA is "YYYY-MM-DD"
}

/**
 * Get days in month for a given year and month (1-based, 1 = Jan, 12 = Dec).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Format a calendar date (YYYY-MM-DD) into readable formats:
 * e.g. "5 Aug 2026", "Sun, 15 Nov", "15 Nov 2026", "August 2026"
 */
export function formatDate(
  dateStr: string,
  style: 'full' | 'short' | 'weekday-short' | 'month-year' | 'day-month' = 'short'
): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

  switch (style) {
    case 'month-year':
      return date.toLocaleDateString('en-IN', { timeZone: 'UTC', month: 'short', year: 'numeric' });
    case 'day-month':
      return date.toLocaleDateString('en-IN', { timeZone: 'UTC', day: 'numeric', month: 'short' });
    case 'weekday-short':
      return date.toLocaleDateString('en-IN', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });
    case 'full':
      return date.toLocaleDateString('en-IN', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    case 'short':
    default:
      return date.toLocaleDateString('en-IN', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
  }
}

/**
 * Calculate the difference in calendar days between two YYYY-MM-DD dates: (dateA - dateB)
 */
export function diffCalendarDays(dateAStr: string, dateBStr: string): number {
  const [y1, m1, d1] = dateAStr.split('-').map(Number);
  const [y2, m2, d2] = dateBStr.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc1 - utc2) / msPerDay);
}

/**
 * Generate full sequence of instalments for a plan preserving original due_day.
 * A 31st-day plan uses the last valid day in shorter months and returns to 31st when available!
 */
export function generatePlanInstalments(
  planId: string,
  dueDay: number,
  firstInstalmentDateStr: string,
  totalInstalments: number,
  monthlyAmountPaise: number
): Instalment[] {
  const instalments: Instalment[] = [];
  const [firstYear, firstMonth] = firstInstalmentDateStr.split('-').map(Number);

  for (let seq = 1; seq <= totalInstalments; seq++) {
    const monthOffset = seq - 1;
    const targetMonthIndex = (firstMonth - 1) + monthOffset;
    const year = firstYear + Math.floor(targetMonthIndex / 12);
    const month = (targetMonthIndex % 12) + 1;

    const maxDays = getDaysInMonth(year, month);
    const day = Math.min(dueDay, maxDays);

    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    instalments.push({
      id: `inst-${planId}-${seq}`,
      plan_id: planId,
      sequence: seq,
      due_date: dateStr,
      scheduled_amount_paise: monthlyAmountPaise,
      created_at: new Date().toISOString(),
    });
  }

  return instalments;
}

/**
 * Determine payment status for an instalment given the current reference date and reminder window.
 */
export function computeInstalmentStatus(
  dueDateStr: string,
  hasPaymentRecord: boolean,
  currentDateStr: string,
  reminderWindowDays: ReminderDays
): PaymentStatus {
  if (hasPaymentRecord) {
    return 'paid';
  }

  const daysDiff = diffCalendarDays(dueDateStr, currentDateStr); // positive if due date is in the future

  if (daysDiff < 0) {
    return 'needs_check'; // past due without payment record
  }
  if (daysDiff === 0) {
    return 'due_today';
  }
  if (daysDiff <= reminderWindowDays) {
    return 'due_soon';
  }
  return 'upcoming';
}

/**
 * Enrich instalments with plan metadata, payment record, and dynamic payment status.
 */
export function enrichInstalments(
  plans: Plan[],
  instalments: Instalment[],
  paymentRecords: PaymentRecord[],
  currentDateStr: string,
  reminderWindowDays: ReminderDays
): InstalmentWithStatus[] {
  const planMap = new Map<string, Plan>();
  plans.forEach(p => planMap.set(p.id, p));

  const recordMap = new Map<string, PaymentRecord>();
  paymentRecords.forEach(r => recordMap.set(r.instalment_id, r));

  return instalments.map(inst => {
    const plan = planMap.get(inst.plan_id);
    const record = recordMap.get(inst.id);
    const hasRecord = !!record;
    const status = computeInstalmentStatus(inst.due_date, hasRecord, currentDateStr, reminderWindowDays);

    return {
      ...inst,
      status,
      paymentRecord: record,
      planName: plan ? plan.name : 'Unknown Plan',
      planType: plan ? plan.type : 'emi',
      lenderOrCard: plan?.lender_or_card,
      totalInstalments: plan ? plan.total_instalments : 1,
      monthlyAmountPaise: plan ? plan.monthly_amount_paise : inst.scheduled_amount_paise,
    };
  });
}

/**
 * Calculate comprehensive dashboard overview metrics.
 */
export function calculateOverviewMetrics(
  plans: Plan[],
  enrichedInstalments: InstalmentWithStatus[],
  targetMonthKey: string, // "YYYY-MM" (e.g. "2026-11")
  currentDateStr: string,
  remindLaterUntil: string | null = null
): OverviewMetrics {
  // Filter instalments belonging to targetMonthKey
  const monthInstalments = enrichedInstalments.filter(i => i.due_date.startsWith(targetMonthKey));

  let monthScheduledPaise = 0;
  let monthRecordedPaidPaise = 0;
  let monthPaidCount = 0;
  let monthNeedsCheckCount = 0;
  let monthUpcomingCount = 0;

  monthInstalments.forEach(inst => {
    monthScheduledPaise += inst.scheduled_amount_paise;
    if (inst.status === 'paid') {
      monthRecordedPaidPaise += (inst.paymentRecord?.amount_paise ?? inst.scheduled_amount_paise);
      monthPaidCount++;
    } else if (inst.status === 'needs_check') {
      monthNeedsCheckCount++;
    } else {
      monthUpcomingCount++;
    }
  });

  const monthUnrecordedPaise = Math.max(0, monthScheduledPaise - monthRecordedPaidPaise);

  // Across all plans & all time
  let totalRecordedPaise = 0;
  let totalRemainingScheduledPaise = 0;
  let totalRecordedInstalments = 0;
  const totalInstalments = enrichedInstalments.length;

  enrichedInstalments.forEach(inst => {
    if (inst.status === 'paid') {
      totalRecordedPaise += (inst.paymentRecord?.amount_paise ?? inst.scheduled_amount_paise);
      totalRecordedInstalments++;
    } else {
      totalRemainingScheduledPaise += inst.scheduled_amount_paise;
    }
  });

  const totalProgressPercent = totalInstalments > 0
    ? Math.round((totalRecordedInstalments / totalInstalments) * 100)
    : 0;

  // Next payment card: earliest unrecorded instalment due today or later (due_date >= currentDateStr)
  const futureUnrecorded = enrichedInstalments
    .filter(i => i.status !== 'paid' && i.due_date >= currentDateStr)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const nextPaymentInstalment = futureUnrecorded.length > 0 ? futureUnrecorded[0] : null;

  // Attention banner: past-due unrecorded instalments (due_date < currentDateStr)
  // Check if snoozed for today
  const isSnoozed = remindLaterUntil && remindLaterUntil >= currentDateStr;
  
  const pastDueUnrecorded = enrichedInstalments
    .filter(i => i.status === 'needs_check')
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const attentionBannerInstalment = (!isSnoozed && pastDueUnrecorded.length > 0)
    ? pastDueUnrecorded[0]
    : null;

  // Latest scheduled final payment date
  let latestFinalPaymentDate: string | null = null;
  if (enrichedInstalments.length > 0) {
    const sortedByDate = [...enrichedInstalments].sort((a, b) => a.due_date.localeCompare(b.due_date));
    latestFinalPaymentDate = sortedByDate[sortedByDate.length - 1].due_date;
  }

  // Peak monthly commitment across all months
  const monthlyTotals = new Map<string, number>();
  enrichedInstalments.forEach(i => {
    const key = i.due_date.substring(0, 7);
    monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + i.scheduled_amount_paise);
  });
  let peakMonthlyCommitmentPaise = 0;
  monthlyTotals.forEach(val => {
    if (val > peakMonthlyCommitmentPaise) peakMonthlyCommitmentPaise = val;
  });

  return {
    monthScheduledPaise,
    monthRecordedPaidPaise,
    monthUnrecordedPaise,
    monthPaymentCount: monthInstalments.length,
    monthPaidCount,
    monthNeedsCheckCount,
    monthUpcomingCount,
    totalRecordedPaise,
    totalRemainingScheduledPaise,
    totalRecordedInstalments,
    totalInstalments,
    totalProgressPercent,
    peakMonthlyCommitmentPaise,
    latestFinalPaymentDate,
    nextPaymentInstalment,
    attentionBannerInstalment,
    attentionBannerCount: pastDueUnrecorded.length,
  };
}

/**
 * Generate points for the Monthly commitment chart.
 */
export function generateMonthlyCommitmentChartData(
  plans: Plan[],
  enrichedInstalments: InstalmentWithStatus[],
  currentDateStr: string
): MonthCommitmentPoint[] {
  if (enrichedInstalments.length === 0) return [];

  const currentMonthKey = currentDateStr.substring(0, 7);

  // Find min and max month key
  let minMonthKey = enrichedInstalments[0].due_date.substring(0, 7);
  let maxMonthKey = enrichedInstalments[0].due_date.substring(0, 7);

  enrichedInstalments.forEach(i => {
    const m = i.due_date.substring(0, 7);
    if (m < minMonthKey) minMonthKey = m;
    if (m > maxMonthKey) maxMonthKey = m;
  });

  const [minYear, minMonth] = minMonthKey.split('-').map(Number);
  const [maxYear, maxMonth] = maxMonthKey.split('-').map(Number);

  const points: MonthCommitmentPoint[] = [];

  let y = minYear;
  let m = minMonth;

  while (y < maxYear || (y === maxYear && m <= maxMonth)) {
    const monthKey = `${y}-${m.toString().padStart(2, '0')}`;
    const dateObj = new Date(Date.UTC(y, m - 1, 1));
    const label = dateObj.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' }) + " '" + y.toString().slice(-2);

    const monthInstalments = enrichedInstalments.filter(i => i.due_date.startsWith(monthKey));
    let totalScheduledPaise = 0;

    const planAmountMap = new Map<string, number>();
    monthInstalments.forEach(i => {
      totalScheduledPaise += i.scheduled_amount_paise;
      planAmountMap.set(i.plan_id, (planAmountMap.get(i.plan_id) || 0) + i.scheduled_amount_paise);
    });

    const byPlan = plans.map(p => ({
      planId: p.id,
      planName: p.name,
      amountPaise: planAmountMap.get(p.id) || 0,
    })).filter(bp => bp.amountPaise > 0);

    points.push({
      monthKey,
      label,
      year: y,
      month: m,
      totalScheduledPaise,
      isPastOrCurrent: monthKey <= currentMonthKey,
      isCurrentMonth: monthKey === currentMonthKey,
      byPlan,
    });

    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  return points;
}

