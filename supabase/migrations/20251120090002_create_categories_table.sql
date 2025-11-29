-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  color TEXT NOT NULL DEFAULT '#5AA9E6',
  icon TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add category_id column to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add category_id column to budgets table
ALTER TABLE public.budgets
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);

-- Insert default categories
INSERT INTO public.categories (name, type, color, icon, is_system) VALUES
  ('Food & Dining', 'expense', '#F7B267', 'UtensilsCrossed', true),
  ('Transportation', 'expense', '#5AA9E6', 'Car', true),
  ('Groceries', 'expense', '#8BD3A7', 'ShoppingCart', true),
  ('Rent', 'expense', '#A78BFA', 'Home', true),
  ('Utilities', 'expense', '#FCA5A5', 'Zap', true),
  ('Entertainment', 'expense', '#FBBF24', 'Film', true),
  ('Healthcare', 'expense', '#EC4899', 'Heart', true),
  ('Shopping', 'expense', '#F472B6', 'ShoppingBag', true),
  ('Education', 'expense', '#60A5FA', 'GraduationCap', true),
  ('Others', 'expense', '#9CA3AF', 'MoreHorizontal', true),
  ('Salary', 'income', '#10B981', 'Wallet', true),
  ('Business', 'income', '#8B5CF6', 'Briefcase', true),
  ('Investment', 'income', '#06B6D4', 'TrendingUp', true),
  ('Gift', 'income', '#F59E0B', 'Gift', true),
  ('Other Income', 'income', '#6B7280', 'Plus', true);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Users can insert non-system categories" ON public.categories FOR INSERT WITH CHECK (is_system = false);
CREATE POLICY "Users can update non-system categories" ON public.categories FOR UPDATE USING (is_system = false);
CREATE POLICY "Users can delete non-system categories" ON public.categories FOR DELETE USING (is_system = false);