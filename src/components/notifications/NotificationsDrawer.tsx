import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate, diffCalendarDays } from '../../utils/calculations';
import { StatusBadge } from '../common/Badge';
import { X, Bell, Check, Eye, AlertTriangle } from 'lucide-react';

export const NotificationsDrawer: React.FC = () => {
  const {
    isNotificationsOpen,
    closeNotifications,
    enrichedInstalments,
    currentReferenceDate,
    openMarkPaid,
    openPlanDetail,
  } = useApp();

  if (!isNotificationsOpen) return null;

  // Unrecorded payments that need attention: status === 'needs_check' or 'due_soon' or 'due_today'
  const attentionItems = enrichedInstalments
    .filter(i => i.status === 'needs_check' || i.status === 'due_soon' || i.status === 'due_today')
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeNotifications}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200 dark:border-slate-800 transition-colors animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Notifications
              </h3>
              <span className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                {attentionItems.length} {attentionItems.length === 1 ? 'item requires' : 'items require'} attention
              </span>
            </div>
          </div>

          <button
            onClick={closeNotifications}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Attention Items */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
          {attentionItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center">
              <Check className="w-8 h-8 text-emerald-500 mb-2" />
              <span className="font-bold text-slate-700 dark:text-slate-300">All caught up!</span>
              <span className="mt-0.5">No unrecorded payments requiring immediate attention.</span>
            </div>
          ) : (
            attentionItems.map((inst) => {
              const daysDiff = diffCalendarDays(inst.due_date, currentReferenceDate);
              let dueLabel = '';
              if (daysDiff < 0) {
                const abs = Math.abs(daysDiff);
                dueLabel = `${abs} ${abs === 1 ? 'day' : 'days'} overdue`;
              } else if (daysDiff === 0) {
                dueLabel = 'Due today';
              } else {
                dueLabel = `Due in ${daysDiff} days`;
              }

              return (
                <div
                  key={inst.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {inst.planName}
                      </span>
                      <span className="text-[0.68rem] text-slate-500 dark:text-slate-400 truncate">
                        Instalment {inst.sequence} of {inst.totalInstalments} · {dueLabel}
                      </span>
                    </div>

                    <span className="font-black text-xs text-slate-900 dark:text-white shrink-0">
                      {formatINR(inst.scheduled_amount_paise)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <StatusBadge status={inst.status} />

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          closeNotifications();
                          openPlanDetail(inst.plan_id);
                        }}
                        className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-[0.68rem] font-semibold"
                        title="View plan"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          closeNotifications();
                          openMarkPaid(inst);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1B5B3E] hover:bg-[#164831] text-white text-[0.68rem] font-bold shadow-2xs"
                      >
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>Mark paid</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-[0.68rem] text-slate-400 text-center">
          Unrecorded past-due payments update totals immediately when marked paid.
        </div>
      </div>
    </div>
  );
};

