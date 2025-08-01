-- Fix the assign_user_details function and handle different role requirements
CREATE OR REPLACE FUNCTION public.assign_user_details(
  p_user_id UUID,
  p_role TEXT,
  p_tvanamm_id TEXT DEFAULT NULL,
  p_store_location TEXT DEFAULT NULL,
  p_store_phone TEXT DEFAULT NULL,
  p_admin_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;