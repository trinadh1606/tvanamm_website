-- Create security audit logs table for comprehensive monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_timestamp ON public.security_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_ip_address ON public.security_audit_logs(ip_address);

-- Enable RLS
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for security audit logs
CREATE POLICY "Admins can view all security logs" ON public.security_audit_logs
  FOR SELECT USING (is_admin_or_owner(auth.uid()));

CREATE POLICY "System can insert security logs" ON public.security_audit_logs
  FOR INSERT WITH CHECK (true);

-- Create fraud detection table
CREATE TABLE IF NOT EXISTS public.fraud_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_factors JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for fraud detection
CREATE INDEX IF NOT EXISTS idx_fraud_detection_user_id ON public.fraud_detection(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_risk_score ON public.fraud_detection(risk_score);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_status ON public.fraud_detection(status);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_created_at ON public.fraud_detection(created_at);

-- Enable RLS
ALTER TABLE public.fraud_detection ENABLE ROW LEVEL SECURITY;

-- Create policies for fraud detection
CREATE POLICY "Admins can view all fraud detection records" ON public.fraud_detection
  FOR ALL USING (is_admin_or_owner(auth.uid()));

CREATE POLICY "System can insert fraud detection records" ON public.fraud_detection
  FOR INSERT WITH CHECK (true);

-- Add security columns to payment_transactions
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS verification_ip TEXT,
ADD COLUMN IF NOT EXISTS verification_user_agent TEXT,
ADD COLUMN IF NOT EXISTS failure_reason TEXT,
ADD COLUMN IF NOT EXISTS security_flags JSONB DEFAULT '{}';

-- Create enhanced payment monitoring view
CREATE OR REPLACE VIEW public.payment_security_summary AS
SELECT 
  pt.id,
  pt.order_id,
  pt.user_id,
  pt.amount,
  pt.status,
  pt.payment_method,
  pt.created_at,
  pt.updated_at,
  pt.verification_ip,
  pt.failure_reason,
  pt.security_flags,
  p.full_name,
  p.email,
  o.order_number,
  o.final_amount,
  CASE 
    WHEN pt.verification_ip IS NOT NULL AND pt.verification_ip != '' THEN true
    ELSE false
  END as has_verification_ip,
  CASE 
    WHEN pt.status = 'failed' AND pt.failure_reason IS NOT NULL THEN true
    ELSE false
  END as has_security_failure
FROM public.payment_transactions pt
LEFT JOIN public.profiles p ON p.user_id = pt.user_id
LEFT JOIN public.orders o ON o.id = pt.order_id;

-- Create function to detect suspicious payment patterns
CREATE OR REPLACE FUNCTION public.detect_payment_fraud(p_user_id UUID, p_order_id UUID, p_amount NUMERIC, p_ip_address TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create function for security metrics
CREATE OR REPLACE FUNCTION public.get_security_metrics(days_back INTEGER DEFAULT 7)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;