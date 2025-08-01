-- Remove unused image_url column from categories table
ALTER TABLE categories DROP COLUMN IF EXISTS image_url;

-- Drop unused franchises table completely
DROP TABLE IF EXISTS franchises CASCADE;

-- Update loyalty redemption function to handle missing franchises table
CREATE OR REPLACE FUNCTION public.handle_loyalty_redemption(p_user_id uuid, p_points_to_redeem integer, p_order_id uuid, p_gift_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_points INTEGER;
  franchise_tvanamm_id TEXT;
  gift_name TEXT;
  result JSONB;
BEGIN
  -- Get user's current points and TVANAMM ID from profiles table only
  SELECT lp.current_balance, p.tvanamm_id 
  INTO current_points, franchise_tvanamm_id
  FROM public.loyalty_points lp
  LEFT JOIN public.profiles p ON p.user_id = lp.user_id
  WHERE lp.user_id = p_user_id;
  
  -- Check if user exists in loyalty system
  IF current_points IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found in loyalty system');
  END IF;
  
  -- Check if user has enough points
  IF current_points < p_points_to_redeem THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points. Current balance: ' || current_points);
  END IF;
  
  -- Deduct points
  UPDATE public.loyalty_points 
  SET current_balance = current_balance - p_points_to_redeem,
      points_redeemed = points_redeemed + p_points_to_redeem,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  IF p_gift_id IS NOT NULL THEN
    SELECT name INTO gift_name FROM public.loyalty_gifts WHERE id = p_gift_id;
    INSERT INTO public.loyalty_transactions (user_id, tvanamm_id, points, type, description, order_id)
    VALUES (p_user_id, franchise_tvanamm_id, -p_points_to_redeem, 'redeemed', 'Gift claimed: ' || COALESCE(gift_name, 'Unknown Gift'), p_order_id);
    
    -- Record gift redemption
    INSERT INTO public.gift_redemptions (user_id, gift_id, points_used, status)
    VALUES (p_user_id, p_gift_id, p_points_to_redeem, 'pending');
  ELSE
    INSERT INTO public.loyalty_transactions (user_id, tvanamm_id, points, type, description, order_id)
    VALUES (p_user_id, franchise_tvanamm_id, -p_points_to_redeem, 'redeemed', 'Order discount applied', p_order_id);
  END IF;
  
  RETURN jsonb_build_object('success', true, 'remaining_points', current_points - p_points_to_redeem, 'redeemed_points', p_points_to_redeem);
END;
$function$;