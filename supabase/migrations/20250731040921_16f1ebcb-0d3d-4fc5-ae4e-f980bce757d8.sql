-- Fix security warnings by updating function search paths

-- Update get_franchise_loyalty_stats with proper search_path
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

-- Update get_admin_invoice_stats with proper search_path
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