-- Run this script in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the table if it doesn't exist
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_recipient text,
  daily_report_enabled boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Ensure Row Level Security is enabled
alter table public.user_settings enable row level security;

-- 3. Add columns safely if they are missing (Upgrade path)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'user_settings' and column_name = 'daily_report_enabled') then
        alter table public.user_settings add column daily_report_enabled boolean default false;
    end if;

    -- Remove SMTP columns if they exist (cleanup from previous versions)
    if exists (select 1 from information_schema.columns where table_name = 'user_settings' and column_name = 'smtp_host') then
        -- Note: In PostgreSQL, we can't easily drop columns in this context
        -- The proper way is to use the migration script we created
    end if;
end $$;

-- 4. Re-apply Policies (Drop first to avoid conflicts)
drop policy if exists "Users can view their own settings" on public.user_settings;
drop policy if exists "Users can update their own settings" on public.user_settings;
drop policy if exists "Users can insert their own settings" on public.user_settings;
drop policy if exists "Users can update their own settings update" on public.user_settings;

create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- 5. Force Schema Cache Reload (Fixes the "column not found in schema cache" error)
NOTIFY pgrst, 'reload schema';