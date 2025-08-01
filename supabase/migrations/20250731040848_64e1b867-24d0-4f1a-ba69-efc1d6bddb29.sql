-- Fix loyalty stats to only count franchise users
-- Update handle_new_user function to notify owners about new signups

-- First, let's improve the handle_new_user function to notify owners
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  owner_user_id UUID;
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (user_id, email, full_name, profile_completion_status, dashboard_access_enabled)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'incomplete',
    false
  );
  
  -- Initialize loyalty points for new user
  INSERT INTO public.loyalty_points (user_id)
  VALUES (NEW.id);
  
  -- Get all owner user IDs and create notifications for them
  FOR owner_user_id IN 
    SELECT user_id 
    FROM public.profiles 
    WHERE role IN ('owner', 'admin') 
    AND is_verified = true
  LOOP
    -- Create notification for owners about new signup
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      data
    ) VALUES (
      owner_user_id,
      'New User Signup',
      'A new user has signed up: ' || COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || '. Please review and assign role.',
      'system',
      jsonb_build_object(
        'new_user_id', NEW.id,
        'new_user_email', NEW.email,
        'new_user_name', NEW.raw_user_meta_data->>'full_name',
        'action_type', 'new_user_signup',
        'requires_action', true
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create a function to get franchise-only loyalty statistics
CREATE OR REPLACE FUNCTION public.get_franchise_loyalty_stats()
RETURNS TABLE(
  total_franchise_users INTEGER,
  active_loyalty_users INTEGER,
  total_points_issued INTEGER,
  total_points_redeemed INTEGER
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    COUNT(DISTINCT p.user_id)::INTEGER as total_franchise_users,
    COUNT(DISTINCT CASE WHEN lp.current_balance > 0 THEN p.user_id END)::INTEGER as active_loyalty_users,
    COALESCE(SUM(lp.points_earned), 0)::INTEGER as total_points_issued,
    COALESCE(SUM(lp.points_redeemed), 0)::INTEGER as total_points_redeemed
  FROM public.profiles p
  LEFT JOIN public.loyalty_points lp ON lp.user_id = p.user_id
  WHERE p.role = 'franchise' 
  AND p.is_verified = true;
$$;

-- Create a function to get admin invoice statistics
CREATE OR REPLACE FUNCTION public.get_admin_invoice_stats()
RETURNS TABLE(
  total_invoices INTEGER,
  paid_invoices INTEGER,
  pending_invoices INTEGER,
  total_invoice_amount NUMERIC
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    COUNT(*)::INTEGER as total_invoices,
    COUNT(CASE WHEN status = 'paid' THEN 1 END)::INTEGER as paid_invoices,
    COUNT(CASE WHEN status IN ('generated', 'pending') THEN 1 END)::INTEGER as pending_invoices,
    COALESCE(SUM(total_amount), 0) as total_invoice_amount
  FROM public.invoices;
$$;