# Duewise — Personal Loan & EMI Tracker

Duewise is a complete, production-grade EMI and personal-loan tracking application built with React, TypeScript, Vite, Tailwind CSS, Supabase, and Google Gemini. It faithfully implements the Figma design specifications and screenshot references down to every rupee, day, badge, chart curve, and responsive interaction.

---

## 🌟 Key Features

1. **Faithful Visual Design & Shared Design Tokens**
   - Deep forest green application shell (`#143D2B`), collapsible sidebar, and pale neutral rounded main workspace (`#F4F7F5`).
   - Lush dark green hero gradient for the next-payment card with timeline tracker.
   - Restrained white cards, mint status surfaces (`#DEF7EC`), and warm amber attention states (`#FEF3C7`).
   - Authentic finance photography preserved for split-screen authentication.
   - Light, Dark, and Auto (system-following) themes with persistent user preferences.

2. **Three Isolated Storage Modes**
   - **Demo Mode**: Isolated reference fixture (as of 10 November 2026) showcasing 4 active plans with past-due checks, upcoming payments, and repayment progress.
   - **Guest Mode**: 100% private local tracking stored in your browser (`localStorage`).
   - **Account Mode**: Authenticated multi-device sync powered by Supabase PostgreSQL with strict Row Level Security (RLS).
   - "Start tracking" smoothly transitions from Demo into Guest without erasing personal records.

3. **Independently Testable Payment Calculation Engine**
   - Integer paise storage (avoiding IEEE floating point errors) with Indian number formatting (`₹2,15,250`, `₹18,500`).
   - Preserves original due days: a plan due on the 31st adjusts to the 28th/29th in February and 30th in April, returning to the 31st in May.
   - Calendar day comparisons in `Asia/Kolkata` time zone to eliminate UTC off-by-one shifts.
   - Dynamic payment statuses: `Paid`, `Needs check`, `Due today`, `Due soon`, and `Upcoming`.

4. **Overview & Analytics Dashboard**
   - Attention banner for past-due instalments with "Remind me later" day-snooze and quick payment actions.
   - Hero next-payment card showing the earliest unrecorded instalment due today or later, plus a month-at-a-glance timeline.
   - 4 summary metric cards (Due in Month, Paid, Left to pay, Scheduled amount left).
   - Interactive payment schedule table with type filters (All, EMIs, Loans) and quick "Mark paid" buttons.
   - Repayment progress card showing overall completion percentage and individual plan breakdowns.
   - Monthly commitment area chart with Total / By-plan views and clickable month navigation.

5. **Plan Detail Drawer & Interactive Instalments**
   - Slide-over drawer with circular SVG completion ring, 2x2 stat tiles, and interactive month grid.
   - Tapping any month records or undoes that payment with clear user confirmation disclaimers.

6. **Payment Calendar & Payment History**
   - Monthly calendar grid highlighting today, payment events, and selected-date agenda panel.
   - Payment history grouped by month (newest first) with plan filters and working CSV export.

7. **"Add from a Note" Powered by Gemini**
   - Paste natural language text (e.g. *"Bought a TV on EMI — ₹2,500 a month for 10 months, due on the 12th"*).
   - Uses Google Gemini API with structured JSON output and a deterministic local fallback parser.
   - Mandatory user review step before saving; AI never automatically marks payments as paid.

8. **Keyboard Accessibility & Shortcuts**
   - `Ctrl/Cmd + K`: Fast plan & action search modal.
   - `N`: Add a payment plan.
   - `[` / `]`: Previous and next month navigation.
   - `Esc`: Close dialogs and panels.

---

## 📐 Benchmark Reference Demo Data (10 November 2026)

| Plan | Type | Monthly Amount | First Due Date | Total Instalments | Recorded Paid |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phone EMI** | EMI | ₹4,000 | 5 Aug 2026 | 12 | 4 (Aug, Sep, Oct, Nov) |
| **Personal loan** | Loan | ₹7,250 | 7 Jun 2026 | 18 | 5 (Jun, Jul, Aug, Sep, Oct; 7 Nov unrecorded) |
| **Laptop EMI** | EMI | ₹3,000 | 15 Oct 2026 | 8 | 1 (Oct; 15 Nov due in 5 days) |
| **Bike EMI** | EMI | ₹4,250 | 24 Mar 2026 | 24 | 8 (Mar–Oct; 24 Nov due in 14 days) |

