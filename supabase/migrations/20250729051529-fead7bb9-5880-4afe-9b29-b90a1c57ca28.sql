-- Fix order_number_seq permissions and ensure it exists
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

-- Grant proper permissions to the sequence
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO authenticator;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO authenticated;

-- Update the generate_order_number function to use proper schema reference
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'TVN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('public.order_number_seq')::TEXT, 4, '0');
  RETURN new_number;
END;
$function$;