import React from 'react';

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
  lightText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ collapsed, className = '', lightText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon */}
      <div className="w-9 h-9 rounded-xl bg-white/10 dark:bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-emerald-400"
        >
          {/* Calendar sheet with bookmark/check */}
          <rect x="3" y="4" width="18" height="18" rx="4" fill="none" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M9 16l2 2 4-4" strokeWidth="2.5" />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col select-none">
          <span className={`text-[1.125rem] font-bold tracking-tight leading-tight ${lightText ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            Duewise<span className="text-emerald-400">.</span>
          </span>
          <span className={`text-[0.72rem] font-medium leading-none mt-0.5 ${lightText ? 'text-emerald-200/70' : 'text-slate-500 dark:text-slate-400'}`}>
            EMI & loan tracker
          </span>
        </div>
      )}
    </div>
  );
};

