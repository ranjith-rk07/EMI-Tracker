-- Duewise: EMI & Personal Loan Tracking Schema
-- Versioned Migration: 20261112000000_create_duewise_schema.sql

-- 1. User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    reminder_window_days INT NOT NULL DEFAULT 3 CHECK (reminder_window_days IN (1, 3, 5, 7)),
    sidebar_collapsed BOOLEAN NOT NULL DEFAULT FALSE,
    remind_later_until DATE NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_settings_user UNIQUE (user_id)
);

-- 2. Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 100),
    type TEXT NOT NULL CHECK (type IN ('emi', 'loan')),
    lender_or_card TEXT NULL CHECK (lender_or_card IS NULL OR char_length(lender_or_card) <= 100),
    monthly_amount_paise BIGINT NOT NULL CHECK (monthly_amount_paise > 0),
    due_day INT NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    first_instalment_date DATE NOT NULL,
    total_instalments INT NOT NULL CHECK (total_instalments >= 1 AND total_instalments <= 360),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Instalments Table
CREATE TABLE IF NOT EXISTS public.instalments (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    sequence INT NOT NULL CHECK (sequence >= 1),
    due_date DATE NOT NULL,
    scheduled_amount_paise BIGINT NOT NULL CHECK (scheduled_amount_paise > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_plan_sequence UNIQUE (plan_id, sequence)
);

-- 4. Payment Records Table
CREATE TABLE IF NOT EXISTS public.payment_records (
    id TEXT PRIMARY KEY,
    instalment_id TEXT NOT NULL REFERENCES public.instalments(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    payment_date DATE NULL, -- Can be NULL for unknown historical declarations
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    source TEXT NOT NULL CHECK (source IN ('manual', 'historical_declaration')),
    CONSTRAINT uq_instalment_record UNIQUE (instalment_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_plans_user ON public.plans(user_id);
CREATE INDEX IF NOT EXISTS idx_instalments_plan ON public.instalments(plan_id);
CREATE INDEX IF NOT EXISTS idx_instalments_due_date ON public.instalments(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_records_plan ON public.payment_records(plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_instalment ON public.payment_records(instalment_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instalments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- ----------------- RLS POLICIES -----------------

-- user_settings: Users can only see and edit their own settings
CREATE POLICY "Users can view their own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- plans: Users can only access their own plans
CREATE POLICY "Users can view their own plans"
    ON public.plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans"
    ON public.plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
    ON public.plans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
    ON public.plans FOR DELETE
    USING (auth.uid() = user_id);

-- instalments: Inherit ownership check via plans table
CREATE POLICY "Users can view instalments of their plans"
    ON public.instalments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.plans
            WHERE plans.id = instalments.plan_id
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert instalments for their plans"
    ON public.instalments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.plans
            WHERE plans.id = instalments.plan_id
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update instalments of their plans"
    ON public.instalments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.plans
            WHERE plans.id = instalments.plan_id
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete instalments of their plans"
    ON public.instalments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.plans
            WHERE plans.id = instalments.plan_id
            AND plans.user_id = auth.uid()
        )
    );

-- payment_records: Inherit ownership check via plans table
CREATE POLICY "Users can view payment records of their plans"
    ON public.payment_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.plans
            WHERE plans.id = payment_records.plan_id
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert payment records for their plans"
    ON public.payment_records FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.plans
            WHERE plans.id = payment_records.plan_id
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update payment records of their plans"
    ON public.payment_records FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.plans
            WHERE plans.id = payment_records.plan_id
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete payment records of their plans"
    ON public.payment_records FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.plans
            WHERE plans.id = payment_records.plan_id
            AND plans.user_id = auth.uid()
        )
    );

