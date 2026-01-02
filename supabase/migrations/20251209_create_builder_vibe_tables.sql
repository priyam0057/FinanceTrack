-- Daily Board (Journal)
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  mood text,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) not null
);

-- Idea Scratchpad
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  is_archived boolean default false,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) not null
);

-- Focus Mode Sessions
create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'focus' or 'break'
  duration_seconds integer not null,
  completed_at timestamptz not null default now(),
  user_id uuid references auth.users(id) not null
);

-- RLS Policies
alter table public.journal_entries enable row level security;
alter table public.ideas enable row level security;
alter table public.focus_sessions enable row level security;

-- Policies
create policy "Users can manage their own journal entries" on public.journal_entries
  for all using (auth.uid() = user_id);

create policy "Users can manage their own ideas" on public.ideas
  for all using (auth.uid() = user_id);

create policy "Users can manage their own focus sessions" on public.focus_sessions
  for all using (auth.uid() = user_id);
