import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/calculations';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';

export const UndoPaidModal: React.FC = () => {
  const {
    isUndoPaidOpen,
    closeUndoPaid,
    activeInstalmentForUndo,
    undoInstalmentPayment,
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isUndoPaidOpen || !activeInstalmentForUndo) return null;

  const inst = activeInstalmentForUndo;
  const record = inst.paymentRecord;

  const handleUndo = async () => {
    if (!record) {
      closeUndoPaid();
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await undoInstalmentPayment(record.id);
    } catch (err: any) {
      setError(err?.message || 'Failed to undo payment record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeUndoPaid}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/40">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Undo payment record
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {inst.planName} · Instalment {inst.sequence} of {inst.totalInstalments}
              </span>
            </div>
          </div>

          <button
            onClick={closeUndoPaid}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                {formatINR(inst.scheduled_amount_paise)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                {record?.payment_date
                  ? `Recorded as paid on ${formatDate(record.payment_date, 'short')}`
                  : 'Payment date not provided (historical)'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This removes the recording in Duewise and recalculates your repayment progress and schedule. It does <strong>not</strong> reverse any real transaction in your bank.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={closeUndoPaid}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleUndo}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isSubmitting ? 'Undoing...' : 'Remove record'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

