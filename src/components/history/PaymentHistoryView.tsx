import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate, paiseToInr } from '../../utils/calculations';
import {
  Download,
  RotateCcw,
  Smartphone,
  Laptop,
  Bike,
  Landmark,
  CreditCard,
  History
} from 'lucide-react';
import { PaymentRecord, Plan, Instalment } from '../../types';

export const PaymentHistoryView: React.FC = () => {
  const {
    paymentRecords,
    plans,
    instalments,
    enrichedInstalments,
    openPlanDetail,
    openUndoPaid,
  } = useApp();

  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');

  // Enriched history records
  const enrichedRecords = useMemo(() => {
    const planMap = new Map<string, Plan>();
    plans.forEach(p => planMap.set(p.id, p));

    const instMap = new Map<string, Instalment>();
    instalments.forEach(i => instMap.set(i.id, i));

    return paymentRecords.map(r => {
      const plan = planMap.get(r.plan_id);
      const inst = instMap.get(r.instalment_id);

      // Determine month group: based on actual payment_date if known, or scheduled due_date, or recorded_at
      const effectiveDate = r.payment_date || inst?.due_date || r.recorded_at.substring(0, 10);
      const monthKey = effectiveDate.substring(0, 7);

      return {
        ...r,
        planName: plan ? plan.name : 'Unknown Plan',
        planType: plan ? plan.type : 'emi',
        lenderOrCard: plan?.lender_or_card,
        sequence: inst ? inst.sequence : 1,
        totalInstalments: plan ? plan.total_instalments : 1,
        dueDate: inst ? inst.due_date : '',
        effectiveDate,
        monthKey,
      };
    });
  }, [paymentRecords, plans, instalments]);

  // Filter records
  const filteredRecords = useMemo(() => {
    if (selectedPlanFilter === 'all') return enrichedRecords;
    return enrichedRecords.filter(r => r.plan_id === selectedPlanFilter);
  }, [enrichedRecords, selectedPlanFilter]);

  // Total stats for history
  const totalRecordedPaise = useMemo(() => {
    return filteredRecords.reduce((acc, r) => acc + r.amount_paise, 0);
  }, [filteredRecords]);

  const uniquePlansCount = useMemo(() => {
    const set = new Set(filteredRecords.map(r => r.plan_id));
    return set.size;
  }, [filteredRecords]);

  // Group by Month (newest month first)
  const groupedByMonth = useMemo(() => {
    const groups = new Map<string, typeof filteredRecords>();
    
    // Sort records newest first by effectiveDate
    const sorted = [...filteredRecords].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

    sorted.forEach(r => {
      if (!groups.has(r.monthKey)) {
        groups.set(r.monthKey, []);
      }
      groups.get(r.monthKey)!.push(r);
    });

    return Array.from(groups.entries()).map(([monthKey, recs]) => {
      const [y, m] = monthKey.split('-').map(Number);
      const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'long',
        year: 'numeric',
      });
      const totalPaise = recs.reduce((sum, r) => sum + r.amount_paise, 0);

      return {
        monthKey,
        label,
        records: recs,
        totalPaise,
      };
    });
  }, [filteredRecords]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Plan Name',
      'Plan Type',
      'Lender / Card',
      'Instalment Number',
      'Total Instalments',
      'Scheduled Due Date',
      'Actual Payment Date',
      'Amount (INR)',
      'Recording Source',
      'Recorded Timestamp',
    ];

    const rows = filteredRecords.map(r => [
      `"${r.planName.replace(/"/g, '""')}"`,
      `"${r.planType}"`,
      `"${(r.lenderOrCard || '').replace(/"/g, '""')}"`,
      r.sequence,
      r.totalInstalments,
      r.dueDate || '',
      r.payment_date || 'Payment date not provided',
      paiseToInr(r.amount_paise),
      r.source,
      r.recorded_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `duewise-payment-history-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getIcon = (name: string, type: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('phone')) return Smartphone;
    if (lower.includes('laptop')) return Laptop;
    if (lower.includes('bike')) return Bike;
    if (type === 'loan' || lower.includes('loan')) return Landmark;
    return CreditCard;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[0.68rem] font-bold tracking-widest uppercase text-emerald-800 dark:text-emerald-400">
            HISTORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Payment history
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Every instalment you've recorded, newest first.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredRecords.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total recorded</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">
            {formatINR(totalRecordedPaise)}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Payments</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">
            {filteredRecords.length}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Plans</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">
            {uniquePlansCount}
          </span>
        </div>
      </div>

      {/* Main Section: Plan Filter & Grouped History List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 transition-colors">
        {/* Header & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recorded payments
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">Plan</span>
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
            >
              <option value="all">All plans</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grouped Month Lists */}
        <div className="mt-4 flex flex-col gap-6">
          {groupedByMonth.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
              <History className="w-8 h-8 opacity-40 mb-2" />
              <span>No recorded payments found.</span>
            </div>
          ) : (
            groupedByMonth.map((group) => (
              <div key={group.monthKey} className="flex flex-col gap-2">
                {/* Month Group Header */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2 py-1 bg-slate-50/80 dark:bg-slate-800/40 rounded-lg">
                  <span>{group.label}</span>
                  <span>
                    {group.records.length} {group.records.length === 1 ? 'payment' : 'payments'} · {formatINR(group.totalPaise)}
                  </span>
                </div>

                {/* Records under this Month */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {group.records.map((rec) => {
                    const Icon = getIcon(rec.planName, rec.planType);
                    const matchingInst = enrichedInstalments.find(i => i.id === rec.instalment_id);

                    return (
                      <div
                        key={rec.id}
                        className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/30 rounded-xl transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <button
                              onClick={() => openPlanDetail(rec.plan_id)}
                              className="font-bold text-xs text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 text-left truncate"
                            >
                              {rec.planName}
                            </button>
                            <span className="text-[0.68rem] text-slate-500 dark:text-slate-400 truncate">
                              Instalment {rec.sequence} of {rec.totalInstalments} ·{' '}
                              {rec.payment_date
                                ? `recorded ${formatDate(rec.payment_date, 'day-month')}`
                                : 'Payment date not provided'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {formatINR(rec.amount_paise)}
                          </span>

                          {matchingInst && (
                            <button
                              onClick={() => openUndoPaid(matchingInst)}
                              title="Undo payment record"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

