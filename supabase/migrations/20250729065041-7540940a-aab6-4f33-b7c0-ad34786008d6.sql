-- Fix database functions to use 'delivered' instead of 'completed'

-- Update award_loyalty_points function
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Only award points when order is delivered and amount >= 5000
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.final_amount >= 5000 THEN
    -- Get franchise member's TVANAMM ID
    DECLARE
      franchise_tvanamm_id TEXT;
    BEGIN
      SELECT f.tvanamm_id INTO franchise_tvanamm_id
      FROM public.franchises f 
      WHERE f.user_id = NEW.user_id;
      
      -- Only proceed if user is a franchise member
      IF franchise_tvanamm_id IS NOT NULL THEN
        -- Add 20 points to loyalty_points
        INSERT INTO public.loyalty_points (user_id, tvanamm_id, current_balance, points_earned, total_lifetime_points)
        VALUES (NEW.user_id, franchise_tvanamm_id, 20, 20, 20)
        ON CONFLICT (user_id) DO UPDATE SET
          current_balance = public.loyalty_points.current_balance + 20,
          points_earned = public.loyalty_points.points_earned + 20,
          total_lifetime_points = public.loyalty_points.total_lifetime_points + 20,
          tvanamm_id = franchise_tvanamm_id,
          updated_at = now();
        
        -- Record transaction
        INSERT INTO public.loyalty_transactions (user_id, tvanamm_id, points, type, description, order_id)
        VALUES (NEW.user_id, franchise_tvanamm_id, 20, 'earned', 'Order delivery reward - Order #' || NEW.order_number, NEW.id);
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update update_inventory_on_order function
CREATE OR REPLACE FUNCTION public.update_inventory_on_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  item RECORD;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
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
        'Order delivery: ' || NEW.order_number,
        NEW.user_id
      FROM public.products 
      WHERE id = item.product_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update update_franchise_revenue function
CREATE OR REPLACE FUNCTION public.update_franchise_revenue()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE public.franchises 
    SET total_revenue = COALESCE(total_revenue, 0) + NEW.final_amount,
        monthly_revenue = COALESCE(monthly_revenue, 0) + NEW.final_amount
    WHERE id = NEW.franchise_id;
  END IF;
  RETURN NEW;
END;
$function$;