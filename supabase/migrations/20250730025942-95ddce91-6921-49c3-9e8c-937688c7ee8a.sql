-- Fix the invoice PDF generation function query
-- The issue is that invoices and profiles don't have a direct relationship
-- We need to join through the user_id

-- Update the invoice generation function to use proper joins
CREATE OR REPLACE FUNCTION public.generate_invoice_pdf_with_proper_joins(invoice_id_param UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invoice_data jsonb;
BEGIN
  -- Fetch invoice with proper joins
  SELECT 
    jsonb_build_object(
      'id', i.id,
      'invoice_number', i.invoice_number,
      'invoice_date', i.invoice_date,
      'due_date', i.due_date,
      'status', i.status,
      'subtotal_amount', i.subtotal_amount,
      'tax_amount', i.tax_amount,
      'total_amount', i.total_amount,
      'orders', jsonb_build_object(
        'order_number', o.order_number,
        'shipping_address', o.shipping_address,
        'order_items', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'total_price', oi.total_price,
              'gst_rate', oi.gst_rate,
              'products', jsonb_build_object(
                'name', p.name,
                'description', p.description,
                'gst_rate', p.gst_rate
              )
            )
          )
          FROM order_items oi
          LEFT JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = o.id
        )
      ),
      'profiles', jsonb_build_object(
        'full_name', pr.full_name,
        'email', pr.email,
        'phone', pr.phone,
        'address', pr.address
      )
    )
  INTO invoice_data
  FROM invoices i
  LEFT JOIN orders o ON o.id = i.order_id
  LEFT JOIN profiles pr ON pr.user_id = i.user_id
  WHERE i.id = invoice_id_param;
  
  RETURN invoice_data;
END;
$$;