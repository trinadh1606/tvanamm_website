-- Enable realtime for blog_posts only
ALTER TABLE blog_posts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;