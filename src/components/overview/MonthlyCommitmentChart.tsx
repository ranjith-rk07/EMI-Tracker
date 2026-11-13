import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  generateMonthlyCommitmentChartData,
  formatINR,
  formatDate,
} from '../../utils/calculations';

export const MonthlyCommitmentChart: React.FC = () => {
  const {
    plans,
    enrichedInstalments,
    currentReferenceDate,
    selectedMonthKey,
    setSelectedMonthKey,
    metrics,
  } = useApp();

  const [viewMode, setViewMode] = useState<'total' | 'byPlan'>('total');

  const chartData = useMemo(() => {
    return generateMonthlyCommitmentChartData(plans, enrichedInstalments, currentReferenceDate);
  }, [plans, enrichedInstalments, currentReferenceDate]);

  const debtFreeDateFormatted = metrics.latestFinalPaymentDate
    ? formatDate(metrics.latestFinalPaymentDate, 'month-year')
    : '—';

  // SVG dimensions
  const width = 800;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max value for scale
  const maxPaise = Math.max(metrics.peakMonthlyCommitmentPaise, 2000000); // at least 20k INR
  const yTicks = [2000000, 1500000, 1000000, 500000, 0];

  const points = chartData.map((pt, i) => {
    const x = chartData.length > 1
      ? paddingLeft + (i / (chartData.length - 1)) * chartWidth
      : paddingLeft + chartWidth / 2;
    const y = paddingTop + chartHeight - (pt.totalScheduledPaise / maxPaise) * chartHeight;
    return { ...pt, x, y };
  });

  // Split into past/current (solid) and future (dashed) paths
  const currentIdx = points.findIndex(p => p.monthKey === currentReferenceDate.substring(0, 7));
  const effectiveCurrentIdx = currentIdx >= 0 ? currentIdx : 0;

  const pastPoints = points.slice(0, effectiveCurrentIdx + 1);
  const futurePoints = points.slice(effectiveCurrentIdx);

  const pastPath = pastPoints.length > 1
    ? pastPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  const futurePath = futurePoints.length > 1
    ? futurePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  // Area path for gradient fill
  const areaPath = points.length > 1
    ? `${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')} L ${points[points.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`
    : '';

  const currentMonthPoint = points[effectiveCurrentIdx];

  const planColors = ['#1B5B3E', '#D97706', '#0D9488', '#65A30D'];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 transition-colors">
      {/* Header and Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Monthly commitment
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            What leaves your account each month. Click a month to open its schedule.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'total'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setViewMode('byPlan')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'byPlan'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            By plan
          </button>
        </div>
      </div>

      {/* Metric Callouts */}
      <div className="grid grid-cols-3 gap-4 my-4 max-w-md">
        <div>
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider block">Peak month</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">
            {formatINR(metrics.peakMonthlyCommitmentPaise)}
          </span>
        </div>
        <div>
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider block">Still to repay</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">
            {formatINR(metrics.totalRemainingScheduledPaise)}
          </span>
        </div>
        <div>
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider block">Debt-free</span>
          <span className="text-lg font-black text-[#1B5B3E] dark:text-emerald-400">
            {debtFreeDateFormatted}
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto select-none mt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[600px] overflow-visible"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B5B3E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1B5B3E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines & Y-axis labels */}
          {yTicks.map((val) => {
            const y = paddingTop + chartHeight - (val / maxPaise) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] font-medium fill-slate-400 dark:fill-slate-500"
                >
                  {val === 0 ? '₹0' : `₹${val / 100000}k`}
                </text>
              </g>
            );
          })}

          {/* Current Month Vertical Band & Today Pill */}
          {currentMonthPoint && (
            <g>
              <rect
                x={currentMonthPoint.x - 16}
                y={paddingTop}
                width={32}
                height={chartHeight}
                fill="#1B5B3E"
                opacity="0.08"
                rx="6"
              />
              <line
                x1={currentMonthPoint.x}
                y1={paddingTop}
                x2={currentMonthPoint.x}
                y2={paddingTop + chartHeight}
                stroke="#1B5B3E"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              {/* Today Badge */}
              <g transform={`translate(${currentMonthPoint.x}, ${paddingTop - 14})`}>
                <rect
                  x="-20"
                  y="-12"
                  width="40"
                  height="18"
                  rx="9"
                  fill="#143D2B"
                />
                <text
                  x="0"
                  y="1"
                  textAnchor="middle"
                  fill="#ffffff"
                  className="text-[9px] font-bold"
                >
                  Today
                </text>
              </g>
            </g>
          )}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#chartGradient)"
            />
          )}

          {/* Solid line for Past / Current */}
          {pastPath && (
            <path
              d={pastPath}
              fill="none"
              stroke="#1B5B3E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Dashed line for Future */}
          {futurePath && (
            <path
              d={futurePath}
              fill="none"
              stroke="#1B5B3E"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Month Dots and X-axis labels */}
          {points.map((pt, idx) => {
            const isSelected = pt.monthKey === selectedMonthKey;
            const showLabel = idx % 2 === 0 || idx === points.length - 1;

            return (
              <g key={pt.monthKey} className="cursor-pointer" onClick={() => setSelectedMonthKey(pt.monthKey)}>
                {/* Clickable transparent column */}
                <rect
                  x={pt.x - 14}
                  y={paddingTop}
                  width={28}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                />

                {/* Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 5 : pt.isCurrentMonth ? 4 : 3}
                  fill={isSelected ? '#103726' : '#1B5B3E'}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2 : 1.5}
                  className="transition-all hover:scale-125"
                />

                {/* X-axis Label */}
                {showLabel && (
                  <text
                    x={pt.x}
                    y={paddingTop + chartHeight + 20}
                    textAnchor="middle"
                    className={`text-[10px] font-medium ${
                      isSelected
                        ? 'fill-slate-900 dark:fill-white font-bold'
                        : pt.isCurrentMonth
                        ? 'fill-[#1B5B3E] font-bold'
                        : 'fill-slate-400 dark:fill-slate-500'
                    }`}
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Plan Legend when By Plan is active */}
      {viewMode === 'byPlan' && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
          {plans.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: planColors[idx % planColors.length] }}
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">{p.name}</span>
              <span className="text-slate-400">({formatINR(p.monthly_amount_paise)})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

