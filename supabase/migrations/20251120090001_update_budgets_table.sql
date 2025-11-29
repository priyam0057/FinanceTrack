-- Remove category_id column from budgets table
ALTER TABLE public.budgets
DROP COLUMN IF EXISTS category_id;

-- Remove foreign key constraint if it exists
ALTER TABLE public.budgets
DROP CONSTRAINT IF EXISTS budgets_category_id_fkey;