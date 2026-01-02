-- Add constraint to ensure budgets with category_id reference valid categories
ALTER TABLE public.budgets
ADD CONSTRAINT fk_budgets_category_id
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

-- Add index for better performance on category_id in budgets
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);

-- Add function to check if a category is used in any budgets
CREATE OR REPLACE FUNCTION public.check_category_in_budgets(category_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  budget_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO budget_count
  FROM public.budgets
  WHERE category_id = category_uuid;
  
  RETURN budget_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Add function to safely delete a category
CREATE OR REPLACE FUNCTION public.safe_delete_category(category_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- First, remove category references from transactions
  UPDATE public.transactions
  SET category_id = NULL
  WHERE category_id = category_uuid;
  
  -- Delete any budgets using this category
  DELETE FROM public.budgets
  WHERE category_id = category_uuid;
  
  -- Finally, delete the category itself
  DELETE FROM public.categories
  WHERE id = category_uuid;
END;
$$ LANGUAGE plpgsql;