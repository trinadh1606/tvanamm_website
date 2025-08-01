-- Update user roles to remove customer role and add proper franchise management
-- First drop existing enum and recreate with correct roles
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'franchise');

-- Update profiles table role column default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'franchise'::user_role;

-- Create orders workflow status enum
CREATE TYPE order_workflow_status AS ENUM (
  'pending_review',     -- Franchise placed order, waiting for owner review
  'delivery_fee_added', -- Owner added delivery fee
  'confirmed',          -- Order confirmed by owner
  'payment_pending',    -- Payment required from franchise
  'paid',              -- Payment completed
  'packing',           -- Being packed
  'packed',            -- Packed and ready to ship
  'shipped',           -- Shipped with transport details
  'delivered'          -- Delivered to franchise
);

-- Add workflow status to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS workflow_status order_workflow_status DEFAULT 'pending_review';

-- Add delivery fee tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS base_amount numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee_added_by uuid REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee_added_at timestamptz;

-- Add packing and shipping tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS packing_notes text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_details jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transport_details jsonb;

-- Create notifications table for real-time messaging
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type DEFAULT 'system',
  is_read boolean DEFAULT false,
  action_url text,
  data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" 
ON notifications FOR INSERT 
WITH CHECK (true);

-- Create franchise_inquiries table for customer inquiries
CREATE TABLE IF NOT EXISTS franchise_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  message text NOT NULL,
  franchise_id uuid REFERENCES franchises(id),
  status text DEFAULT 'new',
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on franchise_inquiries
ALTER TABLE franchise_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for franchise inquiries
CREATE POLICY "Anyone can create franchise inquiries" 
ON franchise_inquiries FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage franchise inquiries" 
ON franchise_inquiries FOR ALL 
USING (is_admin_or_owner(auth.uid()));

-- Update order triggers for workflow status
CREATE OR REPLACE FUNCTION update_order_workflow()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update workflow status based on other fields
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    NEW.workflow_status = 'paid';
  END IF;
  
  IF NEW.packed_at IS NOT NULL AND OLD.packed_at IS NULL THEN
    NEW.workflow_status = 'packed';
  END IF;
  
  IF NEW.shipped_at IS NOT NULL AND OLD.shipped_at IS NULL THEN
    NEW.workflow_status = 'shipped';
  END IF;
  
  IF NEW.delivered_at IS NOT NULL AND OLD.delivered_at IS NULL THEN
    NEW.workflow_status = 'delivered';
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order workflow updates
DROP TRIGGER IF EXISTS update_order_workflow_trigger ON orders;
CREATE TRIGGER update_order_workflow_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_workflow();

-- Create function to send notifications
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id uuid,
  notification_title text,
  notification_message text,
  notification_type notification_type DEFAULT 'system',
  notification_action_url text DEFAULT NULL,
  notification_data jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_url, data)
  VALUES (target_user_id, notification_title, notification_message, notification_type, notification_action_url, notification_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;