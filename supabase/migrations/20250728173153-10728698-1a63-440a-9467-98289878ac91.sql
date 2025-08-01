-- Update the add_loyalty_points_manual function to look in profiles table instead of franchises table
CREATE OR REPLACE FUNCTION public.add_loyalty_points_manual(p_tvanamm_id text, p_points integer, p_description text, p_admin_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  
  -- Find franchise member by TVANAMM ID in profiles table
  SELECT user_id INTO target_user_id 
  FROM public.profiles 
  WHERE tvanamm_id = p_tvanamm_id AND role = 'franchise' AND is_verified = true;
  
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
$function$;