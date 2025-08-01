-- Fix leads table schema and RLS policies

-- Add city column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city TEXT;

-- Drop existing duplicate RLS policies
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Create a single, clear RLS policy for anonymous lead creation
CREATE POLICY "Allow anonymous lead creation" 
ON public.leads 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Ensure admins can still manage all leads
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
CREATE POLICY "Admins can manage leads" 
ON public.leads 
FOR ALL 
TO authenticated
USING (is_admin_or_owner(auth.uid()));

-- Create policy for admin viewing
DROP POLICY IF EXISTS "Admin and owner can view all leads" ON public.leads;
CREATE POLICY "Admin and owner can view all leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (is_admin_or_owner(auth.uid()));