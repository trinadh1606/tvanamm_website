-- Fix the security definer functions to have proper search path
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'TVN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('public.order_number_seq')::TEXT, 4, '0');
  RETURN new_number;
END;
$function$;

-- Fix the generate_tvanamm_id function as well
CREATE OR REPLACE FUNCTION public.generate_tvanamm_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_id TEXT;
BEGIN
  new_id := 'TVN' || TO_CHAR(NOW(), 'YYYY') || LPAD(NEXTVAL('public.order_number_seq')::TEXT, 6, '0');
  RETURN new_id;
END;
$function$;