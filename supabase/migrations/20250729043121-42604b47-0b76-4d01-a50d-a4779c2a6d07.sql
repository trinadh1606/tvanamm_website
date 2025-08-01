-- Add packing and real-time workflow columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS packing_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS packing_started_by UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS packing_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS packing_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee_added_by UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reminder_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_by UUID;

-- Create packing_items table for real-time packing checklist
CREATE TABLE IF NOT EXISTS packing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  packed_quantity INTEGER DEFAULT 0,
  is_packed BOOLEAN DEFAULT false,
  packed_at TIMESTAMP WITH TIME ZONE,
  packed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on packing_items
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;

-- Create policies for packing_items
CREATE POLICY "Admins can manage all packing items" ON packing_items
  FOR ALL USING (is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can view packing items for their orders" ON packing_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = packing_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Enable real-time for packing_items
ALTER TABLE packing_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE packing_items;

-- Add trigger for updated_at on packing_items
CREATE TRIGGER update_packing_items_updated_at
  BEFORE UPDATE ON packing_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create packing items when order status changes to packing
CREATE OR REPLACE FUNCTION create_packing_items()
RETURNS TRIGGER AS $$
BEGIN
  -- When order status changes to 'packing', create packing items
  IF NEW.status = 'packing' AND OLD.status != 'packing' THEN
    INSERT INTO packing_items (order_id, product_id, quantity)
    SELECT NEW.id, oi.product_id, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-creating packing items
CREATE TRIGGER auto_create_packing_items
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_packing_items();