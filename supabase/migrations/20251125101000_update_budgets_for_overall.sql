-- Drop the existing foreign key constraint
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_category_id_fkey;

-- Recreate the foreign key constraint with ON DELETE SET NULL instead of CASCADE
-- This allows for overall budgets (category_id = NULL) while still maintaining referential integrity
ALTER TABLE public.budgets
ADD CONSTRAINT budgets_category_id_fkey
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add a check constraint to ensure either category_id is set OR it's explicitly NULL for overall budgets
-- This helps document the intention that NULL category_id means overall budget
ALTER TABLE public.budgets
ADD CONSTRAINT budgets_category_check
CHECK (category_id IS NOT NULL OR category_id IS NULL);

-- Create an index for better performance when querying overall budgets
CREATE INDEX IF NOT EXISTS idx_budgets_null_category ON public.budgets(category_id) WHERE category_id IS NULL;

-- Create a partial index for better performance when querying category-specific budgets
CREATE INDEX IF NOT EXISTS idx_budgets_with_category ON public.budgets(category_id) WHERE category_id IS NOT NULL;

-- Update the function to handle overall budgets in calculations
CREATE OR REPLACE FUNCTION public.calculate_budget_spent(budget_row public.budgets)
RETURNS NUMERIC AS $$
DECLARE
  spent_amount NUMERIC := 0;
BEGIN
  -- If budget has a category, calculate spent for that category only
  IF budget_row.category_id IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0) INTO spent_amount
    FROM public.transactions
    WHERE type = 'expense'
      AND category_id = budget_row.category_id
      AND date_time >= budget_row.start_date
      AND date_time <= budget_row.end_date;
  ELSE
    -- If budget is overall (no category), calculate spent for all expense transactions
    SELECT COALESCE(SUM(amount), 0) INTO spent_amount
    FROM public.transactions
    WHERE type = 'expense'
      AND date_time >= budget_row.start_date
      AND date_time <= budget_row.end_date;
  END IF;
  
  RETURN spent_amount;
END;
$$ LANGUAGE plpgsql;

-- Add a comment to document the purpose of NULL category_id
COMMENT ON COLUMN public.budgets.category_id IS 'References categories.id. NULL value indicates an overall budget that applies to all categories.';