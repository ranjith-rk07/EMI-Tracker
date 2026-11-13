import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate, getDaysInMonth, diffCalendarDays } from '../../utils/calculations';
import { StatusBadge } from '../common/Badge';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Plus,
  Laptop,
  Smartphone,
  Bike,
  Landmark,
  CreditCard,
  Calendar as CalendarIcon
} from 'lucide-react';
import { InstalmentWithStatus } from '../../types';

export const CalendarView: React.FC = () => {
  const {
    selectedMonthKey,
    nextMonth,
    prevMonth,
    currentReferenceDate,
    enrichedInstalments,
    metrics,
    openMarkPaid,
    openUndoPaid,
    openPlanDetail,
    openAddPlan,
  } = useApp();

  const [y, m] = selectedMonthKey.split('-').map(Number);
  
  // Default selected day: 15 if Nov 2026 (matching screenshot), or 10, or 1st
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (selectedMonthKey === '2026-11') return 15;
    const today = parseInt(currentReferenceDate.split('-')[2], 10);
    return today || 1;
  });

  const monthDate = new Date(Date.UTC(y, m - 1, 1));
  const monthDisplay = monthDate.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  });

  const totalDays = getDaysInMonth(y, m);
  
  // Calculate day of week of the 1st day of month (Monday = 0, Sunday = 6)
  // JS getDay(): 0 = Sun, 1 = Mon ... 6 = Sat
  const firstDayOfWeek = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;

  // Month instalments
  const monthInsts = enrichedInstalments
    .filter(i => i.due_date.startsWith(selectedMonthKey))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  // Payments mapped by day
  const paymentsByDay = new Map<number, InstalmentWithStatus[]>();
  monthInsts.forEach(inst => {
    const day = parseInt(inst.due_date.split('-')[2], 10);
    if (!paymentsByDay.has(day)) {
      paymentsByDay.set(day, []);
    }
    paymentsByDay.get(day)!.push(inst);
  });

  // Selected date string
  const selectedDateStr = `${y}-${m.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
  const selectedDateObj = new Date(Date.UTC(y, m - 1, selectedDay, 12, 0, 0));
  const selectedWeekdayLong = selectedDateObj.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const daysDiffFromRef = diffCalendarDays(selectedDateStr, currentReferenceDate);
  let selectedDayRelative = '';
  if (daysDiffFromRef === 0) selectedDayRelative = 'Today';
  else if (daysDiffFromRef > 0) selectedDayRelative = `In ${daysDiffFromRef} ${daysDiffFromRef === 1 ? 'day' : 'days'}`;
  else selectedDayRelative = `${Math.abs(daysDiffFromRef)} days ago`;

  const selectedDayPayments = paymentsByDay.get(selectedDay) || [];

  const getIcon = (name: string, type: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('phone')) return Smartphone;
    if (lower.includes('laptop')) return Laptop;
    if (lower.includes('bike')) return Bike;
    if (type === 'loan' || lower.includes('loan')) return Landmark;
    return CreditCard;
  };

  const weekDayHeaders = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[0.68rem] font-bold tracking-widest uppercase text-emerald-800 dark:text-emerald-400">
            CALENDAR
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Payment calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {monthInsts.length} {monthInsts.length === 1 ? 'payment' : 'payments'} · {formatINR(metrics.monthScheduledPaise)} scheduled · {formatINR(metrics.monthRecordedPaidPaise)} paid
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs self-start sm:self-auto">
          <button
            onClick={prevMonth}
            title="Previous month"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold px-3 text-slate-800 dark:text-slate-200 min-w-[120px] text-center select-none">
            {monthDisplay}
          </span>

          <button
            onClick={nextMonth}
            title="Next month"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Left & Selected Day Panel Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols on lg) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-4 sm:p-5 transition-colors overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center pb-3 border-b border-slate-100 dark:border-slate-800">
            {weekDayHeaders.map((day) => (
              <span key={day} className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Grid of Dates */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mt-2">
            {/* Blank cells for padding before the 1st day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[70px] sm:min-h-[90px] rounded-xl bg-slate-50/40 dark:bg-slate-800/20" />
            ))}

            {/* Days 1 to totalDays */}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              const dayPayments = paymentsByDay.get(day) || [];
              const isSelected = day === selectedDay;
              
              // Check if today
              const isToday = currentReferenceDate === `${y}-${m.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[70px] sm:min-h-[90px] p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold leading-none ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-[#184E38] text-white flex items-center justify-center font-bold text-[0.7rem]'
                          : isSelected
                          ? 'text-emerald-800 dark:text-emerald-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Payment Pills on Day */}
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayPayments.map((p) => {
                      const isPaid = p.status === 'paid';
                      const isNeedsCheck = p.status === 'needs_check';

                      return (
                        <div
                          key={p.id}
                          className={`px-1.5 py-0.5 rounded-md text-[0.62rem] font-semibold truncate flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200'
                              : isNeedsCheck
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                          title={`${p.planName} · ${formatINR(p.scheduled_amount_paise)}`}
                        >
                          {isPaid ? (
                            <Check className="w-2.5 h-2.5 shrink-0 stroke-[3]" />
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isNeedsCheck ? 'bg-amber-500' : 'bg-slate-400'}`} />
                          )}
                          <span className="truncate">{p.planName}</span>
                          <span className="opacity-80 shrink-0 font-medium">{formatINR(p.scheduled_amount_paise)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail Panel (1 Col on lg) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 flex flex-col justify-between gap-6 transition-colors">
          <div>
            {/* Selected Date Header */}
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[0.68rem] text-slate-400 font-medium block">
                {selectedDayRelative}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedWeekdayLong}
              </h3>
            </div>

            {/* Payments on Selected Date */}
            <div className="my-4 flex flex-col gap-3">
              {selectedDayPayments.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No payments scheduled for this date.
                </div>
              ) : (
                selectedDayPayments.map((inst) => {
                  const Icon = getIcon(inst.planName, inst.planType);
                  const isPaid = inst.status === 'paid';

                  return (
                    <div
                      key={inst.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-2xs flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <button
                              onClick={() => openPlanDetail(inst.plan_id)}
                              className="font-bold text-xs text-slate-900 dark:text-white hover:text-emerald-700 text-left truncate"
                            >
                              {inst.planName}
                            </button>
                            <span className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                              {inst.planType === 'emi' ? 'EMI' : 'Personal loan'} · Instalment {inst.sequence} of {inst.totalInstalments}
                            </span>
                          </div>
                        </div>

                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {formatINR(inst.scheduled_amount_paise)}
                        </span>
                      </div>

                      {/* Status and Action row */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                        <StatusBadge status={inst.status} />

                        {isPaid ? (
                          <button
                            onClick={() => openUndoPaid(inst)}
                            className="flex items-center gap-1 text-[0.7rem] font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Undo record</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openMarkPaid(inst)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1B5B3E] hover:bg-[#164831] text-white font-bold text-[0.7rem] transition-colors shadow-2xs"
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Mark paid</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* THIS MONTH List */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                This month
              </span>

              <div className="flex flex-col gap-2.5">
                {monthInsts.map((inst) => {
                  const day = parseInt(inst.due_date.split('-')[2], 10);
                  const isPaid = inst.status === 'paid';
                  const isNeedsCheck = inst.status === 'needs_check';

                  return (
                    <div
                      key={inst.id}
                      onClick={() => setSelectedDay(day)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                        day === selectedDay
                          ? 'bg-slate-100 dark:bg-slate-800 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          isPaid ? 'bg-emerald-600' : isNeedsCheck ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                        <span className="w-4 font-semibold text-slate-400">{day}</span>
                        <span className="truncate">{inst.planName}</span>
                      </div>

                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatINR(inst.scheduled_amount_paise)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add Plan button */}
          <button
            onClick={() => openAddPlan()}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-all mt-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

