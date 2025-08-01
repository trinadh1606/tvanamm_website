-- Create login_attempts table for rate limiting
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  email TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  blocked_until TIMESTAMP WITH TIME ZONE,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_login_attempts_ip_address ON public.login_attempts(ip_address);
CREATE INDEX idx_login_attempts_blocked ON public.login_attempts(is_blocked, blocked_until);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Admin policy for managing login attempts
CREATE POLICY "Admins can manage login attempts" 
ON public.login_attempts 
FOR ALL 
USING (is_admin_or_owner(auth.uid()));

-- Function to handle rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip_address INET, p_email TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Function to reset login attempts on successful login
CREATE OR REPLACE FUNCTION public.reset_login_attempts(p_ip_address INET)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.login_attempts 
  SET attempt_count = 0,
      is_blocked = false,
      blocked_until = NULL,
      updated_at = now()
  WHERE ip_address = p_ip_address;
END;
$$;