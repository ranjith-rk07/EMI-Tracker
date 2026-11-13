import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanCard } from './PlanCard';
import { formatINR } from '../../utils/calculations';
import { Plus, ArrowUpDown } from 'lucide-react';

export const PlansView: React.FC = () => {
  const { plans, metrics, openAddPlan, enrichedInstalments } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'emi' | 'loan'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'progress' | 'name'>('dueDate');

  const filteredPlans = plans.filter(p => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (sortBy === 'amount') {
      return b.monthly_amount_paise - a.monthly_amount_paise;
    }
    if (sortBy === 'progress') {
      const aPaid = enrichedInstalments.filter(i => i.plan_id === a.id && i.status === 'paid').length;
      const bPaid = enrichedInstalments.filter(i => i.plan_id === b.id && i.status === 'paid').length;
      return (bPaid / b.total_instalments) - (aPaid / a.total_instalments);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Default: Next due date
    const aNext = enrichedInstalments.find(i => i.plan_id === a.id && i.status !== 'paid');
    const bNext = enrichedInstalments.find(i => i.plan_id === b.id && i.status !== 'paid');
    const aDate = aNext ? aNext.due_date : '9999-99-99';
    const bDate = bNext ? bNext.due_date : '9999-99-99';
    return aDate.localeCompare(bDate);
  });

  const emiCount = plans.filter(p => p.type === 'emi').length;
  const loanCount = plans.filter(p => p.type === 'loan').length;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[0.68rem] font-bold tracking-widest uppercase text-emerald-800 dark:text-emerald-400">
            PLANS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Payment plans
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {plans.length} active {plans.length === 1 ? 'plan' : 'plans'} · {formatINR(metrics.monthScheduledPaise)} due this month
          </p>
        </div>

        <button
          onClick={() => openAddPlan()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#143D2B] text-white text-xs font-semibold hover:bg-[#1A4F38] active:scale-[0.98] transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add plan</span>
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs self-start">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            All plans <span className="opacity-70 ml-0.5">{plans.length}</span>
          </button>
          <button
            onClick={() => setFilterType('emi')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'emi'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            EMIs <span className="opacity-70 ml-0.5">{emiCount}</span>
          </button>
          <button
            onClick={() => setFilterType('loan')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'loan'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Personal loans <span className="opacity-70 ml-0.5">{loanCount}</span>
          </button>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span className="font-medium">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
          >
            <option value="dueDate">Next due date</option>
            <option value="amount">Monthly amount</option>
            <option value="progress">Completion %</option>
            <option value="name">Plan name</option>
          </select>
        </div>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}

        {/* Add a plan dashed card */}
        <button
          onClick={() => openAddPlan()}
          className="min-h-[220px] p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-600 bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 flex flex-col items-center justify-center text-center transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 text-slate-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white mt-3">
            Add a plan
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
            Track another EMI or personal loan in under a minute.
          </span>
        </button>
      </div>
    </div>
  );
};

