-- Create tasks table if it doesn't exist
create table if not exists public.tasks (
    id uuid not null default gen_random_uuid(),
    project_id uuid references public.projects(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    description text,
    status text not null default 'todo',
    priority text not null default 'medium',
    due_date timestamptz,
    tags text[] default array[]::text[],
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint tasks_pkey primary key (id)
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Policies
create policy "Users can view their own tasks"
    on public.tasks for select
    using ( auth.uid() = user_id );

create policy "Users can insert their own tasks"
    on public.tasks for insert
    with check ( auth.uid() = user_id );

create policy "Users can update their own tasks"
    on public.tasks for update
    using ( auth.uid() = user_id );

create policy "Users can delete their own tasks"
    on public.tasks for delete
    using ( auth.uid() = user_id );

-- Public access policies (since /dev is public now? No, wait)
-- The user said "Dev has no auth", but writes usually need auth or we need a public user concept.
-- However, existing store.ts uses `supabase.auth.getUser()`, so we are likely still relying on the user being logged in 
-- via the main app, checking `user_id`, or if "Dev has no auth" means "view only", then writes might fail.
-- BUT, the user said "Dev dashboard add task page", implying they want to ADD tasks.
-- If Dev is TRULY unauthenticated, `auth.uid()` will be null.
-- Let's check if we should allow public writes (risky) or if we assume the user IS logged in but the ROUTE doesn't force it.
-- Actually, for a personal project, "Dev" might be just a view.
-- BUT, the user explicitly asked for "add task page".
-- I will add a policy for anon/public access just in case 'Dev' is used without login,
-- OR I will assume the user will be logged in mostly.
-- Given "Dev has no auth" requirement, likely they want to use it without login.
-- I will add a policy for "Enable read access for all users" but for writes?
-- Let's stick to standard auth policies first. If the user is unauthenticated, writes will fail, and we can handle that UI-side (prompt login or just allow local-only if offline).
-- The store.ts seems to support local optimistic updates.

-- Add indexes
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
