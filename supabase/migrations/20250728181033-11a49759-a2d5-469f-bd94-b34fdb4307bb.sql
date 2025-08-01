-- First, update any existing 'customer' records to 'franchise'
UPDATE public.profiles 
SET role = 'franchise' 
WHERE role = 'customer';

-- Remove the default constraint first
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Drop and recreate the dependent function first
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Drop the existing enum and recreate with only the needed roles
ALTER TYPE user_role RENAME TO user_role_old;

-- Create new enum with only franchise business roles
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'franchise');

-- Update the profiles table to use the new enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Add back the default
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'franchise'::user_role;

-- Drop the old enum (should work now)
DROP TYPE user_role_old;

-- Recreate the function with the new enum
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Enable real-time for order tracking
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Enable real-time for loyalty points
ALTER TABLE public.loyalty_points REPLICA IDENTITY FULL;

-- Enable real-time for loyalty transactions
ALTER TABLE public.loyalty_transactions REPLICA IDENTITY FULL;

-- Enable real-time for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;