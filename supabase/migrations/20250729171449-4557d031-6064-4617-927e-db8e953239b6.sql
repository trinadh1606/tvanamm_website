-- Create function to generate invoice after payment completion
CREATE OR REPLACE FUNCTION public.generate_invoice_on_payment_success()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invoice_number TEXT;
  subtotal_amount NUMERIC;
  tax_amount NUMERIC;
  total_amount NUMERIC;
BEGIN
  -- Only generate invoice when payment status changes to 'completed'
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    -- Calculate amounts
    subtotal_amount := NEW.final_amount / 1.18; -- Assuming 18% GST
    tax_amount := NEW.final_amount - subtotal_amount;
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
      subtotal_amount,
      tax_amount,
      total_amount,
      'generated',
      now(),
      now() + interval '30 days',
      now() + interval '90 days'
    );
  END IF;
  
  RETURN NEW;
END;
$function$

-- Create trigger to automatically generate invoices
CREATE TRIGGER generate_invoice_on_payment_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_invoice_on_payment_success();