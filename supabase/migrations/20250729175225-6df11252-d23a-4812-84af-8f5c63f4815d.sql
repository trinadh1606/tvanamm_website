-- Update invoice generation function to trigger on packed, shipped, delivered status OR completed payment
CREATE OR REPLACE FUNCTION public.generate_invoice_on_payment_success()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invoice_number TEXT;
  subtotal_amount NUMERIC := 0;
  tax_amount NUMERIC := 0;
  total_amount NUMERIC;
  existing_invoice_id UUID;
  item_record RECORD;
BEGIN
  -- Check if invoice already exists
  SELECT id INTO existing_invoice_id FROM public.invoices WHERE order_id = NEW.id;
  
  -- Generate invoice when:
  -- 1. Payment status changes to 'completed' OR
  -- 2. Order status changes to 'packed', 'shipped', or 'delivered'
  IF (existing_invoice_id IS NULL) AND 
     ((NEW.payment_status = 'completed' AND OLD.payment_status != 'completed') OR 
      (NEW.status IN ('packed', 'shipped', 'delivered') AND OLD.status NOT IN ('packed', 'shipped', 'delivered'))) THEN
    
    -- Calculate amounts based on individual product GST rates
    FOR item_record IN 
      SELECT 
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        p.gst_rate
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = NEW.id
    LOOP
      -- Calculate item subtotal (price without GST)
      subtotal_amount := subtotal_amount + (item_record.total_price / (1 + item_record.gst_rate / 100));
      
      -- Calculate item tax amount
      tax_amount := tax_amount + (item_record.total_price - (item_record.total_price / (1 + item_record.gst_rate / 100)));
    END LOOP;
    
    -- Total amount should match the order's final amount
    total_amount := NEW.final_amount;
    
    -- Generate invoice number
    invoice_number := generate_invoice_number();
    
    -- Create invoice record
    INSERT INTO public.invoices (
      order_id,
      user_id,
      invoice_number,
      subtotal_amount,
      tax_amount,
      total_amount,
      status,
      invoice_date,
      due_date,
      expires_at
    ) VALUES (
      NEW.id,
      NEW.user_id,
      invoice_number,
      ROUND(subtotal_amount, 2),
      ROUND(tax_amount, 2),
      total_amount,
      CASE WHEN NEW.payment_status = 'completed' THEN 'paid' ELSE 'generated' END,
      now(),
      now() + interval '30 days',
      now() + interval '90 days'
    );
    
    -- Create notification
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      data
    ) VALUES (
      NEW.user_id,
      'Invoice Generated',
      'Invoice ' || invoice_number || ' has been generated for order ' || NEW.order_number,
      'system',
      jsonb_build_object(
        'invoice_number', invoice_number,
        'order_id', NEW.id,
        'order_number', NEW.order_number,
        'amount', total_amount
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Generate missing invoices for existing orders in advanced stages
DO $$
DECLARE
    order_record RECORD;
    invoice_number TEXT;
    subtotal_amount NUMERIC := 0;
    tax_amount NUMERIC := 0;
    total_amount NUMERIC;
    item_record RECORD;
BEGIN
    -- Loop through orders that should have invoices but don't
    FOR order_record IN 
        SELECT o.* 
        FROM public.orders o
        LEFT JOIN public.invoices i ON i.order_id = o.id
        WHERE i.id IS NULL 
        AND (o.status IN ('packed', 'shipped', 'delivered') OR o.payment_status = 'completed')
    LOOP
        -- Reset amounts for each order
        subtotal_amount := 0;
        tax_amount := 0;
        
        -- Calculate amounts based on individual product GST rates
        FOR item_record IN 
            SELECT 
                oi.quantity,
                oi.unit_price,
                oi.total_price,
                p.gst_rate
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = order_record.id
        LOOP
            -- Calculate item subtotal (price without GST)
            subtotal_amount := subtotal_amount + (item_record.total_price / (1 + item_record.gst_rate / 100));
            
            -- Calculate item tax amount
            tax_amount := tax_amount + (item_record.total_price - (item_record.total_price / (1 + item_record.gst_rate / 100)));
        END LOOP;
        
        -- Total amount should match the order's final amount
        total_amount := order_record.final_amount;
        
        -- Generate invoice number
        invoice_number := generate_invoice_number();
        
        -- Create invoice record
        INSERT INTO public.invoices (
            order_id,
            user_id,
            invoice_number,
            subtotal_amount,
            tax_amount,
            total_amount,
            status,
            invoice_date,
            due_date,
            expires_at
        ) VALUES (
            order_record.id,
            order_record.user_id,
            invoice_number,
            ROUND(subtotal_amount, 2),
            ROUND(tax_amount, 2),
            total_amount,
            CASE WHEN order_record.payment_status = 'completed' THEN 'paid' ELSE 'generated' END,
            now(),
            now() + interval '30 days',
            now() + interval '90 days'
        );
        
        -- Create notification
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            data
        ) VALUES (
            order_record.user_id,
            'Invoice Generated',
            'Invoice ' || invoice_number || ' has been generated for order ' || order_record.order_number,
            'system',
            jsonb_build_object(
                'invoice_number', invoice_number,
                'order_id', order_record.id,
                'order_number', order_record.order_number,
                'amount', total_amount
            )
        );
        
        RAISE NOTICE 'Generated invoice % for order %', invoice_number, order_record.order_number;
    END LOOP;
END $$;