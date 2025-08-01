-- Add the missing order statuses to the enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'payment_completed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'packing';