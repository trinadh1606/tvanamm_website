-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  user_id UUID NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  total_amount NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  subtotal_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated',
  pdf_url TEXT,
  download_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for invoices
CREATE POLICY "Users can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all invoices" 
ON public.invoices 
FOR ALL 
USING (is_admin_or_owner(auth.uid()));

CREATE POLICY "System can create invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.invoices 
ADD CONSTRAINT invoices_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('public.order_number_seq')::TEXT, 4, '0');
  RETURN new_number;
END;
$function$

-- Create function to generate invoice on payment success
CREATE OR REPLACE FUNCTION public.generate_invoice_on_payment_success()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  tax_rate NUMERIC := 18.0; -- GST rate
  subtotal NUMERIC;
  tax_amt NUMERIC;
  expires_date TIMESTAMP WITH TIME ZONE;
  franchise_tvanamm TEXT;
BEGIN
  -- Only generate invoice when payment status becomes 'completed'
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    
    -- Calculate amounts
    subtotal := NEW.total_amount;
    tax_amt := (subtotal * tax_rate) / 100;
    
    -- Set expiry date based on user role (15 days for franchise, 20 days for owner)
    SELECT f.tvanamm_id INTO franchise_tvanamm
    FROM public.franchises f 
    WHERE f.user_id = NEW.user_id;
    
    IF franchise_tvanamm IS NOT NULL THEN
      expires_date := now() + interval '15 days'; -- Franchise gets 15 days
    ELSE
      expires_date := now() + interval '20 days'; -- Owner gets 20 days
    END IF;
    
    -- Create invoice
    INSERT INTO public.invoices (
      order_id,
      user_id,
      invoice_number,
      total_amount,
      tax_amount,
      subtotal_amount,
      expires_at
    )
    VALUES (
      NEW.id,
      NEW.user_id,
      generate_invoice_number(),
      NEW.final_amount,
      tax_amt,
      subtotal,
      expires_date
    );
  END IF;
  
  RETURN NEW;
END;
$function$

-- Create trigger for automatic invoice generation
CREATE TRIGGER generate_invoice_on_payment_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_invoice_on_payment_success();

-- Create function to cleanup expired invoices
CREATE OR REPLACE FUNCTION public.cleanup_expired_invoices()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete expired invoices
  DELETE FROM public.invoices 
  WHERE expires_at < now() AND expires_at IS NOT NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$function$

-- Create function to cleanup old order history
CREATE OR REPLACE FUNCTION public.cleanup_old_order_history()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  deleted_count INTEGER := 0;
  franchise_cutoff TIMESTAMP WITH TIME ZONE;
  owner_cutoff TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set cutoff dates
  franchise_cutoff := now() - interval '30 days';
  owner_cutoff := now() - interval '45 days';
  
  -- Delete old orders for franchise users (30 days)
  DELETE FROM public.orders 
  WHERE created_at < franchise_cutoff
  AND user_id IN (
    SELECT user_id FROM public.profiles WHERE role = 'franchise'
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete old orders for owner/admin users (45 days) 
  DELETE FROM public.orders 
  WHERE created_at < owner_cutoff
  AND user_id IN (
    SELECT user_id FROM public.profiles WHERE role IN ('owner', 'admin')
  );
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  RETURN deleted_count;
END;
$function$

-- Enable realtime for invoices table
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;

-- Add tracking details to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS transport_company TEXT,
ADD COLUMN IF NOT EXISTS driver_name TEXT,
ADD COLUMN IF NOT EXISTS driver_contact TEXT,
ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery TEXT,
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT;