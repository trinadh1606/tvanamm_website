-- Security fixes for TVANAMM Tea project - Part 2
-- Fix 1: Update database functions to use secure search paths

-- Fix assign_user_details function
CREATE OR REPLACE FUNCTION public.assign_user_details(p_user_id uuid, p_role text, p_tvanamm_id text DEFAULT NULL::text, p_store_location text DEFAULT NULL::text, p_store_phone text DEFAULT NULL::text, p_admin_user_id uuid DEFAULT NULL::uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL OR p_role IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User ID and role are required');
  END IF;
  
  -- For non-owner roles, TVANAMM ID is required
  IF p_role != 'owner' AND (p_tvanamm_id IS NULL OR p_tvanamm_id = '') THEN
    RETURN json_build_object('success', false, 'error', 'TVANAMM ID is required for this role');
  END IF;
  
  -- Update the profile
  UPDATE public.profiles 
  SET 
    role = p_role::user_role,
    tvanamm_id = CASE 
      WHEN p_role = 'owner' THEN NULL 
      ELSE p_tvanamm_id 
    END,
    store_location = p_store_location,
    store_phone = p_store_phone,
    is_verified = true,
    dashboard_access_enabled = true,
    assigned_by = p_admin_user_id,
    assigned_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Check if update was successful
  IF FOUND THEN
    -- Create loyalty points record if it doesn't exist
    INSERT INTO public.loyalty_points (user_id, tvanamm_id)
    VALUES (p_user_id, CASE WHEN p_role = 'owner' THEN NULL ELSE p_tvanamm_id END)
    ON CONFLICT (user_id) DO UPDATE SET
      tvanamm_id = CASE WHEN p_role = 'owner' THEN NULL ELSE p_tvanamm_id END,
      updated_at = now();
    
    RETURN json_build_object('success', true, 'message', 'User details assigned successfully');
  ELSE
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Fix generate_tvanamm_id function
CREATE OR REPLACE FUNCTION public.generate_tvanamm_id()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  new_id TEXT;
BEGIN
  new_id := 'TVN' || TO_CHAR(NOW(), 'YYYY') || LPAD(NEXTVAL('public.order_number_seq')::TEXT, 6, '0');
  RETURN new_id;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Fix award_loyalty_points function
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

-- Fix use_delivery_voucher function
CREATE OR REPLACE FUNCTION public.use_delivery_voucher(p_user_id uuid, p_order_id uuid, p_points_used integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

-- Fix update_gift_stock function
CREATE OR REPLACE FUNCTION public.update_gift_stock()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Only update stock for gifts with auto_update_stock enabled
  IF NEW.status = 'pending' AND OLD.status IS DISTINCT FROM 'pending' THEN
    UPDATE public.loyalty_gifts 
    SET stock_quantity = GREATEST(0, stock_quantity - 1),
        updated_at = now()
    WHERE id = NEW.gift_id 
      AND auto_update_stock = true 
      AND stock_quantity > 0;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix add_loyalty_points_manual function
CREATE OR REPLACE FUNCTION public.add_loyalty_points_manual(p_tvanamm_id text, p_points integer, p_description text, p_admin_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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