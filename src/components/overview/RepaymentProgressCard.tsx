import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/calculations';
import { ChevronRight, Smartphone, Landmark, Laptop, Bike, CreditCard } from 'lucide-react';

export const RepaymentProgressCard: React.FC = () => {
  const { plans, enrichedInstalments, metrics, openPlanDetail } = useApp();

  const getPlanIcon = (name: string, type: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('phone')) return Smartphone;
    if (lower.includes('laptop')) return Laptop;
    if (lower.includes('bike')) return Bike;
    if (type === 'loan' || lower.includes('loan')) return Landmark;
    return CreditCard;
  };

  const planColors = [
    { bg: 'bg-[#184E38]', text: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-[#1B5B3E]' },
    { bg: 'bg-[#D97706]', text: 'text-amber-700 dark:text-amber-400', bar: 'bg-amber-600' },
    { bg: 'bg-[#0D9488]', text: 'text-teal-700 dark:text-teal-400', bar: 'bg-teal-600' },
    { bg: 'bg-[#65A30D]', text: 'text-lime-700 dark:text-lime-400', bar: 'bg-lime-600' },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 flex flex-col justify-between transition-colors">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Repayment progress
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Recorded instalments across all plans
        </p>

        {/* Progress headline */}
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {metrics.totalProgressPercent}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-medium">
              {metrics.totalRecordedInstalments} of {metrics.totalInstalments} instalments paid
            </span>
          </div>

          <div className="text-right text-xs">
            <div className="text-slate-500 dark:text-slate-400">
              Repaid <span className="font-bold text-slate-900 dark:text-white">{formatINR(metrics.totalRecordedPaise)}</span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 mt-0.5">
              Left <span className="font-bold text-slate-900 dark:text-white">{formatINR(metrics.totalRemainingScheduledPaise)}</span>
            </div>
          </div>
        </div>

        {/* Segmented multi-plan bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 flex overflow-hidden gap-0.5">
          {plans.map((p, idx) => {
            const pInsts = enrichedInstalments.filter(i => i.plan_id === p.id);
            const pPaid = pInsts.filter(i => i.status === 'paid').length;
            const flexShare = pPaid > 0 ? pPaid : 0;
            const color = planColors[idx % planColors.length];

            return flexShare > 0 ? (
              <div
                key={p.id}
                className={`h-full ${color.bar}`}
                style={{ flex: flexShare }}
                title={`${p.name}: ${pPaid}/${p.total_instalments} paid`}
              />
            ) : null;
          })}
        </div>

        {/* Individual Plan rows */}
        <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800/80">
          {plans.map((plan, idx) => {
            const planInsts = enrichedInstalments.filter(i => i.plan_id === plan.id);
            const paidCount = planInsts.filter(i => i.status === 'paid').length;
            const unrecordedCount = plan.total_instalments - paidCount;
            const remainingPaise = unrecordedCount * plan.monthly_amount_paise;
            const Icon = getPlanIcon(plan.name, plan.type);
            const color = planColors[idx % planColors.length];

            const sortedInsts = [...planInsts].sort((a, b) => a.due_date.localeCompare(b.due_date));
            const finalDueDate = sortedInsts.length > 0 ? sortedInsts[sortedInsts.length - 1].due_date : '';
            const endsLabel = finalDueDate ? `ends ${formatDate(finalDueDate, 'month-year')}` : '';

            return (
              <button
                key={plan.id}
                onClick={() => openPlanDetail(plan.id)}
                className="w-full py-3 flex items-center justify-between text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {plan.name}
                    </span>
                    <span className="text-[0.68rem] text-slate-500 dark:text-slate-400 truncate">
                      {formatINR(remainingPaise)} left {endsLabel ? `· ${endsLabel}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {paidCount}/{plan.total_instalments}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

