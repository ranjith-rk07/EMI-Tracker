import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/calculations';
import { Calendar, CheckCircle2, Hourglass, Flag } from 'lucide-react';

export const MetricsGrid: React.FC = () => {
  const { metrics, selectedMonthKey, plans } = useApp();

  const [y, m] = selectedMonthKey.split('-').map(Number);
  const monthName = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
  });

  const monthPaidPercent = metrics.monthScheduledPaise > 0
    ? Math.round((metrics.monthRecordedPaidPaise / metrics.monthScheduledPaise) * 100)
    : 0;

  // Final debt-free date formatted
  const debtFreeText = metrics.latestFinalPaymentDate
    ? `Debt-free by ${formatDate(metrics.latestFinalPaymentDate, 'month-year')}`
    : 'No active plans';

  // Plan segment colors for the multi-segment bar in Card 1
  const segmentColors = ['bg-emerald-600', 'bg-amber-500', 'bg-teal-500', 'bg-lime-600', 'bg-cyan-600'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 1. Due in Month */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold">Due in {monthName}</span>
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatINR(metrics.monthScheduledPaise)}
          </div>

          {/* Segmented color bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2.5 flex overflow-hidden gap-0.5">
            {plans.map((p, idx) => (
              <div
                key={p.id}
                className={`h-full ${segmentColors[idx % segmentColors.length]}`}
                style={{ flex: p.monthly_amount_paise }}
                title={`${p.name}: ${formatINR(p.monthly_amount_paise)}`}
              />
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {metrics.monthPaymentCount} {metrics.monthPaymentCount === 1 ? 'payment' : 'payments'}
        </div>
      </div>

      {/* 2. Paid */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold">Paid</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatINR(metrics.monthRecordedPaidPaise)}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {monthPaidPercent}% of the month · {metrics.monthPaidCount} {metrics.monthPaidCount === 1 ? 'payment' : 'payments'}
        </div>
      </div>

      {/* 3. Left to pay */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold">Left to pay</span>
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Hourglass className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatINR(metrics.monthUnrecordedPaise)}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
          {metrics.monthNeedsCheckCount > 0 && (
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {metrics.monthNeedsCheckCount} needs a check
            </span>
          )}
          {metrics.monthNeedsCheckCount > 0 && metrics.monthUpcomingCount > 0 && <span>·</span>}
          {metrics.monthUpcomingCount > 0 && (
            <span>{metrics.monthUpcomingCount} upcoming</span>
          )}
          {metrics.monthNeedsCheckCount === 0 && metrics.monthUpcomingCount === 0 && (
            <span className="text-emerald-600 font-medium">All recorded!</span>
          )}
        </div>
      </div>

      {/* 4. Outstanding Scheduled */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold">Scheduled amount left</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Flag className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatINR(metrics.totalRemainingScheduledPaise)}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate" title={debtFreeText}>
          {debtFreeText}
        </div>
      </div>
    </div>
  );
};

