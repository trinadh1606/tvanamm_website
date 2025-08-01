-- Fix database function security issues

-- 1. Update functions to have proper search_path settings to fix WARN 2
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('public.order_number_seq')::TEXT, 4, '0');
  RETURN new_number;
END;
$function$;

-- 2. Update assign_user_details function with proper search_path
CREATE OR REPLACE FUNCTION public.assign_user_details(p_user_id uuid, p_role text, p_tvanamm_id text DEFAULT NULL::text, p_store_location text DEFAULT NULL::text, p_store_phone text DEFAULT NULL::text, p_admin_user_id uuid DEFAULT NULL::uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- 3. Update other critical functions with proper search_path
CREATE OR REPLACE FUNCTION public.detect_payment_fraud(p_user_id uuid, p_order_id uuid, p_amount numeric, p_ip_address text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  risk_score INTEGER := 0;
  risk_factors JSONB := '{}';
  recent_payments INTEGER;
  ip_payment_count INTEGER;
  amount_deviation NUMERIC;
  avg_order_amount NUMERIC;
BEGIN
  -- Check for multiple payments from same IP in short time
  SELECT COUNT(*) INTO ip_payment_count
  FROM public.payment_transactions pt
  WHERE pt.verification_ip = p_ip_address
  AND pt.created_at > NOW() - INTERVAL '1 hour';
  
  IF ip_payment_count > 5 THEN
    risk_score := risk_score + 30;
    risk_factors := jsonb_set(risk_factors, '{multiple_ip_payments}', to_jsonb(ip_payment_count));
  END IF;

  -- Check for rapid successive payments from same user
  SELECT COUNT(*) INTO recent_payments
  FROM public.payment_transactions pt
  WHERE pt.user_id = p_user_id
  AND pt.created_at > NOW() - INTERVAL '10 minutes';
  
  IF recent_payments > 3 THEN
    risk_score := risk_score + 25;
    risk_factors := jsonb_set(risk_factors, '{rapid_payments}', to_jsonb(recent_payments));
  END IF;

  -- Check for unusual amount compared to user's history
  SELECT AVG(amount) INTO avg_order_amount
  FROM public.payment_transactions pt
  WHERE pt.user_id = p_user_id
  AND pt.status = 'completed'
  AND pt.created_at > NOW() - INTERVAL '30 days';
  
  IF avg_order_amount IS NOT NULL THEN
    amount_deviation := ABS(p_amount - avg_order_amount) / avg_order_amount;
    IF amount_deviation > 3 THEN
      risk_score := risk_score + 20;
      risk_factors := jsonb_set(risk_factors, '{unusual_amount}', to_jsonb(amount_deviation));
    END IF;
  END IF;

  -- Insert fraud detection record if risk score is significant
  IF risk_score > 20 THEN
    INSERT INTO public.fraud_detection (
      user_id, order_id, risk_score, risk_factors, ip_address, status
    ) VALUES (
      p_user_id, p_order_id, risk_score, risk_factors, p_ip_address, 'review_required'
    );
  END IF;

  RETURN risk_score;
END;
$function$;

-- 4. Update other functions with search_path
CREATE OR REPLACE FUNCTION public.get_security_metrics(days_back integer DEFAULT 7)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB := '{}';
  total_payments INTEGER;
  failed_payments INTEGER;
  fraud_attempts INTEGER;
  blocked_ips INTEGER;
BEGIN
  -- Total payments in period
  SELECT COUNT(*) INTO total_payments
  FROM public.payment_transactions
  WHERE created_at > NOW() - (days_back || ' days')::INTERVAL;
  
  -- Failed payments
  SELECT COUNT(*) INTO failed_payments
  FROM public.payment_transactions
  WHERE created_at > NOW() - (days_back || ' days')::INTERVAL
  AND status = 'failed';
  
  -- Fraud attempts
  SELECT COUNT(*) INTO fraud_attempts
  FROM public.fraud_detection
  WHERE created_at > NOW() - (days_back || ' days')::INTERVAL;
  
  -- Blocked IPs
  SELECT COUNT(DISTINCT ip_address) INTO blocked_ips
  FROM public.login_attempts
  WHERE is_blocked = true
  AND created_at > NOW() - (days_back || ' days')::INTERVAL;
  
  result := jsonb_build_object(
    'total_payments', total_payments,
    'failed_payments', failed_payments,
    'fraud_attempts', fraud_attempts,
    'blocked_ips', blocked_ips,
    'failure_rate', CASE WHEN total_payments > 0 THEN failed_payments::FLOAT / total_payments ELSE 0 END,
    'period_days', days_back
  );
  
  RETURN result;
END;
$function$;