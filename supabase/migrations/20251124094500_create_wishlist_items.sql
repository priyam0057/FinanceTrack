-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  cost DECIMAL(15, 2) NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low','medium','high')),
  note TEXT,
  saved DECIMAL(15, 2) NOT NULL DEFAULT 0,
  purchased BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure timestamp update function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Relationship to auth users
ALTER TABLE public.wishlist_items
  ADD CONSTRAINT wishlist_items_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage their own wishlist items
CREATE POLICY "Wishlist: select own" ON public.wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Wishlist: insert own" ON public.wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Wishlist: update own" ON public.wishlist_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Wishlist: delete own" ON public.wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to maintain updated_at
CREATE TRIGGER update_wishlist_items_updated_at
  BEFORE UPDATE ON public.wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_created ON public.wishlist_items(created_at DESC);
