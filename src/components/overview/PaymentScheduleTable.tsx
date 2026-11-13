import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate, diffCalendarDays } from '../../utils/calculations';
import { StatusBadge } from '../common/Badge';
import {
  Smartphone,
  Landmark,
  Laptop,
  Bike,
  CreditCard,
  Check,
  ArrowRight,
  Info
} from 'lucide-react';

export const PaymentScheduleTable: React.FC = () => {
  const {
    enrichedInstalments,
    selectedMonthKey,
    currentReferenceDate,
    metrics,
    openMarkPaid,
    openPlanDetail,
    setActiveTab,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<'all' | 'emi' | 'loan'>('all');

  const monthInstalments = enrichedInstalments
    .filter(i => i.due_date.startsWith(selectedMonthKey))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const filteredInstalments = monthInstalments.filter(i => {
    if (typeFilter === 'all') return true;
    return i.planType === typeFilter;
  });

  const emiCount = monthInstalments.filter(i => i.planType === 'emi').length;
  const loanCount = monthInstalments.filter(i => i.planType === 'loan').length;

  const [y, m] = selectedMonthKey.split('-').map(Number);
  const monthLabel = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  });

  const getPlanIcon = (name: string, type: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('phone') || lower.includes('mobile')) {
      return { icon: Smartphone, bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' };
    }
    if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('pc')) {
      return { icon: Laptop, bg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300' };
    }
    if (lower.includes('bike') || lower.includes('motorcycle') || lower.includes('vehicle')) {
      return { icon: Bike, bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' };
    }
    if (type === 'loan' || lower.includes('loan') || lower.includes('bank')) {
      return { icon: Landmark, bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' };
    }
    return { icon: CreditCard, bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 transition-colors">
      {/* Top Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Payment schedule
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {monthLabel} · {monthInstalments.length} {monthInstalments.length === 1 ? 'payment' : 'payments'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              typeFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            All <span className="opacity-70 ml-0.5">{monthInstalments.length}</span>
          </button>
          <button
            onClick={() => setTypeFilter('emi')}
            className={`px-3 py-1 rounded-lg transition-all ${
              typeFilter === 'emi'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            EMIs <span className="opacity-70 ml-0.5">{emiCount}</span>
          </button>
          <button
            onClick={() => setTypeFilter('loan')}
            className={`px-3 py-1 rounded-lg transition-all ${
              typeFilter === 'loan'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Loans <span className="opacity-70 ml-0.5">{loanCount}</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs mt-2">
          <thead>
            <tr className="text-[0.68rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
              <th className="py-3 px-2">Payment</th>
              <th className="py-3 px-2">Due</th>
              <th className="py-3 px-2">Amount</th>
              <th className="py-3 px-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredInstalments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No payments scheduled in this month matching the filter.
                </td>
              </tr>
            ) : (
              filteredInstalments.map((inst) => {
                const { icon: Icon, bg } = getPlanIcon(inst.planName, inst.planType);
                const isNext = metrics.nextPaymentInstalment?.id === inst.id;
                const daysDiff = diffCalendarDays(inst.due_date, currentReferenceDate);
                
                let relativeDue = '';
                if (inst.status === 'paid') {
                  relativeDue = inst.paymentRecord?.payment_date
                    ? `Paid ${formatDate(inst.paymentRecord.payment_date, 'day-month')}`
                    : 'Payment recorded';
                } else if (daysDiff < 0) {
                  const abs = Math.abs(daysDiff);
                  relativeDue = `${abs} ${abs === 1 ? 'day' : 'days'} ago`;
                } else if (daysDiff === 0) {
                  relativeDue = 'Today';
                } else {
                  relativeDue = `In ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}`;
                }

                return (
                  <tr
                    key={inst.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Payment Column */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openPlanDetail(inst.plan_id)}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors truncate text-left"
                            >
                              {inst.planName}
                            </button>
                            {isNext && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-800 text-white font-bold text-[0.6rem] tracking-wide">
                                Next
                              </span>
                            )}
                          </div>
                          <span className="text-[0.68rem] text-slate-500 dark:text-slate-400 truncate">
                            {inst.planType === 'emi' ? 'EMI' : 'Personal loan'}
                            {inst.lenderOrCard ? ` · ${inst.lenderOrCard}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Due Column */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(inst.due_date, 'day-month')}
                        </span>
                        <span className={`text-[0.68rem] ${
                          inst.status === 'needs_check' ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {relativeDue}
                        </span>
                      </div>
                    </td>

                    {/* Amount Column */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatINR(inst.scheduled_amount_paise)}
                        </span>
                        <span className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                          {inst.sequence} of {inst.totalInstalments}
                        </span>
                      </div>
                    </td>

                    {/* Status & Actions Column */}
                    <td className="py-3 px-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <StatusBadge status={inst.status} />

                        {inst.status !== 'paid' && (
                          <button
                            onClick={() => openMarkPaid(inst)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1B5B3E] hover:bg-[#164831] text-white font-semibold text-[0.7rem] transition-colors shadow-2xs"
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            Mark paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info & Calendar Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Statuses update as soon as you record a payment.</span>
        </div>

        <button
          onClick={() => setActiveTab('calendar')}
          className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
        >
          <span>Open calendar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

