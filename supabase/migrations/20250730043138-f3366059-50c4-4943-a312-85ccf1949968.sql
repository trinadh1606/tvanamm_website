-- Simple content updates for blog posts
UPDATE blog_posts SET
  content = 'Tea has been cherished for centuries not just for its delightful taste, but for its incredible health benefits. At T VANAMM, we believe in bringing you the finest quality tea that nourishes both body and soul.'
WHERE title LIKE '%Health Benefits%';

UPDATE blog_posts SET
  excerpt = 'Discover the incredible health benefits of premium tea and how T VANAMM carefully sourced selections can enhance your wellness journey.'
WHERE title LIKE '%Health Benefits%';

-- Enable realtime for blog_posts
ALTER TABLE blog_posts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;

-- Enable realtime for notifications  
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;