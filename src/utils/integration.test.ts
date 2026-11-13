import { describe, it, expect, beforeEach } from 'vitest';
import {
  generatePlanInstalments,
  enrichInstalments,
  calculateOverviewMetrics,
  formatINR,
  inrToPaise,
  paiseToInr,
} from './calculations';
import {
  loadDemoData,
  saveDemoData,
  resetDemoDataToFixture,
  loadGuestData,
  saveGuestData,
  clearGuestData,
  DEFAULT_SETTINGS,
} from './storage';
import { Plan, PaymentRecord, Instalment } from '../types';
import { parseNoteLocally } from '../services/gemini';

describe('Duewise Workflow and State Verification', () => {
  // In-memory mock localStorage for isolated testing
  const store: Record<string, string> = {};
  beforeEach(() => {
    for (const key in store) delete store[key];
    globalThis.localStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { for (const k in store) delete store[k]; },
      key: (i: number) => Object.keys(store)[i] || null,
      length: Object.keys(store).length,
    } as any;
  });

  it('verifies Add Plan → Record Payment → Undo Payment → Reload cycle', () => {
    // 1. Start fresh guest
    const initialGuest = loadGuestData();
    expect(initialGuest.plans.length).toBe(0);

    // 2. Add Plan: New TV EMI ₹2,500/mo for 6 instalments starting 2026-11-12
    const planId = 'test-tv-emi';
    const newPlan: Plan = {
      id: planId,
      name: 'TV EMI',
      type: 'emi',
      monthly_amount_paise: inrToPaise(2500),
      due_day: 12,
      first_instalment_date: '2026-11-12',
      total_instalments: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const insts = generatePlanInstalments(
      planId,
      newPlan.due_day,
      newPlan.first_instalment_date,
      newPlan.total_instalments,
      newPlan.monthly_amount_paise
    );
    expect(insts.length).toBe(6);

    saveGuestData([newPlan], insts, [], DEFAULT_SETTINGS);

    // Verify saved
    let loaded = loadGuestData();
    expect(loaded.plans.length).toBe(1);
    expect(loaded.instalments.length).toBe(6);
    expect(loaded.paymentRecords.length).toBe(0);

    // 3. Record payment for Instalment 1
    const recordId = 'rec-test-1';
    const paymentRecord: PaymentRecord = {
      id: recordId,
      instalment_id: insts[0].id,
      plan_id: planId,
      amount_paise: inrToPaise(2500),
      payment_date: '2026-11-12',
      recorded_at: new Date().toISOString(),
      source: 'manual',
    };

    saveGuestData([newPlan], insts, [paymentRecord], DEFAULT_SETTINGS);

    loaded = loadGuestData();
    expect(loaded.paymentRecords.length).toBe(1);

    const enriched = enrichInstalments(loaded.plans, loaded.instalments, loaded.paymentRecords, '2026-11-12', 3);
    expect(enriched[0].status).toBe('paid');
    expect(enriched[1].status).toBe('upcoming');

    let metrics = calculateOverviewMetrics(loaded.plans, enriched, '2026-11', '2026-11-12', null);
    expect(metrics.monthRecordedPaidPaise).toBe(inrToPaise(2500));
    expect(metrics.totalRecordedInstalments).toBe(1);

    // 4. Undo Payment
    saveGuestData([newPlan], insts, [], DEFAULT_SETTINGS);
    loaded = loadGuestData();
    expect(loaded.paymentRecords.length).toBe(0);

    const enrichedAfterUndo = enrichInstalments(loaded.plans, loaded.instalments, loaded.paymentRecords, '2026-11-12', 3);
    expect(enrichedAfterUndo[0].status).toBe('due_today'); // since currentDate is 2026-11-12 and due is 2026-11-12
    metrics = calculateOverviewMetrics(loaded.plans, enrichedAfterUndo, '2026-11', '2026-11-12', null);
    expect(metrics.monthRecordedPaidPaise).toBe(0);
    expect(metrics.totalRecordedInstalments).toBe(0);
  });

  it('handles multiple payments on the same date gracefully without collision', () => {
    const planA: Plan = {
      id: 'p-a',
      name: 'Plan A',
      type: 'emi',
      monthly_amount_paise: inrToPaise(1000),
      due_day: 15,
      first_instalment_date: '2026-11-15',
      total_instalments: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const planB: Plan = {
      id: 'p-b',
      name: 'Plan B',
      type: 'loan',
      monthly_amount_paise: inrToPaise(2000),
      due_day: 15,
      first_instalment_date: '2026-11-15',
      total_instalments: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const instsA = generatePlanInstalments('p-a', 15, '2026-11-15', 3, inrToPaise(1000));
    const instsB = generatePlanInstalments('p-b', 15, '2026-11-15', 3, inrToPaise(2000));

    const allPlans = [planA, planB];
    const allInsts = [...instsA, ...instsB];

    const enriched = enrichInstalments(allPlans, allInsts, [], '2026-11-10', 3);
    const day15Payments = enriched.filter(i => i.due_date === '2026-11-15');

    expect(day15Payments.length).toBe(2);
    expect(day15Payments[0].planName).toBe('Plan A');
    expect(day15Payments[1].planName).toBe('Plan B');
  });

  it('guarantees complete isolation between demo and guest storage', () => {
    // Populate demo
    const demo = resetDemoDataToFixture();
    expect(demo.plans.length).toBe(4);

    // Ensure guest is empty
    const guest = loadGuestData();
    expect(guest.plans.length).toBe(0);

    // Clear guest
    clearGuestData();

    // Re-check demo is still intact with 4 plans
    const loadedDemo = loadDemoData();
    expect(loadedDemo.plans.length).toBe(4);
    expect(loadedDemo.instalments.length).toBe(62);
  });

  it('handles empty state (no plans) gracefully', () => {
    const metrics = calculateOverviewMetrics([], [], '2026-11', '2026-11-10', null);
    expect(metrics.monthScheduledPaise).toBe(0);
    expect(metrics.totalProgressPercent).toBe(0);
    expect(metrics.nextPaymentInstalment).toBeNull();
    expect(metrics.attentionBannerInstalment).toBeNull();
  });

  it('validates AI deterministic note parser output structure', () => {
    const text = 'Bought a TV on EMI — ₹2,500 a month for 10 months, due on the 12th';
    const parsed = parseNoteLocally(text);

    expect(parsed.monthly_amount_inr).toBe(2500);
    expect(parsed.total_instalments).toBe(10);
    expect(parsed.due_day).toBe(12);
    expect(parsed.type).toBe('emi');
    expect(parsed.name).toContain('TV');
  });
});

