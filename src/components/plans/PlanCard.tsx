import React from 'react';
import { Plan, InstalmentWithStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/calculations';
import { StatusBadge } from '../common/Badge';
import { Smartphone, Laptop, Bike, Landmark, CreditCard } from 'lucide-react';

interface PlanCardProps {
  plan: Plan;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const { enrichedInstalments, openPlanDetail, currentReferenceDate } = useApp();

  const planInsts = enrichedInstalments
    .filter(i => i.plan_id === plan.id)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const total = plan.total_instalments;
  const paidCount = planInsts.filter(i => i.status === 'paid').length;
  const percent = total > 0 ? Math.round((paidCount / total) * 100) : 0;
  const remainingPaise = (total - paidCount) * plan.monthly_amount_paise;

  // Determine card-level status:
  // If there is any past-due unrecorded instalment -> 'needs_check'
  // Else if all paid -> 'paid'
  // Else check if this month's instalment is paid
  const hasNeedsCheck = planInsts.some(i => i.status === 'needs_check');
  const isCompleted = paidCount === total;
  
  // Earliest unrecorded instalment
  const earliestUnrecorded = planInsts.find(i => i.status !== 'paid');
  
  let cardStatus: any = 'upcoming';
  if (hasNeedsCheck) {
    cardStatus = 'needs_check';
  } else if (isCompleted) {
    cardStatus = 'paid';
  } else if (earliestUnrecorded) {
    // Check if next is this month and already paid
    const currentMonthKey = currentReferenceDate.substring(0, 7);
    const thisMonthInst = planInsts.find(i => i.due_date.startsWith(currentMonthKey));
    if (thisMonthInst?.status === 'paid') {
      cardStatus = 'paid';
    } else {
      cardStatus = earliestUnrecorded.status;
    }
  }

  // Next due date display
  const nextDueDateStr = earliestUnrecorded ? formatDate(earliestUnrecorded.due_date, 'day-month') : 'Completed';

  // Final instalment date
  const finalInst = planInsts[planInsts.length - 1];
  const endsStr = finalInst ? formatDate(finalInst.due_date, 'month-year') : '—';

  const getIcon = () => {
    const lower = plan.name.toLowerCase();
    if (lower.includes('phone')) return Smartphone;
    if (lower.includes('laptop')) return Laptop;
    if (lower.includes('bike')) return Bike;
    if (plan.type === 'loan' || lower.includes('loan')) return Landmark;
    return CreditCard;
  };

  const Icon = getIcon();

  return (
    <div
      onClick={() => openPlanDetail(plan.id)}
      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top Row: Icon, Title & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300 group-hover:scale-105 transition-transform">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {plan.name}
              </h4>
              <span className="text-[0.68rem] text-slate-500 dark:text-slate-400 truncate">
                {plan.type === 'emi' ? 'EMI' : 'Personal loan'}
                {plan.lender_or_card ? ` · ${plan.lender_or_card}` : ''}
              </span>
            </div>
          </div>

          <StatusBadge status={cardStatus} />
        </div>

        {/* Monthly Amount */}
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatINR(plan.monthly_amount_paise)}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ month</span>
        </div>

        {/* Progress Bar & Fraction */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
            <span>{paidCount} of {total} paid</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{percent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hasNeedsCheck ? 'bg-amber-500' : 'bg-[#1B5B3E]'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Metadata Row: 3 Columns */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-[0.65rem] text-slate-400 block font-medium">Next due</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
            {nextDueDateStr}
          </span>
        </div>

        <div>
          <span className="text-[0.65rem] text-slate-400 block font-medium">Left</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
            {formatINR(remainingPaise)}
          </span>
        </div>

        <div>
          <span className="text-[0.65rem] text-slate-400 block font-medium">Ends</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
            {endsStr}
          </span>
        </div>
      </div>
    </div>
  );
};

