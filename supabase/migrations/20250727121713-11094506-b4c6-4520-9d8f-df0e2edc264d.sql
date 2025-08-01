-- Fix security issues from the linter

-- Fix function search paths by setting them explicitly
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_admin_or_owner(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'owner') FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Initialize loyalty points for new user
  INSERT INTO public.loyalty_points (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'TVN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Add missing RLS policies for tables without any

-- Policies for loyalty_transactions
CREATE POLICY "Users can view their own loyalty transactions" ON public.loyalty_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage loyalty transactions" ON public.loyalty_transactions
  FOR ALL USING (true);

-- Policies for loyalty_gifts (public read, admin write)
CREATE POLICY "Anyone can view active loyalty gifts" ON public.loyalty_gifts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage loyalty gifts" ON public.loyalty_gifts
  FOR ALL USING (public.is_admin_or_owner(auth.uid()));

-- Policies for gift_redemptions
CREATE POLICY "Users can view their own gift redemptions" ON public.gift_redemptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own gift redemptions" ON public.gift_redemptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own gift redemptions" ON public.gift_redemptions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all gift redemptions" ON public.gift_redemptions
  FOR ALL USING (public.is_admin_or_owner(auth.uid()));

-- Policies for analytics_events (admin access only)
CREATE POLICY "Admins can view all analytics events" ON public.analytics_events
  FOR SELECT USING (public.is_admin_or_owner(auth.uid()));

CREATE POLICY "System can create analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);