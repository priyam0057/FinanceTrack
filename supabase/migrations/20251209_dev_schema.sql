-- Create tables for Dev Project Management

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  github_url text,
  live_url text,
  tech_stack text[] not null default '{}',
  phase text not null,
  is_favorite boolean default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users(id) not null
);

-- Dev Notes
create table if not exists public.dev_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text not null,
  status text not null,
  priority text not null,
  assignee text,
  due_date timestamptz,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Issues
create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text not null,
  steps_to_reproduce text not null,
  expected_behavior text,
  actual_behavior text,
  environment text not null,
  severity text not null,
  status text not null,
  related_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

-- Secrets
create table if not exists public.secrets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  description text,
  value text not null,
  type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Team Members
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  role text not null,
  email text not null,
  phone text,
  github_url text,
  linkedin_url text,
  notes text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text not null,
  status text not null,
  priority text not null,
  target_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backups
create table if not exists public.backups (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  file_name text not null,
  file_size bigint not null,
  description text,
  google_drive_file_id text,
  uploaded_at timestamptz not null default now()
);

-- RLS Policies
alter table public.projects enable row level security;
alter table public.dev_notes enable row level security;
alter table public.tasks enable row level security;
alter table public.issues enable row level security;
alter table public.secrets enable row level security;
alter table public.team_members enable row level security;
alter table public.goals enable row level security;
alter table public.backups enable row level security;

-- Policies for Projects (Users can only see their own projects)
create policy "Users can view their own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can insert their own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects" on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete their own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Helper policy for child tables: proper access depends on project ownership
-- Since Supabase policies can be complex with joins, simplified approach:
-- If we add user_id to all tables, it's easier. 
-- BUT, for relational integrity, we can check project ownership.

-- For simplicity in this generated migration, I will assume child tables are accessible if project is accessible.
-- However, standard RLS often requires `user_id` on all tables or a join.
-- I'll use a simple approach: anyone authenticated can read (for now) OR better:
-- Add `user_id` to all tables? No, that's redundant.
-- Use `USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))`

create policy "Users can manage dev_notes of their projects" on public.dev_notes
  for all using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can manage tasks of their projects" on public.tasks
  for all using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can manage issues of their projects" on public.issues
  for all using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can manage secrets of their projects" on public.secrets
  for all using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can manage team_members of their projects" on public.team_members
  for all using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can manage goals of their projects" on public.goals
  for all using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can manage backups of their projects" on public.backups
  for all using (project_id in (select id from public.projects where user_id = auth.uid()));
