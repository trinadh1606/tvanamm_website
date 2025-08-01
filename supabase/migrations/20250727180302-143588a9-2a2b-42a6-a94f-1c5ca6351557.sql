-- Fix security warnings by setting proper search_path

-- Fix function: generate_tvanamm_id
CREATE OR REPLACE FUNCTION public.generate_tvanamm_id()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_id TEXT;
BEGIN
  new_id := 'TVN' || TO_CHAR(NOW(), 'YYYY') || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN new_id;
END;
$$;

-- Fix function: update_franchise_revenue
CREATE OR REPLACE FUNCTION public.update_franchise_revenue()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.franchises 
    SET total_revenue = COALESCE(total_revenue, 0) + NEW.final_amount,
        monthly_revenue = COALESCE(monthly_revenue, 0) + NEW.final_amount
    WHERE id = NEW.franchise_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix function: update_inventory_on_order
CREATE OR REPLACE FUNCTION public.update_inventory_on_order()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;