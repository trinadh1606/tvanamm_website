-- Create testimonials table for customer reviews
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_location TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view featured testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_featured = true);

CREATE POLICY "Admins can manage all testimonials" 
ON public.testimonials 
FOR ALL 
USING (is_admin_or_owner(auth.uid()));

-- Create trigger for timestamps
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create site_statistics table for dynamic homepage stats
CREATE TABLE public.site_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key TEXT NOT NULL UNIQUE,
  stat_value INTEGER NOT NULL DEFAULT 0,
  display_label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active statistics" 
ON public.site_statistics 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage statistics" 
ON public.site_statistics 
FOR ALL 
USING (is_admin_or_owner(auth.uid()));

-- Create trigger for timestamps
CREATE TRIGGER update_site_statistics_updated_at
BEFORE UPDATE ON public.site_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial statistics data
INSERT INTO public.site_statistics (stat_key, stat_value, display_label, sort_order) VALUES
('tea_varieties', 50, 'Tea Varieties', 1),
('customers_served', 10000, 'Customers Served', 2),
('franchise_locations', 25, 'Franchise Locations', 3),
('years_experience', 15, 'Years Experience', 4);

-- Insert sample testimonials
INSERT INTO public.testimonials (customer_name, customer_location, rating, testimonial_text, is_featured) VALUES
('Rajesh Kumar', 'Mumbai, Maharashtra', 5, 'T VANAMM teas have completely transformed my daily tea experience. The quality is exceptional and the franchise support is outstanding.', true),
('Priya Sharma', 'Delhi', 5, 'As a franchise partner, I am impressed with the business model and consistent quality. My customers love the authentic flavors.', true),
('Arun Patel', 'Ahmedabad, Gujarat', 4, 'The variety of teas available is amazing. From traditional to premium blends, T VANAMM has something for everyone.', true),
('Meera Singh', 'Bangalore, Karnataka', 5, 'The organic tea collection is absolutely wonderful. Great taste and health benefits combined.', true),
('Vikram Reddy', 'Hyderabad, Telangana', 5, 'Excellent customer service and timely delivery. The franchise model is very well structured.', false),
('Anita Gupta', 'Pune, Maharashtra', 4, 'Premium quality teas at reasonable prices. Highly recommend to all tea lovers.', false);

-- Insert sample categories
INSERT INTO public.categories (name, description, image_url, sort_order) VALUES
('Black Tea', 'Rich and robust black tea varieties', '/images/black-tea.jpg', 1),
('Green Tea', 'Fresh and healthy green tea collection', '/images/green-tea.jpg', 2),
('Herbal Tea', 'Natural herbal and wellness teas', '/images/herbal-tea.jpg', 3),
('Premium Blends', 'Exclusive premium tea blends', '/images/premium-blends.jpg', 4),
('Organic Tea', 'Certified organic tea collection', '/images/organic-tea.jpg', 5),
('Specialty Tea', 'Unique and exotic tea varieties', '/images/specialty-tea.jpg', 6);

-- Insert sample products
INSERT INTO public.products (name, description, price, category_id, sku, stock_quantity, minimum_stock, weight, images) VALUES
('Earl Grey Supreme', 'Premium Earl Grey with bergamot and cornflower petals', 450.00, (SELECT id FROM categories WHERE name = 'Black Tea'), 'BT001', 150, 20, 100, '["https://images.unsplash.com/photo-1597318281675-09c5dbb6a3d5?w=400"]'),
('Darjeeling Gold', 'High-grade Darjeeling tea with muscatel flavor', 650.00, (SELECT id FROM categories WHERE name = 'Black Tea'), 'BT002', 100, 15, 100, '["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400"]'),
('Jasmine Phoenix Pearls', 'Hand-rolled green tea scented with jasmine flowers', 850.00, (SELECT id FROM categories WHERE name = 'Green Tea'), 'GT001', 75, 10, 50, '["https://images.unsplash.com/photo-1563822249548-4a58c76635c5?w=400"]'),
('Sencha Supreme', 'Premium Japanese sencha with fresh grassy notes', 720.00, (SELECT id FROM categories WHERE name = 'Green Tea'), 'GT002', 90, 12, 75, '["https://images.unsplash.com/photo-1556881286-2c23d17b9c93?w=400"]'),
('Chamomile Dreams', 'Soothing chamomile with honey notes', 380.00, (SELECT id FROM categories WHERE name = 'Herbal Tea'), 'HT001', 200, 25, 80, '["https://images.unsplash.com/photo-1597318281675-09c5dbb6a3d5?w=400"]'),
('Peppermint Fresh', 'Refreshing organic peppermint leaves', 320.00, (SELECT id FROM categories WHERE name = 'Herbal Tea'), 'HT002', 180, 20, 60, '["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400"]'),
('Royal Blend', 'Signature blend of Assam and Ceylon teas', 950.00, (SELECT id FROM categories WHERE name = 'Premium Blends'), 'PB001', 50, 8, 125, '["https://images.unsplash.com/photo-1563822249548-4a58c76635c5?w=400"]'),
('Emperor''s Choice', 'Exclusive premium blend with spices', 1200.00, (SELECT id FROM categories WHERE name = 'Premium Blends'), 'PB002', 30, 5, 150, '["https://images.unsplash.com/photo-1556881286-2c23d17b9c93?w=400"]');

-- Insert loyalty gifts
INSERT INTO public.loyalty_gifts (name, description, points_required, stock_quantity, image_url) VALUES
('Premium Tea Set', 'Beautiful ceramic tea set with 4 cups and teapot', 2500, 25, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400'),
('Tea Tasting Kit', 'Collection of 12 different tea samples', 1500, 40, 'https://images.unsplash.com/photo-1556881286-2c23d17b9c93?w=400'),
('Bamboo Tea Infuser', 'Eco-friendly bamboo tea infuser set', 800, 60, 'https://images.unsplash.com/photo-1563822249548-4a58c76635c5?w=400'),
('T VANAMM Mug', 'Official branded ceramic mug', 500, 100, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400'),
('Tea Storage Tin', 'Airtight tea storage container', 600, 80, 'https://images.unsplash.com/photo-1597318281675-09c5dbb6a3d5?w=400'),
('Digital Scale', 'Precision scale for tea measurements', 1200, 30, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400');

-- Enable realtime for new tables
ALTER publication supabase_realtime ADD TABLE public.testimonials;
ALTER publication supabase_realtime ADD TABLE public.site_statistics;

-- Set replica identity for realtime
ALTER TABLE public.testimonials REPLICA IDENTITY FULL;
ALTER TABLE public.site_statistics REPLICA IDENTITY FULL;