import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Check } from 'lucide-react';
import { formatINR, formatDate, diffCalendarDays } from '../../utils/calculations';

export const AttentionBanner: React.FC = () => {
  const {
    metrics,
    currentReferenceDate,
    snoozeAttentionBanner,
    openPlanDetail,
    openMarkPaid,
  } = useApp();

  const inst = metrics.attentionBannerInstalment;
  if (!inst) return null;

  const daysAgo = Math.abs(diffCalendarDays(inst.due_date, currentReferenceDate));
  const dueDayFormatted = formatDate(inst.due_date, 'weekday-short');

  return (
    <div className="w-full mb-6 p-4 rounded-2xl bg-[#FEF7EC] dark:bg-amber-950/40 border border-[#F9DFB8] dark:border-amber-800/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
      {/* Left text with icon */}
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-700/60">
          <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-bold text-slate-900 dark:text-amber-100">
            Did you pay your {inst.planName}?
          </h4>
          <p className="text-xs text-slate-600 dark:text-amber-200/80 mt-0.5 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-amber-100">{formatINR(inst.scheduled_amount_paise)}</span> was due {dueDayFormatted} ({daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago). Record it to keep your totals accurate.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
        <button
          onClick={snoozeAttentionBanner}
          className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          Remind me later
        </button>

        <button
          onClick={() => openPlanDetail(inst.plan_id)}
          className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
        >
          View plan
        </button>

        <button
          onClick={() => openMarkPaid(inst)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1B5B3E] hover:bg-[#164831] px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          Yes, it's paid
        </button>
      </div>
    </div>
  );
};

