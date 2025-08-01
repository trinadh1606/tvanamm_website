-- Fix the cleanup function to properly handle CTE scope
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_orders()
RETURNS TABLE(deleted_count integer, kept_orders uuid[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  duplicate_count INTEGER := 0;
  kept_orders UUID[] := '{}';
  user_record RECORD;
  total_deleted INTEGER := 0;
BEGIN
  -- Find users with multiple orders and delete all but the most recent one
  FOR user_record IN 
    SELECT user_id, COUNT(*) as order_count
    FROM public.orders 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
  LOOP
    -- For each user with duplicates, delete all but the most recent order
    WITH user_orders AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
      FROM public.orders 
      WHERE user_id = user_record.user_id
    )
    -- Delete order items for duplicate orders first
    DELETE FROM public.order_items 
    WHERE order_id IN (
      SELECT id FROM user_orders WHERE rn > 1
    );
    
    -- Delete the duplicate orders
    WITH user_orders AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
      FROM public.orders 
      WHERE user_id = user_record.user_id
    )
    DELETE FROM public.orders 
    WHERE id IN (
      SELECT id FROM user_orders WHERE rn > 1
    );
    
    -- Track what we deleted
    GET DIAGNOSTICS duplicate_count = ROW_COUNT;
    total_deleted := total_deleted + duplicate_count;
    
    -- Add kept order to array
    SELECT array_append(kept_orders, o.id) INTO kept_orders
    FROM public.orders o
    WHERE o.user_id = user_record.user_id
    ORDER BY o.created_at DESC
    LIMIT 1;
  END LOOP;
  
  RETURN QUERY SELECT total_deleted, kept_orders;
END;
$$;

-- Execute the fixed cleanup function
SELECT * FROM public.cleanup_duplicate_orders();