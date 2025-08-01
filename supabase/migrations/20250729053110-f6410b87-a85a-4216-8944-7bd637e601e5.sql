-- Fix search path security warning by updating existing functions
CREATE OR REPLACE FUNCTION public.get_admin_owner_user_ids()
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT ARRAY(
    SELECT user_id 
    FROM public.profiles 
    WHERE role IN ('admin', 'owner') 
    AND is_verified = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_pending_unpaid_orders(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.orders 
    WHERE user_id = p_user_id 
    AND payment_status = 'pending' 
    AND status IN ('pending', 'confirmed', 'packing', 'packed', 'shipped')
  );
$$;