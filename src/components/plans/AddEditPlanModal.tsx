import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanType } from '../../types';
import {
  formatINR,
  inrToPaise,
  paiseToInr,
  getDaysInMonth,
  formatDate,
} from '../../utils/calculations';
import { X, Calendar, CreditCard, Landmark, Check } from 'lucide-react';

export const AddEditPlanModal: React.FC = () => {
  const { isAddPlanOpen, closeAddPlan, createPlan, initialAddPlanData } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<PlanType>('emi');
  const [lenderOrCard, setLenderOrCard] = useState('');
  const [monthlyAmountInr, setMonthlyAmountInr] = useState<string>('4000');
  const [dueDay, setDueDay] = useState<number>(5);
  const [firstMonth, setFirstMonth] = useState<number>(12);
  const [firstYear, setFirstYear] = useState<number>(2026);
  const [totalInstalments, setTotalInstalments] = useState<number>(12);
  const [alreadyPaid, setAlreadyPaid] = useState<number>(0);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate when opened or prefilled (e.g. from AI note)
  useEffect(() => {
    if (isAddPlanOpen) {
      if (initialAddPlanData) {
        setName(initialAddPlanData.name || '');
        setType(initialAddPlanData.type || 'emi');
        setLenderOrCard(initialAddPlanData.lender_or_card || '');
        if (initialAddPlanData.monthly_amount_paise) {
          setMonthlyAmountInr(paiseToInr(initialAddPlanData.monthly_amount_paise).toString());
        }
        if (initialAddPlanData.due_day) {
          setDueDay(initialAddPlanData.due_day);
        }
        if (initialAddPlanData.first_instalment_date) {
          const [y, m] = initialAddPlanData.first_instalment_date.split('-').map(Number);
          setFirstYear(y);
          setFirstMonth(m);
        }
        if (initialAddPlanData.total_instalments) {
          setTotalInstalments(initialAddPlanData.total_instalments);
        }
      } else {
        // Defaults
        setName('');
        setType('emi');
        setLenderOrCard('');
        setMonthlyAmountInr('4000');
        setDueDay(5);
        setFirstMonth(12);
        setFirstYear(2026);
        setTotalInstalments(12);
        setAlreadyPaid(0);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isAddPlanOpen, initialAddPlanData]);

  // Ordinal helper
  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Live Summary Calculations
  const parsedAmount = parseFloat(monthlyAmountInr.replace(/,/g, '')) || 0;
  const amountPaise = inrToPaise(parsedAmount);
  const totalRepayablePaise = amountPaise * (totalInstalments || 0);

  // First due date string
  const firstDueDayActual = Math.min(dueDay, getDaysInMonth(firstYear, firstMonth));
  const firstDueDateStr = `${firstYear}-${firstMonth.toString().padStart(2, '0')}-${firstDueDayActual.toString().padStart(2, '0')}`;
  const firstDueDisplay = formatDate(firstDueDateStr, 'short');

  // Final payment calculation
  const finalPaymentDisplay = useMemo(() => {
    if (!totalInstalments || totalInstalments < 1) return '—';
    const totalMonthsOffset = totalInstalments - 1;
    const targetMonthIdx = (firstMonth - 1) + totalMonthsOffset;
    const endYear = firstYear + Math.floor(targetMonthIdx / 12);
    const endMonth = (targetMonthIdx % 12) + 1;
    const endDayActual = Math.min(dueDay, getDaysInMonth(endYear, endMonth));
    const endDateStr = `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDayActual.toString().padStart(2, '0')}`;
    return formatDate(endDateStr, 'month-year');
  }, [firstYear, firstMonth, dueDay, totalInstalments]);

  if (!isAddPlanOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Plan name is required';
    }
    if (parsedAmount <= 0) {
      newErrors.monthlyAmount = 'Enter a valid positive monthly amount';
    }
    if (!totalInstalments || totalInstalments < 1 || totalInstalments > 360) {
      newErrors.totalInstalments = 'Enter instalments count between 1 and 360';
    }
    if (alreadyPaid < 0 || alreadyPaid > totalInstalments) {
      newErrors.alreadyPaid = `Already paid must be between 0 and ${totalInstalments}`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await createPlan(
        name,
        type,
        lenderOrCard,
        amountPaise,
        dueDay,
        firstDueDateStr,
        totalInstalments,
        alreadyPaid
      );
    } catch (err: any) {
      console.error(err);
      setErrors({ form: err?.message || 'Failed to create plan' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeAddPlan}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1B5B3E] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add a payment plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track an EMI or personal loan. You can record payments as they happen.
              </p>
            </div>
          </div>

          <button
            onClick={closeAddPlan}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
              {errors.form}
            </div>
          )}

          {/* Plan Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Plan name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Phone EMI"
              className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5B3E] transition-all ${
                errors.name ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.name && <span className="text-[0.68rem] text-rose-500 mt-1 block">{errors.name}</span>}
          </div>

          {/* Plan Type Segmented Button */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setType('emi')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === 'emi'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>EMI</span>
              </button>
              <button
                type="button"
                onClick={() => setType('loan')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === 'loan'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>Personal loan</span>
              </button>
            </div>
          </div>

          {/* Lender & Monthly Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Lender or card
                </label>
                <span className="text-[0.65rem] text-slate-400">Optional</span>
              </div>
              <input
                type="text"
                value={lenderOrCard}
                onChange={(e) => setLenderOrCard(e.target.value)}
                placeholder="e.g. Example Bank"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5B3E] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Monthly amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="text"
                  value={monthlyAmountInr}
                  onChange={(e) => {
                    setMonthlyAmountInr(e.target.value);
                    if (errors.monthlyAmount) setErrors(prev => ({ ...prev, monthlyAmount: '' }));
                  }}
                  placeholder="4,000"
                  className={`w-full pl-7 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E] transition-all ${
                    errors.monthlyAmount ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.monthlyAmount && <span className="text-[0.68rem] text-rose-500 mt-1 block">{errors.monthlyAmount}</span>}
            </div>
          </div>

          {/* Due Every Month On & Number of Instalments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Due every month on
              </label>
              <select
                value={dueDay}
                onChange={(e) => setDueDay(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E]"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {getOrdinal(d)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Number of instalments
              </label>
              <input
                type="number"
                min="1"
                max="360"
                value={totalInstalments || ''}
                onChange={(e) => {
                  setTotalInstalments(parseInt(e.target.value, 10) || 0);
                  if (errors.totalInstalments) setErrors(prev => ({ ...prev, totalInstalments: '' }));
                }}
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E] ${
                  errors.totalInstalments ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.totalInstalments && <span className="text-[0.68rem] text-rose-500 mt-1 block">{errors.totalInstalments}</span>}
            </div>
          </div>

          {/* First Instalment & Already Paid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                First instalment
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={firstMonth}
                  onChange={(e) => setFirstMonth(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E]"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>

                <select
                  value={firstYear}
                  onChange={(e) => setFirstYear(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E]"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Already paid
              </label>
              <input
                type="number"
                min="0"
                max={totalInstalments}
                value={alreadyPaid}
                onChange={(e) => {
                  setAlreadyPaid(parseInt(e.target.value, 10) || 0);
                  if (errors.alreadyPaid) setErrors(prev => ({ ...prev, alreadyPaid: '' }));
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E]"
              />
              <span className="text-[0.65rem] text-slate-400 mt-1 block">
                Instalments paid before you started tracking.
              </span>
              {errors.alreadyPaid && <span className="text-[0.68rem] text-rose-500 mt-1 block">{errors.alreadyPaid}</span>}
            </div>
          </div>

          {/* Live Schedule Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-2">
            <div>
              <span className="text-[0.65rem] text-slate-400 block font-medium">Per month</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                {amountPaise > 0 ? formatINR(amountPaise) : '—'}
              </span>
            </div>

            <div>
              <span className="text-[0.65rem] text-slate-400 block font-medium">Total repayable</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                {totalRepayablePaise > 0 ? formatINR(totalRepayablePaise) : '—'}
              </span>
            </div>

            <div>
              <span className="text-[0.65rem] text-slate-400 block font-medium">First due</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block truncate">
                {firstDueDisplay}
              </span>
            </div>

            <div>
              <span className="text-[0.65rem] text-slate-400 block font-medium">Final payment</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block truncate">
                {finalPaymentDisplay}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={closeAddPlan}
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
              <span>{isSubmitting ? 'Saving...' : 'Save plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

