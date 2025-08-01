-- Add foreign key constraints for invoices table to fix PostgREST relationships

-- Add foreign key from invoices.order_id to orders.id
ALTER TABLE public.invoices 
ADD CONSTRAINT fk_invoices_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Add foreign key from invoices.user_id to profiles.user_id  
ALTER TABLE public.invoices 
ADD CONSTRAINT fk_invoices_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;