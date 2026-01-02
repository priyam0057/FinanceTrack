-- Remove SMTP columns from user_settings table
-- This migration removes the SMTP configuration columns since we're switching to Resend API

-- First, we need to drop and recreate the table without the SMTP columns
-- Since SQLite doesn't support DROP COLUMN, we need to recreate the table

-- Step 1: Create new table without SMTP columns
CREATE TABLE IF NOT EXISTS public.user_settings_new (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_recipient text,
  daily_report_enabled boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Step 2: Copy existing data (only the columns we're keeping)
INSERT INTO public.user_settings_new (
  user_id,
  email_recipient,
  daily_report_enabled,
  created_at,
  updated_at
)
SELECT 
  user_id,
  email_recipient,
  daily_report_enabled,
  created_at,
  updated_at
FROM public.user_settings
WHERE user_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  email_recipient = EXCLUDED.email_recipient,
  daily_report_enabled = EXCLUDED.daily_report_enabled,
  updated_at = EXCLUDED.updated_at;

-- Step 3: Drop old table
DROP TABLE public.user_settings;

-- Step 4: Rename new table to original name
ALTER TABLE public.user_settings_new RENAME TO user_settings;

-- Step 5: Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Step 6: Recreate policies
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 7: Recreate trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';