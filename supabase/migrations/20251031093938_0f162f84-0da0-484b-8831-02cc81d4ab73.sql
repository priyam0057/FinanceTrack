-- Add payment_method column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'online'));