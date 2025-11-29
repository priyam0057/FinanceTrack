-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  color TEXT NOT NULL DEFAULT '#5AA9E6',
  icon TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('Asia/Kolkata'::text, now()),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  place_name TEXT,
  note TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL DEFAULT 'INR',
  language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  start_of_week INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- Insert default settings
INSERT INTO public.user_settings (currency, language, timezone) VALUES ('INR', 'en', 'Asia/Kolkata');

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, no write for system categories)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Users can insert non-system categories" ON public.categories FOR INSERT WITH CHECK (is_system = false);
CREATE POLICY "Users can update non-system categories" ON public.categories FOR UPDATE USING (is_system = false);
CREATE POLICY "Users can delete non-system categories" ON public.categories FOR DELETE USING (is_system = false);

-- RLS Policies for transactions (public for now, will add user-specific later)
CREATE POLICY "Transactions are viewable by everyone" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update transactions" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete transactions" ON public.transactions FOR DELETE USING (true);

-- RLS Policies for settings
CREATE POLICY "Settings are viewable by everyone" ON public.user_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update settings" ON public.user_settings FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_transactions_date_time ON public.transactions(date_time DESC);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_categories_type ON public.categories(type);