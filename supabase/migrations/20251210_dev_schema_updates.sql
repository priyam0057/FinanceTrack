-- Project Updates Table
create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  date date not null default current_date,
  content text not null,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) not null
);

-- Enable RLS for project_updates
alter table public.project_updates enable row level security;

-- Policies for project_updates
create policy "Users can view their own project updates"
  on public.project_updates for select
  using (auth.uid() = user_id);

create policy "Users can insert their own project updates"
  on public.project_updates for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own project updates"
  on public.project_updates for update
  using (auth.uid() = user_id);

create policy "Users can delete their own project updates"
  on public.project_updates for delete
  using (auth.uid() = user_id);


-- User Settings Table (for Email Config)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_recipient text,
  daily_report_enabled boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS for user_settings
alter table public.user_settings enable row level security;

-- Policies for user_settings
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings update"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- Trigger to handle updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_user_settings_updated_at
before update on public.user_settings
for each row
execute function update_updated_at_column();
