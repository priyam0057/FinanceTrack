-- Remove category_id column from transactions table
ALTER TABLE public.transactions
DROP COLUMN IF EXISTS category_id;

-- Drop categories table
DROP TABLE IF EXISTS public.categories;

-- Drop categories related indexes
DROP INDEX IF EXISTS idx_transactions_category;
DROP INDEX IF EXISTS idx_categories_type;

-- Remove categories related RLS policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.transactions;
DROP POLICY IF EXISTS "Only admins can delete categories" ON public.transactions;
DROP POLICY IF EXISTS "Only admins can insert categories" ON public.transactions;
DROP POLICY IF EXISTS "Only admins can update categories" ON public.transactions;