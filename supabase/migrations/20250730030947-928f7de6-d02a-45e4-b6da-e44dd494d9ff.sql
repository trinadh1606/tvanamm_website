-- Fix database functions that reference the deleted franchises table

-- 1. Update use_delivery_voucher function to use profiles table
CREATE OR REPLACE FUNCTION public.use_delivery_voucher(p_user_id uuid, p_order_id uuid, p_points_used integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_points INTEGER;
  franchise_tvanamm_id TEXT;
  result JSONB;
BEGIN
  -- Get franchise member's current points and TVANAMM ID from profiles table
  SELECT lp.current_balance, p.tvanamm_id 
  INTO current_points, franchise_tvanamm_id
  FROM public.loyalty_points lp
  JOIN public.profiles p ON p.user_id = lp.user_id
  WHERE lp.user_id = p_user_id AND p.role = 'franchise' AND p.is_verified = true;
  
  -- Check if user is franchise member and has enough points
  IF franchise_tvanamm_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not a franchise member');
  END IF;
  
  IF current_points < p_points_used THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Deduct points
  UPDATE public.loyalty_points 
  SET current_balance = current_balance - p_points_used,
      points_redeemed = points_redeemed + p_points_used,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create voucher redemption record
  INSERT INTO public.voucher_redemptions (
    user_id, 
    tvanamm_id, 
    voucher_type, 
    order_id, 
    points_used,
    expires_at
  )
  VALUES (
    p_user_id, 
    franchise_tvanamm_id, 
    'free_delivery', 
    p_order_id, 
    p_points_used,
    now() + interval '30 days'
  );
  
  -- Record transaction
  INSERT INTO public.loyalty_transactions (user_id, tvanamm_id, points, type, description, order_id)
  VALUES (p_user_id, franchise_tvanamm_id, -p_points_used, 'redeemed', 'Free delivery voucher', p_order_id);
  
  RETURN jsonb_build_object('success', true, 'remaining_points', current_points - p_points_used);
END;
$function$;

-- 2. Update award_loyalty_points function to use profiles table
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Only award points when order is delivered and amount >= 5000
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.final_amount >= 5000 THEN
    -- Get franchise member's TVANAMM ID from profiles table
    DECLARE
      franchise_tvanamm_id TEXT;
    BEGIN
      SELECT p.tvanamm_id INTO franchise_tvanamm_id
      FROM public.profiles p 
      WHERE p.user_id = NEW.user_id AND p.role = 'franchise' AND p.is_verified = true;
      
      -- Only proceed if user is a franchise member
      IF franchise_tvanamm_id IS NOT NULL THEN
        -- Add 20 points to loyalty_points
        INSERT INTO public.loyalty_points (user_id, tvanamm_id, current_balance, points_earned, total_lifetime_points)
        VALUES (NEW.user_id, franchise_tvanamm_id, 20, 20, 20)
        ON CONFLICT (user_id) DO UPDATE SET
          current_balance = public.loyalty_points.current_balance + 20,
          points_earned = public.loyalty_points.points_earned + 20,
          total_lifetime_points = public.loyalty_points.total_lifetime_points + 20,
          tvanamm_id = franchise_tvanamm_id,
          updated_at = now();
        
        -- Record transaction
        INSERT INTO public.loyalty_transactions (user_id, tvanamm_id, points, type, description, order_id)
        VALUES (NEW.user_id, franchise_tvanamm_id, 20, 'earned', 'Order delivery reward - Order #' || NEW.order_number, NEW.id);
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Remove the update_franchise_revenue trigger function since franchises table doesn't exist
-- This function was trying to update a non-existent table, so we'll remove it
DROP FUNCTION IF EXISTS public.update_franchise_revenue() CASCADE;

-- 4. Add function to check dashboard access for order restrictions
CREATE OR REPLACE FUNCTION public.can_user_place_order(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(dashboard_access_enabled, false) 
  FROM public.profiles 
  WHERE user_id = p_user_id;
$function$;