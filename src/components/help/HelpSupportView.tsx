import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Keyboard } from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqItems = [
    {
      q: 'What does "Needs check" mean?',
      a: "A scheduled instalment due date has passed, but you haven't recorded a payment confirmation in Duewise yet. It is flagged as 'Needs check' so you can verify and record it to keep your totals accurate. A missing record does not mean your bank payment was missed.",
    },
    {
      q: 'How is my debt-free date calculated?',
      a: "Your debt-free milestone represents the latest scheduled final payment date among all your active plans. Duewise calculates this from your fixed instalment schedules and updates it whenever you record payments or add new plans.",
    },
    {
      q: 'What if my due day is the 31st?',
      a: "Duewise preserves your original due day! For shorter months (such as February with 28/29 days, or April with 30 days), the instalment is automatically scheduled for the last valid calendar day of that month, and returns to the 31st for 31-day months.",
    },
    {
      q: 'I recorded a payment by mistake.',
      a: "You can undo any recorded payment anytime. Either tap the paid month in the plan detail drawer or click the undo button (↺) in Payment History. This removes the record and recalculates your balances without affecting your bank.",
    },
    {
      q: 'Where is my data stored?',
      a: "In Demo and Guest modes, your plans and records are stored locally in your web browser (localStorage). When you sign in to a Duewise account, your records sync securely to your dedicated Supabase PostgreSQL database protected by Row Level Security.",
    },
    {
      q: 'How does "Add from a note" work?',
      a: "You can paste an SMS, loan agreement snippet, or quick note. Google Gemini extracts details like plan name, amount, due day, and tenure. You always get to review and fill missing details before anything is saved.",
    },
  ];

  const shortcuts = [
    { action: 'Search plans and actions', key: 'Ctrl K' },
    { action: 'Add a plan', key: 'N' },
    { action: 'Previous month', key: '[' },
    { action: 'Next month', key: ']' },
    { action: 'Close dialogs and panels', key: 'Esc' },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <span className="text-[0.68rem] font-bold tracking-widest uppercase text-emerald-800 dark:text-emerald-400">
          SUPPORT
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
          Help & support
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Quick answers about tracking EMIs and loans in Duewise.
        </p>
      </div>

      {/* 2 Column Layout: FAQ Left & Shortcuts Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* FAQ Accordion (2 Cols on lg) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Keyboard Shortcuts Card (1 Col on lg) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 transition-colors">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Keyboard shortcuts
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {shortcuts.map((sc, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">{sc.action}</span>
                <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[0.68rem] font-semibold font-mono shadow-2xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

