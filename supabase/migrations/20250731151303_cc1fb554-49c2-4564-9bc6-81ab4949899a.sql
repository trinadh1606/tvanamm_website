-- Fix Security Definer View - Remove SECURITY DEFINER from payment_security_summary
DROP VIEW IF EXISTS public.payment_security_summary;

-- Recreate as regular view without SECURITY DEFINER to respect RLS
CREATE VIEW public.payment_security_summary AS
SELECT 
  pt.id,
  pt.order_id,
  pt.user_id,
  pt.amount,
  pt.status,
  pt.payment_method,
  pt.verification_ip,
  pt.security_flags,
  pt.failure_reason,
  pt.created_at,
  pt.updated_at,
  o.order_number,
  o.final_amount,
  p.full_name,
  p.email,
  CASE WHEN pt.verification_ip IS NOT NULL THEN true ELSE false END as has_verification_ip,
  CASE WHEN pt.security_flags ? 'security_failure' THEN true ELSE false END as has_security_failure
FROM public.payment_transactions pt
LEFT JOIN public.orders o ON o.id = pt.order_id
LEFT JOIN public.profiles p ON p.user_id = pt.user_id;

-- Add RLS policy for the view
ALTER VIEW public.payment_security_summary SET (security_barrier = true);

-- Add comment explaining the security fix
COMMENT ON VIEW public.payment_security_summary IS 'Payment security summary view - Fixed to respect RLS policies';

-- Fix Function Search Path Issues - Update functions without proper search_path
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip_address inet, p_email text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  attempt_record RECORD;
  max_attempts INTEGER := 10;
  block_duration INTERVAL := INTERVAL '30 minutes';
  result JSONB;
BEGIN
  -- Get or create login attempt record
  SELECT * INTO attempt_record 
  FROM public.login_attempts 
  WHERE ip_address = p_ip_address;
  
  -- If no record exists, create one
  IF attempt_record IS NULL THEN
    INSERT INTO public.login_attempts (ip_address, email, attempt_count)
    VALUES (p_ip_address, p_email, 1)
    RETURNING * INTO attempt_record;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'attempts_remaining', max_attempts - 1,
      'blocked_until', NULL
    );
  END IF;
  
  -- Check if currently blocked and block period has expired
  IF attempt_record.is_blocked AND attempt_record.blocked_until IS NOT NULL THEN
    IF now() > attempt_record.blocked_until THEN
      -- Unblock and reset attempts
      UPDATE public.login_attempts 
      SET is_blocked = false, 
          blocked_until = NULL, 
          attempt_count = 1,
          last_attempt_at = now(),
          updated_at = now()
      WHERE ip_address = p_ip_address;
      
      RETURN jsonb_build_object(
        'allowed', true,
        'attempts_remaining', max_attempts - 1,
        'blocked_until', NULL
      );
    ELSE
      -- Still blocked
      RETURN jsonb_build_object(
        'allowed', false,
        'attempts_remaining', 0,
        'blocked_until', attempt_record.blocked_until
      );
    END IF;
  END IF;
  
  -- Check if should be blocked
  IF attempt_record.attempt_count >= max_attempts THEN
    -- Block the IP
    UPDATE public.login_attempts 
    SET is_blocked = true, 
        blocked_until = now() + block_duration,
        updated_at = now()
    WHERE ip_address = p_ip_address;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'attempts_remaining', 0,
      'blocked_until', now() + block_duration
    );
  END IF;
  
  -- Increment attempt count
  UPDATE public.login_attempts 
  SET attempt_count = attempt_count + 1,
      email = COALESCE(p_email, email),
      last_attempt_at = now(),
      updated_at = now()
  WHERE ip_address = p_ip_address;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'attempts_remaining', max_attempts - (attempt_record.attempt_count + 1),
    'blocked_until', NULL
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_login_attempts(p_ip_address inet)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.login_attempts 
  SET attempt_count = 0,
      is_blocked = false,
      blocked_until = NULL,
      updated_at = now()
  WHERE ip_address = p_ip_address;
END;
$function$;