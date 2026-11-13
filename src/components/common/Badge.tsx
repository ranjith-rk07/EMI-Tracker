import React from 'react';
import { PaymentStatus } from '../../types';
import { Check, AlertTriangle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'paid':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DEF7EC] text-[#03543F] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/40 ${className}`}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          Paid
        </span>
      );
    case 'needs_check':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5] text-amber-600 dark:text-amber-400" />
          Needs check
        </span>
      );
    case 'due_today':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/40 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
          Due today
        </span>
      );
    case 'due_soon':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 ${className}`}
        >
          <Clock className="w-3 h-3 text-amber-600" />
          Due soon
        </span>
      );
    case 'upcoming':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Upcoming
        </span>
      );
  }
};

