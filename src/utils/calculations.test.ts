import { describe, it, expect } from 'vitest';
import {
  formatINR,
  inrToPaise,
  paiseToInr,
  generatePlanInstalments,
  computeInstalmentStatus,
  enrichInstalments,
  calculateOverviewMetrics,
  generateMonthlyCommitmentChartData,
  diffCalendarDays,
  getKolkataDateString,
} from './calculations';
import { createDemoFixture, DEMO_REFERENCE_DATE } from '../data/demoData';

describe('Payment calculations and formatting engine', () => {
  it('formats INR according to Indian number system', () => {
    expect(formatINR(inrToPaise(4000))).toBe('₹4,000');
    expect(formatINR(inrToPaise(18500))).toBe('₹18,500');
    expect(formatINR(inrToPaise(89250))).toBe('₹89,250');
    expect(formatINR(inrToPaise(215250))).toBe('₹2,15,250');
    expect(formatINR(inrToPaise(10000000))).toBe('₹1,00,00,000');
  });

  it('preserves the original due day across shorter months and returns to 31st', () => {
    // 31st due day starting Jan 2024 (2024 is a leap year)
    const instalments = generatePlanInstalments('p31', 31, '2024-01-31', 5, inrToPaise(1000));
    expect(instalments[0].due_date).toBe('2024-01-31');
    expect(instalments[1].due_date).toBe('2024-02-29'); // Feb in leap year
    expect(instalments[2].due_date).toBe('2024-03-31'); // Mar returns to 31st
    expect(instalments[3].due_date).toBe('2024-04-30'); // Apr 30
    expect(instalments[4].due_date).toBe('2024-05-31'); // May returns to 31st
  });

  it('correctly handles non-leap year February for 31st due day', () => {
    const instalments = generatePlanInstalments('p31-nonleap', 31, '2025-01-31', 3, inrToPaise(1000));
    expect(instalments[0].due_date).toBe('2025-01-31');
    expect(instalments[1].due_date).toBe('2025-02-28'); // Feb 28
    expect(instalments[2].due_date).toBe('2025-03-31'); // Mar 31
  });

  it('calculates calendar day differences without UTC drift', () => {
    expect(diffCalendarDays('2026-11-15', '2026-11-10')).toBe(5);
    expect(diffCalendarDays('2026-11-07', '2026-11-10')).toBe(-3);
    expect(diffCalendarDays('2026-11-10', '2026-11-10')).toBe(0);
  });

  it('matches all exact fixture requirements from Section 15', () => {
    const demo = createDemoFixture();
    expect(demo.plans.length).toBe(4);
    expect(demo.instalments.length).toBe(62);
    expect(demo.paymentRecords.length).toBe(18);

    const enriched = enrichInstalments(
      demo.plans,
      demo.instalments,
      demo.paymentRecords,
      DEMO_REFERENCE_DATE,
      3
    );

    const metrics = calculateOverviewMetrics(
      demo.plans,
      enriched,
      '2026-11',
      DEMO_REFERENCE_DATE,
      null
    );

    // 1. November scheduled: ₹18,500
    expect(metrics.monthScheduledPaise).toBe(inrToPaise(18500));
    expect(formatINR(metrics.monthScheduledPaise)).toBe('₹18,500');

    // 2. November recorded paid: ₹4,000
    expect(metrics.monthRecordedPaidPaise).toBe(inrToPaise(4000));
    expect(formatINR(metrics.monthRecordedPaidPaise)).toBe('₹4,000');

    // 3. November unrecorded: ₹14,500
    expect(metrics.monthUnrecordedPaise).toBe(inrToPaise(14500));
    expect(formatINR(metrics.monthUnrecordedPaise)).toBe('₹14,500');

    // 4. Total recorded: ₹89,250
    expect(metrics.totalRecordedPaise).toBe(inrToPaise(89250));
    expect(formatINR(metrics.totalRecordedPaise)).toBe('₹89,250');

    // 5. Remaining scheduled amount: ₹2,15,250
    expect(metrics.totalRemainingScheduledPaise).toBe(inrToPaise(215250));
    expect(formatINR(metrics.totalRemainingScheduledPaise)).toBe('₹2,15,250');

    // 6. Recorded instalments: 18 of 62, approximately 29%
    expect(metrics.totalRecordedInstalments).toBe(18);
    expect(metrics.totalInstalments).toBe(62);
    expect(metrics.totalProgressPercent).toBe(29);

    // 7. Next upcoming payment: Laptop EMI, ₹3,000, 15 November
    expect(metrics.nextPaymentInstalment).not.toBeNull();
    expect(metrics.nextPaymentInstalment?.planName).toBe('Laptop EMI');
    expect(metrics.nextPaymentInstalment?.scheduled_amount_paise).toBe(inrToPaise(3000));
    expect(metrics.nextPaymentInstalment?.due_date).toBe('2026-11-15');

    // 8. Personal loan payment on 7 November: Needs check
    expect(metrics.attentionBannerInstalment).not.toBeNull();
    expect(metrics.attentionBannerInstalment?.planName).toBe('Personal loan');
    expect(metrics.attentionBannerInstalment?.due_date).toBe('2026-11-07');
    expect(metrics.attentionBannerInstalment?.status).toBe('needs_check');

    // 9. Latest scheduled final payment: February 2028
    expect(metrics.latestFinalPaymentDate?.startsWith('2028-02')).toBe(true);
  });

  it('commitment chart generates accurate multi-month points and peak commitment', () => {
    const demo = createDemoFixture();
    const enriched = enrichInstalments(
      demo.plans,
      demo.instalments,
      demo.paymentRecords,
      DEMO_REFERENCE_DATE,
      3
    );

    const chartPoints = generateMonthlyCommitmentChartData(
      demo.plans,
      enriched,
      DEMO_REFERENCE_DATE
    );

    expect(chartPoints.length).toBeGreaterThan(0);
    // Find point for Nov '26
    const novPoint = chartPoints.find(p => p.monthKey === '2026-11');
    expect(novPoint).toBeDefined();
    expect(novPoint?.totalScheduledPaise).toBe(inrToPaise(18500));
    expect(novPoint?.isCurrentMonth).toBe(true);
  });
});

