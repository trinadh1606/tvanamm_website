-- Fix RLS policy for leads table to allow anonymous inserts
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow lead inserts" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Create policy to allow anyone to insert leads (for contact forms)
CREATE POLICY "Anyone can insert leads" ON public.leads
FOR INSERT 
WITH CHECK (true);

-- Admin/owner can view all leads
CREATE POLICY "Admin and owner can view all leads" ON public.leads
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);