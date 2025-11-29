-- Drop the old policy
DROP POLICY IF EXISTS "Users can delete non-system categories" ON public.categories;

-- Create new policy that allows users to delete all categories
CREATE POLICY "Users can delete all categories" 
ON public.categories 
FOR DELETE 
TO authenticated 
USING (true);