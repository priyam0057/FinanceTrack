-- Consolidated Fix Script
-- 0. Ensure helper function exists
create or replace function public.is_project_owner(project_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.projects
    where id = project_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- 1. Create missing tables if they don't exist (e.g., resource_items)
create table if not exists public.resource_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade, -- allow null initially
  type text not null,
  name text not null,
  value text not null,
  description text,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id)
);

-- 2. Make project_id nullable for existing tables to support "General" items
alter table public.tasks alter column project_id drop not null;
alter table public.dev_notes alter column project_id drop not null;
alter table public.issues alter column project_id drop not null;
alter table public.secrets alter column project_id drop not null;
alter table public.goals alter column project_id drop not null;
alter table public.backups alter column project_id drop not null;
-- resource_items is handled above, but if it existed and was not null:
alter table public.resource_items alter column project_id drop not null;

-- 3. Add user_id column if missing (safe to run even if column exists)
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'user_id') then
    alter table public.tasks add column user_id uuid references auth.users(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'dev_notes' and column_name = 'user_id') then
    alter table public.dev_notes add column user_id uuid references auth.users(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'issues' and column_name = 'user_id') then
    alter table public.issues add column user_id uuid references auth.users(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'secrets' and column_name = 'user_id') then
    alter table public.secrets add column user_id uuid references auth.users(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'goals' and column_name = 'user_id') then
    alter table public.goals add column user_id uuid references auth.users(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'backups' and column_name = 'user_id') then
    alter table public.backups add column user_id uuid references auth.users(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'resource_items' and column_name = 'user_id') then
    alter table public.resource_items add column user_id uuid references auth.users(id);
  end if;
end $$;

-- 4. Update RLS policies to allow access if (project is owned) OR (user_id matches)
-- We drop and recreate to ensure they are correct.

drop policy if exists "Users can manage dev_notes" on public.dev_notes;
create policy "Users can manage dev_notes" on public.dev_notes
  for all using (
    (project_id is not null and public.is_project_owner(project_id)) 
    or (user_id = auth.uid())
  );

drop policy if exists "Users can manage tasks" on public.tasks;
create policy "Users can manage tasks" on public.tasks
  for all using (
    (project_id is not null and public.is_project_owner(project_id)) 
    or (user_id = auth.uid())
  );

drop policy if exists "Users can manage issues" on public.issues;
create policy "Users can manage issues" on public.issues
  for all using (
    (project_id is not null and public.is_project_owner(project_id)) 
    or (user_id = auth.uid())
  );

drop policy if exists "Users can manage secrets" on public.secrets;
create policy "Users can manage secrets" on public.secrets
  for all using (
    (project_id is not null and public.is_project_owner(project_id)) 
    or (user_id = auth.uid())
  );

drop policy if exists "Users can manage goals" on public.goals;
create policy "Users can manage goals" on public.goals
  for all using (
    (project_id is not null and public.is_project_owner(project_id)) 
    or (user_id = auth.uid())
  );

drop policy if exists "Users can manage backups" on public.backups;
create policy "Users can manage backups" on public.backups
  for all using (
    (project_id is not null and public.is_project_owner(project_id)) 
    or (user_id = auth.uid())
  );

drop policy if exists "Users can manage resources" on public.resource_items;
create policy "Users can manage resources" on public.resource_items
  for all using (
    (project_id is not null and public.is_project_owner(project_id)) 
    or (user_id = auth.uid())
  );
