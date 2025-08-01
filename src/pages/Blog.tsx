import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import BlogPostModal from '@/components/blog/BlogPostModal';
import { supabase } from '@/integrations/supabase/client';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: blogPosts, isLoading } = useBlogPosts(true); // Only get published posts

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('blog-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts',
          filter: 'published=eq.true'
        },
        () => {
          // Invalidate and refetch
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleReadMore = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const categories = [
    { id: 'all', name: 'All Articles', count: blogPosts?.length || 0 },
    { id: 'health', name: 'Health Benefits', count: blogPosts?.filter(p => p.category === 'health').length || 0 },
    { id: 'recipes', name: 'Tea Recipes', count: blogPosts?.filter(p => p.category === 'recipes').length || 0 },
    { id: 'franchise', name: 'Franchise Stories', count: blogPosts?.filter(p => p.category === 'franchise').length || 0 },
    { id: 'industry', name: 'Industry News', count: blogPosts?.filter(p => p.category === 'industry').length || 0 }
  ];

  const featuredArticles = blogPosts?.filter(post => post.featured) || [];
  const regularArticles = blogPosts?.filter(post => !post.featured) || [];

  const filteredArticles = regularArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.excerpt || article.content).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      health: 'bg-green-100 text-green-800',
      recipes: 'bg-orange-100 text-orange-800',
      franchise: 'bg-blue-100 text-blue-800',
      industry: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Tea Insights & Stories
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover the world of tea through expert insights, health benefits, recipes, and inspiring franchise success stories.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Articles */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8">Featured Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-smooth">
                    <div className="aspect-video relative">
                      <img 
                        src={article.image_url || '/src/assets/hero-tea-cup.jpg'} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className={`absolute top-4 left-4 ${getCategoryColor(article.category)}`}>
                        {categories.find(c => c.id === article.category)?.name}
                      </Badge>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {article.excerpt || article.content.substring(0, 150) + '...'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {article.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(article.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          5 min read
                        </div>
                      </div>
                      <Button variant="outline" className="w-full group" onClick={() => handleReadMore(article)}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* All Articles */}
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-8">Latest Articles</h2>
              {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-smooth">
                      <div className="aspect-video relative">
                       <img 
                          src={article.image_url || '/src/assets/hero-tea-cup.jpg'} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className={`absolute top-4 left-4 ${getCategoryColor(article.category)}`}>
                          {categories.find(c => c.id === article.category)?.name}
                        </Badge>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {article.excerpt || article.content.substring(0, 100) + '...'}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(article.created_at).toLocaleDateString()}
                          </div>
                          <span className="mx-2">•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            5 min read
                          </div>
                        </div>
                         <Button variant="outline" size="sm" className="group" onClick={() => handleReadMore(article)}>
                           Read More
                           <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                         </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No articles found matching your search.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Categories */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-bold text-foreground mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-smooth ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-foreground'
                    }`}
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>

            {/* Newsletter Signup */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Stay Updated</h3>
              <p className="text-muted-foreground mb-4">
                Get the latest tea insights and franchise updates delivered to your inbox.
              </p>
              <div className="space-y-3">
                <Input type="email" placeholder="Your email address" />
                <Button variant="brand" className="w-full">
                  Subscribe to Newsletter
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <BlogPostModal 
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Blog;