-- Add foreign key constraint between orders and profiles
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_user_profiles 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
ON DELETE CASCADE;