-- Create function to clean up duplicate orders (keeping only the latest one for each user)
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_orders()
RETURNS TABLE(deleted_count integer, kept_orders uuid[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  order_record RECORD;
  duplicate_count INTEGER := 0;
  kept_orders UUID[] := '{}';
BEGIN
  -- Find users with multiple orders and delete all but the most recent one
  FOR order_record IN 
    SELECT user_id, COUNT(*) as order_count
    FROM public.orders 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
  LOOP
    -- For each user with duplicates, keep only the most recent order
    WITH user_orders AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
      FROM public.orders 
      WHERE user_id = order_record.user_id
    ),
    orders_to_delete AS (
      SELECT id FROM user_orders WHERE rn > 1
    ),
    orders_to_keep AS (
      SELECT id FROM user_orders WHERE rn = 1
    )
    -- Delete order items for duplicate orders first
    DELETE FROM public.order_items 
    WHERE order_id IN (SELECT id FROM orders_to_delete);
    
    -- Delete the duplicate orders
    DELETE FROM public.orders 
    WHERE id IN (SELECT id FROM orders_to_delete);
    
    -- Track what we deleted and kept
    GET DIAGNOSTICS duplicate_count = ROW_COUNT;
    
    -- Add kept order to array
    SELECT array_append(kept_orders, id) INTO kept_orders
    FROM user_orders WHERE rn = 1;
  END LOOP;
  
  RETURN QUERY SELECT duplicate_count, kept_orders;
END;
$$;