### Verified Results:
- **November scheduled**: ₹18,500
- **November recorded paid**: ₹4,000
- **November unrecorded**: ₹14,500
- **Total recorded**: ₹89,250
- **Remaining scheduled amount**: ₹2,15,250
- **Recorded instalments**: 18 of 62 (~29%)
- **Next upcoming payment**: Laptop EMI, ₹3,000, 15 November
- **Attention banner**: Personal loan payment on 7 November ("Needs check")
- **Latest scheduled final payment**: February 2028 ("Debt-free by Feb 2028")

---

## 🛠️ Project Structure

```
duewise/
├── public/
│   └── auth-finance-photo.jpg            # Authentic finance photo asset from design
├── src/
│   ├── types/
│   │   └── index.ts                      # Core TypeScript definitions
│   ├── utils/
│   │   ├── calculations.ts               # Independently testable payment calculation engine
│   │   ├── calculations.test.ts          # Unit test suite verifying math & demo fixture
│   │   ├── integration.test.ts           # State machine & lifecycle integration tests
│   │   └── storage.ts                    # LocalStorage adapters for Demo & Guest modes
│   ├── services/
│   │   ├── supabase.ts                   # Supabase client, Auth, and Account database sync
│   │   └── gemini.ts                     # Gemini Structured Output API & local parser fallback
│   ├── context/
│   │   ├── AppContext.tsx                # Central state manager (plans, payments, metrics, modals)
│   │   └── AuthContext.tsx               # Supabase session and auth state
│   ├── components/
│   │   ├── common/                       # Brand logo, status badges, modals
│   │   ├── layout/                       # Collapsible sidebar, header, responsive workspace
│   │   ├── overview/                     # AttentionBanner, NextPaymentCard, MetricsGrid, ScheduleTable, etc.
│   │   ├── plans/                        # PlanCard, PlanDetailDrawer, AddEditPlanModal
│   │   ├── calendar/                     # MonthCalendar, DayDetailPanel
│   │   ├── history/                      # Grouped PaymentHistoryView, CSV Export
│   │   ├── settings/                     # SettingsView (Appearance, Reminders, Data management)
│   │   ├── help/                         # HelpSupportView (FAQ accordion, keyboard shortcuts)
│   │   ├── search/                       # SearchModal (Ctrl+K)
│   │   ├── notifications/                # NotificationsDrawer
│   │   ├── payment/                      # MarkPaidModal, UndoPaidModal
│   │   └── auth/                         # Split-screen AuthModal (Email, Phone OTP, Google OAuth)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── migrations/
│   │   └── 20261112000000_create_duewise_schema.sql  # Versioned SQL migration with RLS policies
│   └── functions/
│       └── parse-note/index.ts           # Supabase Edge Function for Gemini note parsing
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Unit and Integration Tests
```bash
npm test
```
Runs Vitest verifying all calculation rules, date shifts, leap year handling, and storage isolation.

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Supabase Backend & Authentication Setup

### 1. Database Schema & Migrations
1. In your [Supabase Dashboard](https://supabase.com/dashboard), navigate to the **SQL Editor**.
2. Open `supabase/migrations/20261112000000_create_duewise_schema.sql`.
3. Run the script. This creates:
   - `user_settings`
   - `plans`
   - `instalments`
   - `payment_records`
   - Indexes and Row Level Security (RLS) policies ensuring users only ever access their own financial records.

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
VITE_GEMINI_API_KEY=<your-gemini-api-key>
```

### 3. Configure Authentication Providers
- **Email & Password**: Enabled by default in Supabase Auth.
- **Phone (SMS OTP)**: In Supabase Dashboard > Authentication > Providers > Phone, enable Phone provider and configure an SMS gateway (Twilio, MessageBird, or Vonage).
- **Google Sign-In**: In Authentication > Providers > Google, input your Google OAuth Client ID and Secret, and configure the redirect URL to match your domain.

### 4. Deploying the Supabase Edge Function for AI Notes
```bash
supabase functions deploy parse-note --no-verify-jwt
supabase secrets set GEMINI_API_KEY="your-gemini-api-key"
```

---

## 🔒 Security & Privacy Commitments
- Payment recording in Duewise is a user confirmation declaration; it never connects to or moves bank funds.
- Submitted note texts are strictly parsed as data and never executed as prompt instructions.
- Guest and Demo data remain 100% inside your browser's local storage and are never uploaded without an authenticated user account.

