-- Fix security warnings by setting proper search_path for functions

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix generate_order_number function  
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