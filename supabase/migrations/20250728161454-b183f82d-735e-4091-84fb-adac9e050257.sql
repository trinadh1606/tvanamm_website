-- Phase 1: Enhanced User Assignment and Gift Management (Fixed)

-- Add store location and phone to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_location text,
ADD COLUMN IF NOT EXISTS store_phone text;

-- Add stock management and edit capabilities to loyalty_gifts
ALTER TABLE public.loyalty_gifts 
ADD COLUMN IF NOT EXISTS can_edit boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_update_stock boolean DEFAULT true;

-- Create voucher redemptions table for free delivery tracking
CREATE TABLE IF NOT EXISTS public.voucher_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tvanamm_id text,
  voucher_type text NOT NULL DEFAULT 'free_delivery',
  order_id uuid,
  points_used integer NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on voucher_redemptions
ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for voucher_redemptions
CREATE POLICY "Users can view their own voucher redemptions" 
ON public.voucher_redemptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own voucher redemptions" 
ON public.voucher_redemptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all voucher redemptions" 
ON public.voucher_redemptions 
FOR ALL 
USING (is_admin_or_owner(auth.uid()));

-- Create function to handle free delivery voucher usage
CREATE OR REPLACE FUNCTION public.use_delivery_voucher(
  p_user_id uuid,
  p_order_id uuid,
  p_points_used integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_points INTEGER;
  franchise_tvanamm_id TEXT;
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
$$;

-- Enhanced function for user assignment with role, location, and phone (Fixed parameters)
CREATE OR REPLACE FUNCTION public.assign_user_details(
  p_user_id uuid,
  p_role user_role,
  p_tvanamm_id text,
  p_store_location text DEFAULT NULL,
  p_store_phone text DEFAULT NULL,
  p_admin_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  admin_role TEXT;
  result JSONB;
BEGIN
  -- Check if admin has permission
  SELECT role INTO admin_role FROM public.profiles WHERE user_id = COALESCE(p_admin_user_id, auth.uid());
  IF admin_role NOT IN ('admin', 'owner') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;
  
  -- Check if TVANAMM ID already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE tvanamm_id = p_tvanamm_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'TVANAMM ID already exists');
  END IF;
  
  -- Update user profile
  UPDATE public.profiles 
  SET 
    role = p_role,
    tvanamm_id = p_tvanamm_id,
    store_location = p_store_location,
    store_phone = p_store_phone,
    dashboard_access_enabled = true,
    is_verified = true,
    assigned_by = COALESCE(p_admin_user_id, auth.uid()),
    assigned_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- If franchise role, create franchise record
  IF p_role = 'franchise' THEN
    INSERT INTO public.franchises (
      user_id,
      tvanamm_id,
      business_name,
      contact_person,
      email,
      phone,
      address,
      status,
      approved_by,
      approved_at,
      dashboard_enabled
    )
    SELECT 
      p_user_id,
      p_tvanamm_id,
      COALESCE(p.full_name || '''s Store', 'Franchise Store'),
      p.full_name,
      p.email,
      COALESCE(p_store_phone, p.phone),
      jsonb_build_object('location', COALESCE(p_store_location, 'Not specified')),
      'approved',
      COALESCE(p_admin_user_id, auth.uid()),
      now(),
      true
    FROM public.profiles p 
    WHERE p.user_id = p_user_id
    ON CONFLICT (user_id) DO UPDATE SET
      tvanamm_id = p_tvanamm_id,
      phone = COALESCE(p_store_phone, franchises.phone),
      address = jsonb_build_object('location', COALESCE(p_store_location, 'Not specified')),
      dashboard_enabled = true,
      updated_at = now();
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 'User details assigned successfully');
END;
$$;

-- Function to update gift stock when redeemed
CREATE OR REPLACE FUNCTION public.update_gift_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- Create trigger for gift stock updates
DROP TRIGGER IF EXISTS trigger_update_gift_stock ON public.gift_redemptions;
CREATE TRIGGER trigger_update_gift_stock
  AFTER INSERT OR UPDATE ON public.gift_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gift_stock();

-- Add updated_at trigger for voucher_redemptions
CREATE TRIGGER update_voucher_redemptions_updated_at
  BEFORE UPDATE ON public.voucher_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();