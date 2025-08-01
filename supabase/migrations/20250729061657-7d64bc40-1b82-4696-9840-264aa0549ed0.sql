-- Fix search path security warnings for functions
ALTER FUNCTION public.update_inventory_on_order() SET search_path TO 'public';
ALTER FUNCTION public.update_franchise_revenue() SET search_path TO 'public';