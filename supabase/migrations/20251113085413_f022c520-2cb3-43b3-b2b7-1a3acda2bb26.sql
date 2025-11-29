-- Drop all policies that depend on has_role function first
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can delete transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can insert feature access" ON public.user_feature_access;
DROP POLICY IF EXISTS "Admins can update feature access" ON public.user_feature_access;
DROP POLICY IF EXISTS "Admins can delete feature access" ON public.user_feature_access;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

-- Now drop the function
DROP FUNCTION IF EXISTS public.has_role(_user_id uuid, _role app_role);

-- Drop tables
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user_feature_access CASCADE;

-- Drop the enum
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Update profiles table to remove approval system
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS approved,
  DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS approved_at;

-- Create new policies for categories
CREATE POLICY "Authenticated users can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (true);

-- Create policy for users to delete their own transactions
CREATE POLICY "Users can delete their own transactions"
ON public.transactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);