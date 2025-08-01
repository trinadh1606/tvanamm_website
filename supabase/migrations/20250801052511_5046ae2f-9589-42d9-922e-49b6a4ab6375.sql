-- Drop existing conflicting RLS policies on leads table
DROP POLICY IF EXISTS "Admin and owner can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous lead creation" ON public.leads;
DROP POLICY IF EXISTS "enable_anonymous_lead_creation" ON public.leads;
DROP POLICY IF EXISTS "enable_admin_view_leads" ON public.leads;
DROP POLICY IF EXISTS "enable_admin_manage_leads" ON public.leads;

-- Create form_submissions table for rate limiting
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  submission_count INTEGER NOT NULL DEFAULT 1,
  last_submission_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on form_submissions
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Create index for efficient IP lookups
CREATE INDEX idx_form_submissions_ip ON public.form_submissions(ip_address);

-- Create function to check form submission rate limit
CREATE OR REPLACE FUNCTION public.check_form_rate_limit(p_ip_address inet)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  submission_record RECORD;
  max_submissions INTEGER := 10;
  time_window INTERVAL := INTERVAL '24 hours';
  result JSONB;
BEGIN
  -- Get or create submission record for this IP
  SELECT * INTO submission_record 
  FROM public.form_submissions 
  WHERE ip_address = p_ip_address;
  
  -- If no record exists, create one
  IF submission_record IS NULL THEN
    INSERT INTO public.form_submissions (ip_address, submission_count)
    VALUES (p_ip_address, 1)
    RETURNING * INTO submission_record;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'submissions_remaining', max_submissions - 1,
      'reset_time', now() + time_window
    );
  END IF;
  
  -- Check if time window has passed (reset counter)
  IF submission_record.last_submission_at < (now() - time_window) THEN
    -- Reset counter
    UPDATE public.form_submissions 
    SET submission_count = 1,
        last_submission_at = now(),
        updated_at = now()
    WHERE ip_address = p_ip_address;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'submissions_remaining', max_submissions - 1,
      'reset_time', now() + time_window
    );
  END IF;
  
  -- Check if limit exceeded
  IF submission_record.submission_count >= max_submissions THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'submissions_remaining', 0,
      'reset_time', submission_record.last_submission_at + time_window,
      'error', 'Rate limit exceeded. You can submit ' || max_submissions || ' forms per day.'
    );
  END IF;
  
  -- Increment submission count
  UPDATE public.form_submissions 
  SET submission_count = submission_count + 1,
      last_submission_at = now(),
      updated_at = now()
  WHERE ip_address = p_ip_address;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'submissions_remaining', max_submissions - (submission_record.submission_count + 1),
    'reset_time', submission_record.last_submission_at + time_window
  );
END;
$$;

-- Create clean, non-conflicting RLS policies for leads table
-- Policy for anonymous users to create leads (simple and clean)
CREATE POLICY "allow_anonymous_insert" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Separate policies for admins - avoid conflicts
CREATE POLICY "allow_admin_select" 
ON public.leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner') 
    AND is_verified = true
  )
);

CREATE POLICY "allow_admin_update" 
ON public.leads 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner') 
    AND is_verified = true
  )
);

CREATE POLICY "allow_admin_delete" 
ON public.leads 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner') 
    AND is_verified = true
  )
);

-- RLS policies for form_submissions (admins only can view)
CREATE POLICY "allow_admin_view_form_submissions" 
ON public.form_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner') 
    AND is_verified = true
  )
);

-- Add updated_at trigger for form_submissions
CREATE TRIGGER update_form_submissions_updated_at
BEFORE UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();