-- First, update any existing 'customer' records to 'franchise'
UPDATE public.profiles 
SET role = 'franchise' 
WHERE role = 'customer';

-- Remove the default constraint first, then update the enum
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Drop the existing enum and recreate with only the needed roles
ALTER TYPE user_role RENAME TO user_role_old;

-- Create new enum with only franchise business roles
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'franchise');

-- Update the profiles table to use the new enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Add back the default
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'franchise'::user_role;

-- Drop the old enum
DROP TYPE user_role_old;

-- Enable real-time for order tracking
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable real-time for loyalty points
ALTER TABLE public.loyalty_points REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_points;

-- Enable real-time for loyalty transactions
ALTER TABLE public.loyalty_transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_transactions;

-- Enable real-time for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;