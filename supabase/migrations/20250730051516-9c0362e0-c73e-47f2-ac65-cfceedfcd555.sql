-- Remove duplicate foreign key constraint that's causing PostgREST confusion
ALTER TABLE public.invoices 
DROP CONSTRAINT IF EXISTS invoices_order_id_fkey;