import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parseNoteWithGemini } from '../../services/gemini';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { inrToPaise } from '../../utils/calculations';

export const AddFromNoteCard: React.FC = () => {
  const { openAddPlan } = useApp();
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleNote = 'Bought a TV on EMI — ₹2,500 a month for 10 months, due on the 12th';

  const handleTryExample = () => {
    setNoteText(sampleNote);
    setError(null);
  };

  const handleReadNote = async () => {
    if (!noteText.trim()) {
      setError('Please type or paste a note first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsed = await parseNoteWithGemini(noteText);

      // Open AddPlan modal prefilled with parsed data for user review
      openAddPlan({
        name: parsed.name || 'New Plan',
        type: parsed.type || 'emi',
        lender_or_card: parsed.lender_or_card || '',
        monthly_amount_paise: parsed.monthly_amount_inr ? inrToPaise(parsed.monthly_amount_inr) : 0,
        due_day: parsed.due_day || 5,
        total_instalments: parsed.total_instalments || 12,
        first_instalment_date: `${parsed.first_instalment_year || 2026}-${(parsed.first_instalment_month || 12).toString().padStart(2, '0')}-${(parsed.due_day || 5).toString().padStart(2, '0')}`,
      });
      setNoteText('');
    } catch (err: any) {
      console.error('Note parsing error:', err);
      setError(err?.message || 'Failed to parse note. You can enter details manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1B5B3E] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[0.68rem] font-semibold flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            AI preview
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
          Add from a note
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Paste an SMS, email or note. We pull out the details for you to review — nothing is saved until you confirm.
        </p>

        {/* Input Textarea */}
        <div className="mt-3.5">
          <textarea
            value={noteText}
            onChange={(e) => {
              setNoteText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Bought a TV on EMI — ₹2,500 a month for 10 months, due on the 12th"
            rows={3}
            maxLength={1000}
            className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1B5B3E] resize-none transition-all"
          />
          {error && (
            <p className="text-[0.72rem] text-rose-600 dark:text-rose-400 mt-1 font-medium">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <button
          onClick={handleTryExample}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Try an example
        </button>

        <button
          onClick={handleReadNote}
          disabled={loading || !noteText.trim()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1B5B3E] hover:bg-[#164831] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Reading...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Read note</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

