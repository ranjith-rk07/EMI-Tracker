import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, CreditCard, ArrowRight, Plus, Calendar, History, Settings, HelpCircle, Sun, Moon, Download } from 'lucide-react';
import { formatINR } from '../../utils/calculations';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    closeSearch,
    plans,
    openPlanDetail,
    openAddPlan,
    setActiveTab,
    updateSettings,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Actions list
  const actions = [
    { id: 'act-add', label: 'Add a new payment plan', icon: Plus, handler: () => { closeSearch(); openAddPlan(); } },
    { id: 'act-overview', label: 'Go to Overview', icon: ArrowRight, handler: () => { closeSearch(); setActiveTab('overview'); } },
    { id: 'act-plans', label: 'View all payment plans', icon: CreditCard, handler: () => { closeSearch(); setActiveTab('plans'); } },
    { id: 'act-calendar', label: 'Open payment calendar', icon: Calendar, handler: () => { closeSearch(); setActiveTab('calendar'); } },
    { id: 'act-history', label: 'View payment history', icon: History, handler: () => { closeSearch(); setActiveTab('history'); } },
    { id: 'act-light', label: 'Switch to Light theme', icon: Sun, handler: () => { closeSearch(); updateSettings({ theme: 'light' }); } },
    { id: 'act-dark', label: 'Switch to Dark theme', icon: Moon, handler: () => { closeSearch(); updateSettings({ theme: 'dark' }); } },
    { id: 'act-settings', label: 'Open settings', icon: Settings, handler: () => { closeSearch(); setActiveTab('settings'); } },
    { id: 'act-help', label: 'Help & FAQ', icon: HelpCircle, handler: () => { closeSearch(); setActiveTab('help'); } },
  ];

  const q = query.trim().toLowerCase();

  // Matched plans
  const matchedPlans = plans.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.lender_or_card && p.lender_or_card.toLowerCase().includes(q)) ||
    p.type.toLowerCase().includes(q)
  );

  // Matched actions
  const matchedActions = actions.filter(a =>
    a.label.toLowerCase().includes(q)
  );

  const totalResults = matchedPlans.length + matchedActions.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (totalResults > 0 ? (prev + 1) % totalResults : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (totalResults > 0 ? (prev - 1 + totalResults) % totalResults : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < matchedPlans.length) {
        const targetPlan = matchedPlans[selectedIndex];
        closeSearch();
        openPlanDetail(targetPlan.id);
      } else {
        const actIndex = selectedIndex - matchedPlans.length;
        if (matchedActions[actIndex]) {
          matchedActions[actIndex].handler();
        }
      }
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeSearch}
      />

      {/* Search Panel */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search plans, lenders, or actions..."
            className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded text-[0.62rem] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching plans or actions found.
            </div>
          ) : (
            <>
              {/* Plans Section */}
              {matchedPlans.length > 0 && (
                <div className="py-1">
                  <span className="px-3 py-1 text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                    Plans
                  </span>
                  {matchedPlans.map((plan, i) => {
                    const isSelected = selectedIndex === i;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => {
                          closeSearch();
                          openPlanDetail(plan.id);
                        }}
                        className={`px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CreditCard className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs truncate">{plan.name}</span>
                            <span className="text-[0.65rem] text-slate-400 truncate">
                              {plan.type === 'emi' ? 'EMI' : 'Personal loan'}
                              {plan.lender_or_card ? ` · ${plan.lender_or_card}` : ''}
                            </span>
                          </div>
                        </div>

                        <span className="font-bold text-xs shrink-0 ml-2">
                          {formatINR(plan.monthly_amount_paise)} / mo
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions Section */}
              {matchedActions.length > 0 && (
                <div className="py-1">
                  <span className="px-3 py-1 text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                    Actions
                  </span>
                  {matchedActions.map((action, i) => {
                    const itemIndex = matchedPlans.length + i;
                    const isSelected = selectedIndex === itemIndex;
                    const Icon = action.icon;
                    return (
                      <div
                        key={action.id}
                        onClick={action.handler}
                        className={`px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                          <span className="font-medium text-xs">{action.label}</span>
                        </div>

                        <span className="text-[0.65rem] text-slate-400 font-semibold">Jump →</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[0.68rem] text-slate-400">
          <span>Navigate with ↑ ↓ and Enter</span>
          <span>Duewise Quick Search</span>
        </div>
      </div>
    </div>
  );
};

