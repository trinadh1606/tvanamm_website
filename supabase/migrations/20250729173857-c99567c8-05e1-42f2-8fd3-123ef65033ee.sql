-- Update invoice generation function to calculate GST per product
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
  
  -- Generate invoice when payment status changes to 'completed' OR when order status changes to 'delivered'
  IF (existing_invoice_id IS NULL) AND 
     ((NEW.payment_status = 'completed' AND OLD.payment_status != 'completed') OR 
      (NEW.status = 'delivered' AND OLD.status != 'delivered')) THEN
    
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