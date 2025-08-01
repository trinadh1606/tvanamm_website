-- Fix security warnings by adding proper search_path to functions

-- Update award_loyalty_points function with secure search path
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only award points when order is delivered and amount >= 5000
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.final_amount >= 5000 THEN
    -- Get franchise member's TVANAMM ID
    DECLARE
      franchise_tvanamm_id TEXT;
    BEGIN
      SELECT f.tvanamm_id INTO franchise_tvanamm_id
      FROM public.franchises f 
      WHERE f.user_id = NEW.user_id;
      
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
$$;

-- Update handle_loyalty_redemption function with secure search path
CREATE OR REPLACE FUNCTION public.handle_loyalty_redemption(
  p_user_id UUID,
  p_points_to_redeem INTEGER,
  p_order_id UUID,
  p_gift_id UUID DEFAULT NULL
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_points INTEGER;
  franchise_tvanamm_id TEXT;
  gift_name TEXT;
  result JSONB;
BEGIN
  -- Get franchise member's current points and TVANAMM ID
  SELECT lp.current_balance, f.tvanamm_id 
  INTO current_points, franchise_tvanamm_id
  FROM public.loyalty_points lp
  JOIN public.franchises f ON f.user_id = lp.user_id
  WHERE lp.user_id = p_user_id;
  
  -- Check if user is franchise member and has enough points
  IF franchise_tvanamm_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not a franchise member');
  END IF;
  
  IF current_points < p_points_to_redeem THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
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
    VALUES (p_user_id, franchise_tvanamm_id, -p_points_to_redeem, 'redeemed', 'Gift claimed: ' || gift_name, p_order_id);
    
    -- Record gift redemption
    INSERT INTO public.gift_redemptions (user_id, gift_id, points_used, status)
    VALUES (p_user_id, p_gift_id, p_points_to_redeem, 'pending');
  ELSE
    INSERT INTO public.loyalty_transactions (user_id, tvanamm_id, points, type, description, order_id)
    VALUES (p_user_id, franchise_tvanamm_id, -p_points_to_redeem, 'redeemed', 'Order discount applied', p_order_id);
  END IF;
  
  RETURN jsonb_build_object('success', true, 'remaining_points', current_points - p_points_to_redeem);
END;
$$;

-- Update add_loyalty_points_manual function with secure search path
CREATE OR REPLACE FUNCTION public.add_loyalty_points_manual(
  p_tvanamm_id TEXT,
  p_points INTEGER,
  p_description TEXT,
  p_admin_user_id UUID
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_user_id UUID;
  admin_role TEXT;
  result JSONB;
BEGIN
  -- Check if admin has permission
  SELECT role INTO admin_role FROM public.profiles WHERE user_id = p_admin_user_id;
  IF admin_role NOT IN ('admin', 'owner') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;
  
  -- Find franchise member by TVANAMM ID
  SELECT user_id INTO target_user_id 
  FROM public.franchises 
  WHERE tvanamm_id = p_tvanamm_id;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Franchise member not found');
  END IF;
  
  -- Update points
  INSERT INTO public.loyalty_points (user_id, tvanamm_id, current_balance, points_earned, total_lifetime_points)
  VALUES (target_user_id, p_tvanamm_id, p_points, GREATEST(p_points, 0), GREATEST(p_points, 0))
  ON CONFLICT (user_id) DO UPDATE SET
    current_balance = public.loyalty_points.current_balance + p_points,
    points_earned = CASE WHEN p_points > 0 THEN public.loyalty_points.points_earned + p_points ELSE public.loyalty_points.points_earned END,
    points_redeemed = CASE WHEN p_points < 0 THEN public.loyalty_points.points_redeemed + ABS(p_points) ELSE public.loyalty_points.points_redeemed END,
    total_lifetime_points = CASE WHEN p_points > 0 THEN public.loyalty_points.total_lifetime_points + p_points ELSE public.loyalty_points.total_lifetime_points END,
    tvanamm_id = p_tvanamm_id,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO public.loyalty_transactions (user_id, tvanamm_id, points, type, description)
  VALUES (target_user_id, p_tvanamm_id, p_points, CASE WHEN p_points > 0 THEN 'earned' ELSE 'redeemed' END, 'Manual adjustment: ' || p_description);
  
  RETURN jsonb_build_object('success', true, 'message', 'Points updated successfully');
END;
$$;