import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate, getKolkataDateString } from '../../utils/calculations';
import { Check, X, Calendar, AlertCircle } from 'lucide-react';

export const MarkPaidModal: React.FC = () => {
  const {
    isMarkPaidOpen,
    closeMarkPaid,
    activeInstalmentForPayment,
    currentReferenceDate,
    markInstalmentPaid,
  } = useApp();

  const [paymentDate, setPaymentDate] = useState<string>(currentReferenceDate);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isMarkPaidOpen) {
      setPaymentDate(currentReferenceDate);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isMarkPaidOpen, currentReferenceDate]);

  if (!isMarkPaidOpen || !activeInstalmentForPayment) return null;

  const inst = activeInstalmentForPayment;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that payment date is not in the future compared to today/reference date
    if (paymentDate > currentReferenceDate) {
      setError('Actual payment date cannot be in the future.');
      return;
    }

    setIsSubmitting(true);
    try {
      await markInstalmentPaid(inst.id, paymentDate);
    } catch (err: any) {
      setError(err?.message || 'Failed to mark instalment paid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeMarkPaid}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1B5B3E] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Record payment
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Instalment {inst.sequence} of {inst.totalInstalments}
              </span>
            </div>
          </div>

          <button
            onClick={closeMarkPaid}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Plan & Amount Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                {inst.planName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                Scheduled due: {formatDate(inst.due_date, 'full')}
              </span>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {formatINR(inst.scheduled_amount_paise)}
              </span>
            </div>
          </div>

          {/* Payment Date input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Actual payment date
            </label>
            <div className="relative">
              <input
                type="date"
                max={currentReferenceDate}
                value={paymentDate}
                onChange={(e) => {
                  setPaymentDate(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E]"
              />
            </div>
            <span className="text-[0.68rem] text-slate-400 mt-1 block">
              Defaulted to today. You can select a valid past date if paid earlier.
            </span>
            {error && (
              <span className="text-[0.68rem] text-rose-500 font-medium mt-1 block">
                {error}
              </span>
            )}
          </div>

          {/* Honest disclaimer notice */}
          <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 text-[0.7rem] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Marking as paid records your confirmation in Duewise. It does not initiate a real bank transaction or check your bank account.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={closeMarkPaid}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1B5B3E] hover:bg-[#164831] disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Recording...' : 'Confirm payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

