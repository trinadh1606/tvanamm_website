-- Phase 1: Database Schema Enhancements

-- Add GST field to products table
ALTER TABLE public.products 
ADD COLUMN gst_rate DECIMAL(5,2) DEFAULT 18.00;

-- Add TVANAMM ID and access control to profiles
ALTER TABLE public.profiles 
ADD COLUMN tvanamm_id TEXT UNIQUE,
ADD COLUMN dashboard_access_enabled BOOLEAN DEFAULT false,
ADD COLUMN profile_completion_status TEXT DEFAULT 'incomplete' CHECK (profile_completion_status IN ('incomplete', 'pending_approval', 'approved')),
ADD COLUMN assigned_by UUID REFERENCES auth.users(id),
ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE;

-- Add dashboard access control to franchises
ALTER TABLE public.franchises
ADD COLUMN dashboard_enabled BOOLEAN DEFAULT false,
ADD COLUMN tvanamm_id TEXT UNIQUE,
ADD COLUMN total_revenue DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN monthly_revenue DECIMAL(15,2) DEFAULT 0.00;

-- Create inventory tracking table
CREATE TABLE public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('restock', 'sale', 'adjustment', 'return')),
  quantity_change INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on inventory_logs
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for inventory logs
CREATE POLICY "Admins can manage inventory logs" ON public.inventory_logs
FOR ALL USING (is_admin_or_owner(auth.uid()));

-- Create function to generate TVANAMM ID
CREATE OR REPLACE FUNCTION public.generate_tvanamm_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
BEGIN
  new_id := 'TVN' || TO_CHAR(NOW(), 'YYYY') || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update franchise revenue
CREATE OR REPLACE FUNCTION public.update_franchise_revenue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.franchises 
    SET total_revenue = COALESCE(total_revenue, 0) + NEW.final_amount,
        monthly_revenue = COALESCE(monthly_revenue, 0) + NEW.final_amount
    WHERE id = NEW.franchise_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for franchise revenue updates
CREATE TRIGGER update_franchise_revenue_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_franchise_revenue();

-- Create function to update inventory on order completion
CREATE OR REPLACE FUNCTION public.update_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    FOR item IN 
      SELECT product_id, quantity 
      FROM public.order_items 
      WHERE order_id = NEW.id
    LOOP
      -- Update product stock
      UPDATE public.products 
      SET stock_quantity = stock_quantity - item.quantity
      WHERE id = item.product_id;
      
      -- Log inventory change
      INSERT INTO public.inventory_logs (
        product_id, 
        change_type, 
        quantity_change, 
        previous_stock, 
        new_stock,
        reason,
        performed_by
      )
      SELECT 
        item.product_id,
        'sale',
        -item.quantity,
        stock_quantity + item.quantity,
        stock_quantity,
        'Order completion: ' || NEW.order_number,
        NEW.user_id
      FROM public.products 
      WHERE id = item.product_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory updates
CREATE TRIGGER update_inventory_on_order_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_on_order();

-- Update handle_new_user function to set proper defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, profile_completion_status, dashboard_access_enabled)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'incomplete',
    false
  );
  
  -- Initialize loyalty points for new user
  INSERT INTO public.loyalty_points (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;