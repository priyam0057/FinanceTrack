-- Create user_feature_access table to manage which features each user can access
CREATE TABLE public.user_feature_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, feature_name)
);

-- Enable RLS
ALTER TABLE public.user_feature_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own feature access
CREATE POLICY "Users can view their own feature access"
ON public.user_feature_access
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can manage feature access
CREATE POLICY "Admins can insert feature access"
ON public.user_feature_access
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update feature access"
ON public.user_feature_access
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete feature access"
ON public.user_feature_access
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add approval status to profiles table
ALTER TABLE public.profiles ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN approved_by UUID REFERENCES auth.users(id);

-- Update the transactions table RLS to tie to user_id
ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing transactions to have user_id (set to null for now, admins will need to clean up)
-- New transactions will require user_id

-- Drop old permissive policies on transactions
DROP POLICY IF EXISTS "Anyone can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Transactions are viewable by everyone" ON public.transactions;

-- Create new user-specific policies for transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Keep the admin delete policy
-- (Already exists: "Only admins can delete transactions")

-- Update trigger for user_feature_access
CREATE TRIGGER update_user_feature_access_updated_at
BEFORE UPDATE ON public.user_feature_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();