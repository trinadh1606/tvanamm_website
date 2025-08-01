-- Create trigger to automatically generate invoices
CREATE TRIGGER generate_invoice_on_payment_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_invoice_on_payment_success();