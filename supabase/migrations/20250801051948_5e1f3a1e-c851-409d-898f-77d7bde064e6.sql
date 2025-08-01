-- Drop existing conflicting RLS policies on leads table
DROP POLICY IF EXISTS "Admin and owner can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous lead creation" ON public.leads;

-- Create clean, non-conflicting RLS policies
-- Policy for anonymous users to create leads
CREATE POLICY "enable_anonymous_lead_creation" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Policy for admins to view all leads
CREATE POLICY "enable_admin_view_leads" 
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

-- Policy for admins to manage leads
CREATE POLICY "enable_admin_manage_leads" 
ON public.leads 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner') 
    AND is_verified = true
  )
);