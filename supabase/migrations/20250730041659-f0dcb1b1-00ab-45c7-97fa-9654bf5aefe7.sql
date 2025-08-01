-- Create blog_posts table for real-time blog editing
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  author TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  tags TEXT[],
  meta_description TEXT,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog posts
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (published = true);

CREATE POLICY "Owners can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (is_admin_or_owner(auth.uid()));

-- Create function to update timestamps
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample blog posts based on the current static content
INSERT INTO public.blog_posts (title, content, excerpt, category, author, featured, published, published_at, slug) VALUES
('The Complete Guide to Green Tea Health Benefits', 
 'Discover the scientifically proven health benefits of green tea and how incorporating it into your daily routine can improve your overall wellness. Green tea contains powerful antioxidants called catechins, which have been shown to reduce inflammation, boost metabolism, and support heart health.',
 'Discover the scientifically proven health benefits of green tea and how incorporating it into your daily routine can improve your overall wellness.',
 'health',
 'Dr. Priya Sharma',
 true,
 true,
 now() - interval '5 days',
 'complete-guide-green-tea-health-benefits'),

('Success Story: From Employee to Franchise Owner',
 'Learn how Rajesh Kumar transformed his career by investing in a T VANAMM franchise and built a successful tea business in just 18 months. This inspiring journey shows how dedication and the right business opportunity can change your life.',
 'Learn how Rajesh Kumar transformed his career by investing in a T VANAMM franchise and built a successful tea business in just 18 months.',
 'franchise',
 'Rajesh Kumar',
 true,
 true,
 now() - interval '10 days',
 'success-story-employee-to-franchise-owner'),

('Traditional Chai Recipe: Brewing the Perfect Cup',
 'Master the art of making authentic Indian chai with this traditional recipe passed down through generations. Learn the perfect balance of spices, tea, and milk to create the ultimate chai experience.',
 'Master the art of making authentic Indian chai with this traditional recipe passed down through generations.',
 'recipes',
 'Chef Anita Desai',
 false,
 true,
 now() - interval '12 days',
 'traditional-chai-recipe-brewing-perfect-cup'),

('The Rise of Premium Tea Culture in India',
 'Exploring how premium tea consumption is growing in urban India and what it means for tea businesses. The market trends show a significant shift towards quality over quantity in tea consumption.',
 'Exploring how premium tea consumption is growing in urban India and what it means for tea businesses.',
 'industry',
 'Market Research Team',
 false,
 true,
 now() - interval '15 days',
 'rise-premium-tea-culture-india');