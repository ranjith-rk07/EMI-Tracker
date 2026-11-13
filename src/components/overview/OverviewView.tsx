import React from 'react';
import { useApp } from '../../context/AppContext';
import { AttentionBanner } from './AttentionBanner';
import { NextPaymentCard } from './NextPaymentCard';
import { MetricsGrid } from './MetricsGrid';
import { PaymentScheduleTable } from './PaymentScheduleTable';
import { RepaymentProgressCard } from './RepaymentProgressCard';
import { MonthlyCommitmentChart } from './MonthlyCommitmentChart';
import { AddFromNoteCard } from './AddFromNoteCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    selectedMonthKey,
    nextMonth,
    prevMonth,
    currentReferenceDate,
  } = useApp();

  const [y, m] = selectedMonthKey.split('-').map(Number);
  const monthDate = new Date(Date.UTC(y, m - 1, 1));
  const monthDisplay = monthDate.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  });

  const [refY, refM, refD] = currentReferenceDate.split('-').map(Number);
  const refDateObj = new Date(Date.UTC(refY, refM - 1, refD, 12, 0, 0));
  const daySubtitle = refDateObj.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).toUpperCase();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[0.68rem] font-bold tracking-widest uppercase text-emerald-800 dark:text-emerald-400">
            {daySubtitle}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Monthly overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            See what's due, what you've paid, and what needs a check.
          </p>
        </div>

        {/* Month Selector Control */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs self-start sm:self-auto">
          <button
            onClick={prevMonth}
            title="Previous month ( [ )"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold px-3 text-slate-800 dark:text-slate-200 min-w-[120px] text-center select-none">
            {monthDisplay}
          </span>

          <button
            onClick={nextMonth}
            title="Next month ( ] )"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Attention Banner if needed */}
      <AttentionBanner />

      {/* Next Payment Hero Card */}
      <NextPaymentCard />

      {/* 4 Metric Cards */}
      <MetricsGrid />

      {/* Two Column Layout: Main Schedule & Commitment vs Right Progress & AI Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <PaymentScheduleTable />
          <MonthlyCommitmentChart />
        </div>

        {/* Right Column (1 Col on lg) */}
        <div className="flex flex-col gap-6">
          <RepaymentProgressCard />
          <AddFromNoteCard />
        </div>
      </div>
    </div>
  );
};

