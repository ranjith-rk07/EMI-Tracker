import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate, diffCalendarDays } from '../../utils/calculations';
import { StatusBadge } from '../common/Badge';
import {
  X,
  Trash2,
  Check,
  RotateCcw,
  Smartphone,
  Laptop,
  Bike,
  Landmark,
  CreditCard,
  AlertTriangle,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const PlanDetailDrawer: React.FC = () => {
  const {
    selectedPlanId,
    closePlanDetail,
    plans,
    enrichedInstalments,
    currentReferenceDate,
    openMarkPaid,
    openUndoPaid,
    deletePlan,
  } = useApp();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectedPlanId) return null;

  const plan = plans.find(p => p.id === selectedPlanId);
  if (!plan) return null;

  const planInsts = enrichedInstalments
    .filter(i => i.plan_id === plan.id)
    .sort((a, b) => a.sequence - b.sequence);

  const total = plan.total_instalments;
  const paidCount = planInsts.filter(i => i.status === 'paid').length;
  const percent = total > 0 ? Math.round((paidCount / total) * 100) : 0;
  const paidPaise = paidCount * plan.monthly_amount_paise;
  const remainingPaise = (total - paidCount) * plan.monthly_amount_paise;

  // Ordinal day string (e.g. "5th")
  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const firstDueDateStr = planInsts[0]?.due_date ? formatDate(planInsts[0].due_date, 'month-year') : '—';
  const finalDueDateStr = planInsts[planInsts.length - 1]?.due_date ? formatDate(planInsts[planInsts.length - 1].due_date, 'month-year') : '—';

  // Earliest unrecorded instalment
  const nextUnrecorded = planInsts.find(i => i.status !== 'paid');

  // Next instalment details
  let nextInstTitle = 'All instalments paid';
  let nextInstSubtitle = 'Plan complete';
  let nextInstDueText = '';
  if (nextUnrecorded) {
    const [y, m, d] = nextUnrecorded.due_date.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    const monthName = dateObj.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long' });
    nextInstTitle = `${monthName} instalment · ${d} ${dateObj.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' })}`;

    const daysDiff = diffCalendarDays(nextUnrecorded.due_date, currentReferenceDate);
    if (daysDiff < 0) {
      nextInstSubtitle = `${Math.abs(daysDiff)} days overdue`;
    } else if (daysDiff === 0) {
      nextInstSubtitle = 'Due today';
    } else {
      nextInstSubtitle = `In ${daysDiff} days`;
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      await deletePlan(plan.id);
      closePlanDetail();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const getIcon = () => {
    const lower = plan.name.toLowerCase();
    if (lower.includes('phone')) return Smartphone;
    if (lower.includes('laptop')) return Laptop;
    if (lower.includes('bike')) return Bike;
    if (plan.type === 'loan' || lower.includes('loan')) return Landmark;
    return CreditCard;
  };

  const Icon = getIcon();

  // SVG circular ring calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closePlanDetail}
      />

      {/* Drawer Container */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200 dark:border-slate-800 transition-colors animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1B5B3E] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {plan.name}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {plan.type === 'emi' ? 'EMI' : 'Personal loan'}
                {plan.lender_or_card ? ` · ${plan.lender_or_card}` : ''}
              </span>
            </div>
          </div>

          <button
            onClick={closePlanDetail}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          {/* Progress Ring & Monthly Amount */}
          <div className="flex items-center gap-5">
            {/* SVG Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  className="stroke-[#1B5B3E] transition-all duration-700"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute text-sm font-black text-slate-900 dark:text-white">
                {percent}%
              </span>
            </div>

            {/* Monthly Amount text */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatINR(plan.monthly_amount_paise)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ month</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {paidCount} of {total} paid · due on the {getOrdinal(plan.due_day)}
              </span>
            </div>
          </div>

          {/* 4 Stat Tiles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[0.68rem] text-slate-400 font-medium block">Paid so far</span>
              <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                {formatINR(paidPaise)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[0.68rem] text-slate-400 font-medium block">Left to repay</span>
              <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                {formatINR(remainingPaise)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[0.68rem] text-slate-400 font-medium block">First instalment</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                {firstDueDateStr}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[0.68rem] text-slate-400 font-medium block">Final instalment</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                {finalDueDateStr}
              </span>
            </div>
          </div>

          {/* Next Instalment Box */}
          {nextUnrecorded && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {nextInstTitle}
                </span>
                <span className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5">
                  {nextInstSubtitle}
                </span>
              </div>

              <StatusBadge status={nextUnrecorded.status} />
            </div>
          )}

          {/* Interactive Instalments Grid */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Instalments
              </h4>
              <span className="text-[0.68rem] text-slate-400">
                Tap a month to record or undo
              </span>
            </div>

            {/* Grid of Months */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {planInsts.map((inst) => {
                const [y, m, d] = inst.due_date.split('-').map(Number);
                const dateObj = new Date(Date.UTC(y, m - 1, d));
                const monthAbbr = dateObj.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' });
                const yearAbbr = `'${y.toString().slice(-2)}`;

                const isPaid = inst.status === 'paid';
                const isNeedsCheck = inst.status === 'needs_check';

                return (
                  <button
                    key={inst.id}
                    onClick={() => {
                      if (isPaid) {
                        openUndoPaid(inst);
                      } else {
                        openMarkPaid(inst);
                      }
                    }}
                    title={`#${inst.sequence}: ${formatDate(inst.due_date, 'day-month')} (${inst.status})`}
                    className={`py-2 px-1.5 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                      isPaid
                        ? 'bg-[#184E38] text-white font-semibold shadow-2xs hover:bg-[#123B2A]'
                        : isNeedsCheck
                        ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-semibold hover:bg-[#FDE68A]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-[0.68rem] leading-none">{monthAbbr}</span>
                    <span className="text-[0.62rem] opacity-70 leading-none mt-0.5">{yearAbbr}</span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[0.68rem] text-slate-500 dark:text-slate-400 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#184E38]"></span>
                <span>Paid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Needs check</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span>Upcoming</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              confirmDelete
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmDelete ? 'Confirm delete?' : 'Delete'}</span>
          </button>

          {nextUnrecorded && (
            <button
              onClick={() => openMarkPaid(nextUnrecorded)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B5B3E] hover:bg-[#164831] text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>
                Mark {new Date(nextUnrecorded.due_date).toLocaleDateString('en-US', { month: 'short' })} as paid
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

