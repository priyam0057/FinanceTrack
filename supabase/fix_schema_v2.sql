-- Run this script in your Supabase Dashboard SQL Editor to allow API access
-- https://supabase.com/dashboard/project/_/sql

-- 1. Ensure Table Exists
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_recipient text,
  daily_report_enabled boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Add columns if not exist (idempotent)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'user_settings' and column_name = 'daily_report_enabled') then
        alter table public.user_settings add column daily_report_enabled boolean default false;
    end if;
    -- Removed SMTP columns check since we're not using them anymore
end $$;

-- 3. Enable RLS
alter table public.user_settings enable row level security;