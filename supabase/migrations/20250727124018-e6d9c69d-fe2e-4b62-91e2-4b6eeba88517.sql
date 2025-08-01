-- Enhanced loyalty points system with manual management
-- Update loyalty_points table to track manual adjustments
ALTER TABLE public.loyalty_points 
ADD COLUMN manual_adjustments INTEGER DEFAULT 0,
ADD COLUMN last_manual_adjustment_by UUID,
ADD COLUMN last_manual_adjustment_at TIMESTAMPTZ,
ADD COLUMN last_manual_adjustment_reason TEXT;

-- Create loyalty transactions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'manual_add', 'manual_subtract')),
  points INTEGER NOT NULL,
  order_id UUID,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create loyalty redemption options table
CREATE TABLE public.loyalty_redemption_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  value_type TEXT NOT NULL CHECK (value_type IN ('free_delivery', 'product', 'discount')),
  value_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create customer testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  customer_image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create statistics table for homepage counters
CREATE TABLE public.site_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL UNIQUE,
  metric_value INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create leads table for contact forms
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  assigned_to UUID,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_redemption_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_transactions
CREATE POLICY "Users can view their own loyalty transactions" 
ON public.loyalty_transactions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage loyalty transactions" 
ON public.loyalty_transactions FOR ALL 
USING (true);

-- RLS Policies for loyalty_redemption_options
CREATE POLICY "Anyone can view active redemption options" 
ON public.loyalty_redemption_options FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage redemption options" 
ON public.loyalty_redemption_options FOR ALL 
USING (is_admin_or_owner(auth.uid()));

-- RLS Policies for testimonials
CREATE POLICY "Anyone can view active testimonials" 
ON public.testimonials FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" 
ON public.testimonials FOR ALL 
USING (is_admin_or_owner(auth.uid()));

-- RLS Policies for site_statistics
CREATE POLICY "Anyone can view site statistics" 
ON public.site_statistics FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site statistics" 
ON public.site_statistics FOR ALL 
USING (is_admin_or_owner(auth.uid()));

-- RLS Policies for leads
CREATE POLICY "Admins can manage leads" 
ON public.leads FOR ALL 
USING (is_admin_or_owner(auth.uid()));

CREATE POLICY "Anyone can create leads" 
ON public.leads FOR INSERT 
WITH CHECK (true);

-- Insert default loyalty redemption options
INSERT INTO public.loyalty_redemption_options (name, description, points_required, value_type, value_data) VALUES
('Free Delivery', 'Get free delivery on your next order', 500, 'free_delivery', '{"delivery_value": 0}'),
('30 Tea Cups Set', 'Premium tea cups set (30 pieces)', 500, 'product', '{"product_name": "Premium Tea Cups Set", "quantity": 30}');

-- Insert default site statistics
INSERT INTO public.site_statistics (metric_name, metric_value) VALUES
('tea_varieties', 50),
('customers_served', 10000),
('franchise_locations', 25),
('years_experience', 15);

-- Insert sample testimonials
INSERT INTO public.testimonials (customer_name, customer_location, rating, testimonial_text, is_featured) VALUES
('Rajesh Kumar', 'Mumbai, Maharashtra', 5, 'T VANAMM teas have completely transformed my daily tea experience. The quality is exceptional and the franchise support is outstanding.', true),
('Priya Sharma', 'Delhi', 5, 'As a franchise partner, I am impressed with the business model and consistent quality. My customers love the authentic flavors.', true),
('Arun Patel', 'Ahmedabad, Gujarat', 4, 'The variety of teas available is amazing. From traditional to premium blends, T VANAMM has something for everyone.', true),
('Meera Singh', 'Jaipur, Rajasthan', 5, 'Excellent customer service and prompt delivery. The loyalty program is a great added benefit.', false),
('Suresh Reddy', 'Hyderabad, Telangana', 5, 'Quality tea at affordable prices. The franchise opportunity has been very profitable for my family business.', false);

-- Function to automatically award loyalty points for orders
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if order value is >= 5000 and payment is successful
  IF NEW.final_amount >= 5000 AND NEW.payment_status = 'paid' THEN
    -- Add 20 loyalty points
    INSERT INTO public.loyalty_transactions (user_id, type, points, order_id, description)
    VALUES (NEW.user_id, 'earned', 20, NEW.id, 'Points earned for order above ₹5000');
    
    -- Update loyalty points balance
    UPDATE public.loyalty_points 
    SET points_earned = points_earned + 20,
        current_balance = current_balance + 20,
        total_lifetime_points = total_lifetime_points + 20,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic loyalty points
CREATE TRIGGER trigger_award_loyalty_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.award_loyalty_points();

-- Function to manually adjust loyalty points (Admin only)
CREATE OR REPLACE FUNCTION public.manual_loyalty_adjustment(
  target_user_id UUID,
  adjustment_points INTEGER,
  adjustment_reason TEXT,
  admin_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the admin has permission
  IF NOT is_admin_or_owner(admin_user_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Insert transaction record
  INSERT INTO public.loyalty_transactions (user_id, type, points, description, created_by)
  VALUES (
    target_user_id, 
    CASE WHEN adjustment_points > 0 THEN 'manual_add' ELSE 'manual_subtract' END,
    ABS(adjustment_points),
    adjustment_reason,
    admin_user_id
  );
  
  -- Update loyalty points
  UPDATE public.loyalty_points 
  SET 
    manual_adjustments = manual_adjustments + adjustment_points,
    current_balance = current_balance + adjustment_points,
    total_lifetime_points = GREATEST(0, total_lifetime_points + GREATEST(0, adjustment_points)),
    last_manual_adjustment_by = admin_user_id,
    last_manual_adjustment_at = now(),
    last_manual_adjustment_reason = adjustment_reason,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to redeem loyalty points
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(
  user_id_param UUID,
  redemption_option_id UUID,
  order_id_param UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  required_points INTEGER;
  current_points INTEGER;
BEGIN
  -- Get required points for redemption option
  SELECT points_required INTO required_points
  FROM public.loyalty_redemption_options
  WHERE id = redemption_option_id AND is_active = true;
  
  IF required_points IS NULL THEN
    RAISE EXCEPTION 'Invalid redemption option';
  END IF;
  
  -- Get current points balance
  SELECT current_balance INTO current_points
  FROM public.loyalty_points
  WHERE user_id = user_id_param;
  
  IF current_points < required_points THEN
    RAISE EXCEPTION 'Insufficient loyalty points';
  END IF;
  
  -- Record redemption transaction
  INSERT INTO public.loyalty_transactions (user_id, type, points, order_id, description)
  VALUES (
    user_id_param, 
    'redeemed', 
    required_points, 
    order_id_param,
    'Points redeemed for ' || (SELECT name FROM public.loyalty_redemption_options WHERE id = redemption_option_id)
  );
  
  -- Update loyalty points balance
  UPDATE public.loyalty_points 
  SET 
    points_redeemed = points_redeemed + required_points,
    current_balance = current_balance - required_points,
    updated_at = now()
  WHERE user_id = user_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;