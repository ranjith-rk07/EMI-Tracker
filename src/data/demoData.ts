import { Plan, Instalment, PaymentRecord } from '../types';
import { generatePlanInstalments, inrToPaise } from '../utils/calculations';

export const DEMO_REFERENCE_DATE = '2026-11-10';

export interface DemoFixture {
  plans: Plan[];
  instalments: Instalment[];
  paymentRecords: PaymentRecord[];
}

export function createDemoFixture(): DemoFixture {
  const plans: Plan[] = [
    {
      id: 'plan-phone-emi',
      name: 'Phone EMI',
      type: 'emi',
      lender_or_card: 'Example Card',
      monthly_amount_paise: inrToPaise(4000), // ₹4,000
      due_day: 5,
      first_instalment_date: '2026-08-05',
      total_instalments: 12,
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    },
    {
      id: 'plan-personal-loan',
      name: 'Personal loan',
      type: 'loan',
      lender_or_card: 'Example Bank',
      monthly_amount_paise: inrToPaise(7250), // ₹7,250
      due_day: 7,
      first_instalment_date: '2026-06-07',
      total_instalments: 18,
      created_at: '2026-06-01T00:00:00.000Z',
      updated_at: '2026-06-01T00:00:00.000Z',
    },
    {
      id: 'plan-laptop-emi',
      name: 'Laptop EMI',
      type: 'emi',
      lender_or_card: 'Example Card',
      monthly_amount_paise: inrToPaise(3000), // ₹3,000
      due_day: 15,
      first_instalment_date: '2026-10-15',
      total_instalments: 8,
      created_at: '2026-10-01T00:00:00.000Z',
      updated_at: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'plan-bike-emi',
      name: 'Bike EMI',
      type: 'emi',
      lender_or_card: 'Example Finance',
      monthly_amount_paise: inrToPaise(4250), // ₹4,250
      due_day: 24,
      first_instalment_date: '2026-03-24',
      total_instalments: 24,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    },
  ];

  let allInstalments: Instalment[] = [];
  const paymentRecords: PaymentRecord[] = [];

  // Plan 1: Phone EMI (12 instalments, first 4 recorded paid on their due dates: Aug 5, Sep 5, Oct 5, Nov 5)
  const phoneInstalments = generatePlanInstalments(
    plans[0].id,
    plans[0].due_day,
    plans[0].first_instalment_date,
    plans[0].total_instalments,
    plans[0].monthly_amount_paise
  );
  allInstalments = allInstalments.concat(phoneInstalments);
  for (let i = 0; i < 4; i++) {
    paymentRecords.push({
      id: `rec-phone-${i + 1}`,
      instalment_id: phoneInstalments[i].id,
      plan_id: plans[0].id,
      amount_paise: plans[0].monthly_amount_paise,
      payment_date: phoneInstalments[i].due_date,
      recorded_at: `${phoneInstalments[i].due_date}T10:00:00.000Z`,
      source: 'historical_declaration',
    });
  }

  // Plan 2: Personal loan (18 instalments, first 5 recorded paid on due dates: Jun 7, Jul 7, Aug 7, Sep 7, Oct 7)
  // Instalment 6 is Nov 7 2026 - NOT recorded! (Since today is Nov 10, this is 3 days past due -> "Needs check")
  const loanInstalments = generatePlanInstalments(
    plans[1].id,
    plans[1].due_day,
    plans[1].first_instalment_date,
    plans[1].total_instalments,
    plans[1].monthly_amount_paise
  );
  allInstalments = allInstalments.concat(loanInstalments);
  for (let i = 0; i < 5; i++) {
    paymentRecords.push({
      id: `rec-loan-${i + 1}`,
      instalment_id: loanInstalments[i].id,
      plan_id: plans[1].id,
      amount_paise: plans[1].monthly_amount_paise,
      payment_date: loanInstalments[i].due_date,
      recorded_at: `${loanInstalments[i].due_date}T11:00:00.000Z`,
      source: 'historical_declaration',
    });
  }

  // Plan 3: Laptop EMI (8 instalments, first 1 recorded paid: Oct 15)
  // Instalment 2 is Nov 15 2026 - NOT recorded! (In 5 days -> "Upcoming", next payment!)
  const laptopInstalments = generatePlanInstalments(
    plans[2].id,
    plans[2].due_day,
    plans[2].first_instalment_date,
    plans[2].total_instalments,
    plans[2].monthly_amount_paise
  );
  allInstalments = allInstalments.concat(laptopInstalments);
  paymentRecords.push({
    id: 'rec-laptop-1',
    instalment_id: laptopInstalments[0].id,
    plan_id: plans[2].id,
    amount_paise: plans[2].monthly_amount_paise,
    payment_date: laptopInstalments[0].due_date,
    recorded_at: `${laptopInstalments[0].due_date}T14:30:00.000Z`,
    source: 'historical_declaration',
  });

  // Plan 4: Bike EMI (24 instalments, first 8 recorded paid: Mar 24 .. Oct 24)
  // Instalment 9 is Nov 24 2026 - NOT recorded! (In 14 days -> "Upcoming")
  const bikeInstalments = generatePlanInstalments(
    plans[3].id,
    plans[3].due_day,
    plans[3].first_instalment_date,
    plans[3].total_instalments,
    plans[3].monthly_amount_paise
  );
  allInstalments = allInstalments.concat(bikeInstalments);
  for (let i = 0; i < 8; i++) {
    paymentRecords.push({
      id: `rec-bike-${i + 1}`,
      instalment_id: bikeInstalments[i].id,
      plan_id: plans[3].id,
      amount_paise: plans[3].monthly_amount_paise,
      payment_date: bikeInstalments[i].due_date,
      recorded_at: `${bikeInstalments[i].due_date}T09:15:00.000Z`,
      source: 'historical_declaration',
    });
  }

  return {
    plans,
    instalments: allInstalments,
    paymentRecords,
  };
}

