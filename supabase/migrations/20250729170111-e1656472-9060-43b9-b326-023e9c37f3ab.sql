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

-- Add tracking details to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS transport_company TEXT,
ADD COLUMN IF NOT EXISTS driver_name TEXT,
ADD COLUMN IF NOT EXISTS driver_contact TEXT,
ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery TEXT,
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Enable realtime for invoices table
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;