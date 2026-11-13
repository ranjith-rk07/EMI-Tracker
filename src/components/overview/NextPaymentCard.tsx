import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate, diffCalendarDays } from '../../utils/calculations';
import { Check, Clock, Eye, AlertCircle } from 'lucide-react';

export const NextPaymentCard: React.FC = () => {
  const {
    metrics,
    currentReferenceDate,
    selectedMonthKey,
    enrichedInstalments,
    openMarkPaid,
    openPlanDetail,
  } = useApp();

  const nextInst = metrics.nextPaymentInstalment;

  // Month at a glance timeline items
  const monthInsts = enrichedInstalments
    .filter(i => i.due_date.startsWith(selectedMonthKey))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  if (!nextInst) {
    return (
      <div className="w-full mb-6 p-6 rounded-3xl bg-gradient-to-br from-[#184E38] to-[#103726] text-white shadow-lg border border-emerald-800/40">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
            <Check className="w-6 h-6 text-emerald-300" />
          </div>
          <h3 className="text-lg font-bold text-white">All caught up!</h3>
          <p className="text-xs text-emerald-100/70 max-w-sm mt-1">
            No upcoming unrecorded payments are scheduled for today or the future in this period.
          </p>
        </div>
      </div>
    );
  }

  const [y, m, d] = nextInst.due_date.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const monthAbbr = dateObj.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' }).toUpperCase();
  const dayNum = d;
  const weekdayAbbr = dateObj.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' });

  const daysDiff = diffCalendarDays(nextInst.due_date, currentReferenceDate);
  const dueBadgeText = daysDiff === 0 ? 'Due today' : `Due in ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}`;

  // Timeline points
  const todayDay = parseInt(currentReferenceDate.split('-')[2], 10);
  const isCurrentMonthView = currentReferenceDate.startsWith(selectedMonthKey);

  return (
    <div className="w-full mb-6 rounded-3xl bg-gradient-to-br from-[#184E38] via-[#144431] to-[#0E3324] text-white p-5 md:p-6 shadow-xl border border-emerald-700/30 flex flex-col justify-between gap-6 relative overflow-hidden">
      {/* Decorative subtle background circle */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      {/* Top row: Badges */}
      <div className="flex items-center justify-between gap-2 relative z-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-medium backdrop-blur-xs border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Next payment</span>
          <span className="text-emerald-200/50">·</span>
          <span className="text-emerald-100/80">Across all plans</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-emerald-200 text-xs font-medium border border-white/10">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{dueBadgeText}</span>
        </div>
      </div>

      {/* Middle row: Date block, Plan details & Amount */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-1">
        <div className="flex items-center gap-4">
          {/* Date Block */}
          <div className="w-16 h-18 rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center justify-center shrink-0 backdrop-blur-xs shadow-inner">
            <span className="text-[0.68rem] font-bold text-emerald-300 tracking-wider leading-none">{monthAbbr}</span>
            <span className="text-2xl font-black text-white leading-tight my-0.5">{dayNum}</span>
            <span className="text-[0.68rem] font-medium text-emerald-200/70 leading-none">{weekdayAbbr}</span>
          </div>

          {/* Plan Info */}
          <div className="flex flex-col">
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {nextInst.planName}
            </h3>
            <p className="text-xs text-emerald-100/70 mt-0.5">
              {nextInst.planType === 'emi' ? 'EMI' : 'Personal loan'}
              {nextInst.lenderOrCard ? ` · ${nextInst.lenderOrCard}` : ''}
              {` · Instalment ${nextInst.sequence} of ${nextInst.totalInstalments}`}
            </p>
          </div>
        </div>

        {/* Amount & Actions */}
        <div className="flex flex-col md:items-end gap-3 shrink-0">
          <div className="flex flex-col md:items-end">
            <span className="text-[0.72rem] text-emerald-200/70 font-medium">
              Amount due {weekdayAbbr}, {dayNum} {monthAbbr}
            </span>
            <span className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {formatINR(nextInst.scheduled_amount_paise)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openMarkPaid(nextInst)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#103726] font-bold text-xs hover:bg-emerald-50 active:scale-[0.98] transition-all shadow-md"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Mark as paid
            </button>

            <button
              onClick={() => openPlanDetail(nextInst.plan_id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 active:scale-[0.98] border border-white/20 transition-all backdrop-blur-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              View plan
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Timeline: Month at a glance */}
      {monthInsts.length > 0 && (
        <div className="pt-4 border-t border-white/10 flex flex-col gap-3 relative z-1">
          <div className="flex items-center justify-between text-xs text-emerald-100/80">
            <span className="font-semibold">November at a glance</span>
            <span>
              {metrics.monthPaidCount} of {monthInsts.length} payments paid ·{' '}
              <span className="font-bold text-white">{formatINR(metrics.monthUnrecordedPaise)}</span> to go
            </span>
          </div>

          {/* Timeline Bar */}
          <div className="relative py-3">
            {/* Base Line */}
            <div className="w-full h-1 bg-white/20 rounded-full"></div>

            {/* Markers */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2">
              {monthInsts.map((inst) => {
                const day = parseInt(inst.due_date.split('-')[2], 10);
                const isPaid = inst.status === 'paid';
                const isNeedsCheck = inst.status === 'needs_check';
                const isNext = inst.id === nextInst.id;

                return (
                  <div key={inst.id} className="relative flex flex-col items-center">
                    {/* Circle icon */}
                    <button
                      onClick={() => openPlanDetail(inst.plan_id)}
                      title={`${inst.planName} - due ${day}th (${inst.status})`}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isPaid
                          ? 'bg-white text-emerald-800 shadow-sm'
                          : isNeedsCheck
                          ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                          : isNext
                          ? 'bg-emerald-400 text-slate-900 ring-4 ring-emerald-400/30'
                          : 'bg-white/30 text-white hover:bg-white/50'
                      }`}
                    >
                      {isPaid ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : isNeedsCheck ? (
                        <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      )}
                    </button>
                    {/* Day number label */}
                    <span className="text-[0.65rem] text-emerald-200/70 mt-1 font-medium">{day}</span>
                  </div>
                );
              })}
            </div>

            {/* "Today" pill on timeline if in month view */}
            {isCurrentMonthView && (
              <div
                className="absolute -top-3 px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-400/40 text-[0.62rem] text-emerald-200 font-bold -translate-x-1/2 pointer-events-none"
                style={{
                  left: `${Math.min(90, Math.max(10, (todayDay / 30) * 100))}%`,
                }}
              >
                Today
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

