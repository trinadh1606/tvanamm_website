-- Add function to prevent duplicate orders within 30 seconds
CREATE OR REPLACE FUNCTION public.check_recent_order(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.orders 
    WHERE user_id = p_user_id 
    AND created_at > (now() - interval '30 seconds')
  );
$$;