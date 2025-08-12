import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, ArrowRight, Clock } from "lucide-react";
import { useBlogPosts, BlogPost } from "@/hooks/useBlogPosts";
import BlogPostModal from "@/components/blog/BlogPostModal";
import { supabase } from "@/integrations/supabase/client";

const SITE = "https://tvanamm.com";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function slugify(s: string, fallback = "") {
  const base = (s || fallback || "post")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || "post";
}

const readingTime = (text: string) => {
  const words = (text || "").trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
};

const Blog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only fetch published posts
  const { data: blogPosts, isLoading, refetch } = useBlogPosts(true);

  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();

  // Map of slug -> post for SEO/opening via URL (?p=slug)
  const slugMap = useMemo(() => {
    const map = new Map<string, BlogPost>();
    (blogPosts || []).forEach((p) => {
      const slug = slugify(p.slug || p.title, `post-${p.id}`);
      map.set(slug, p);
    });
    return map;
  }, [blogPosts]);

  // Open modal when `?p=slug` is present
  useEffect(() => {
    const p = query.get("p");
    if (p && slugMap.size) {
      const found = slugMap.get(p);
      if (found) {
        setSelectedPost(found);
        setIsModalOpen(true);
      }
    }
  }, [query, slugMap]);

  // Close modal & clean URL
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    const url = new URL(location.pathname, SITE);
    navigate(url.pathname, { replace: true });
  };

  const handleReadMore = (post: BlogPost) => {
    const slug = slugify(post.slug || post.title, `post-${post.id}`);
    // Update the URL so crawlers (and users) have a unique link
    navigate(`/blog?p=${slug}`, { replace: false });
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  // Supabase realtime: invalidate instead of reloading
  useEffect(() => {
    const channel = supabase
      .channel("blog-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts", filter: "published=eq.true" },
        () => {
          // Soft refresh—keeps state, better UX & CWV
          refetch?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const categories = useMemo(() => {
    const list = [
      { id: "all", name: "All Articles" },
      { id: "health", name: "Health Benefits" },
      { id: "recipes", name: "Tea Recipes" },
      { id: "franchise", name: "Franchise Stories" },
      { id: "industry", name: "Industry News" },
    ];
    const counts: Record<string, number> = {};
    (blogPosts || []).forEach((p) => {
      const key = p.category || "general";
      counts[key] = (counts[key] || 0) + 1;
    });
    return list.map((c) => ({
      ...c,
      count: c.id === "all" ? blogPosts?.length || 0 : counts[c.id] || 0,
    }));
  }, [blogPosts]);

  const featuredArticles = (blogPosts || []).filter((post) => post.featured);
  const regularArticles = (blogPosts || []).filter((post) => !post.featured);

  const filteredArticles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return regularArticles.filter((article) => {
      const text = `${article.title} ${(article.excerpt || article.content || "")}`.toLowerCase();
      const matchesSearch = term.length ? text.includes(term) : true;
      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [regularArticles, searchTerm, selectedCategory]);

  const getCategoryColor = (category: string) => {
    const colors = {
      health: "bg-green-100 text-green-800",
      recipes: "bg-orange-100 text-orange-800",
      franchise: "bg-blue-100 text-blue-800",
      industry: "bg-purple-100 text-purple-800",
      general: "bg-gray-100 text-gray-800",
    } as const;
    // @ts-ignore
    return colors[category] || colors.general;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  // --------- JSON-LD (Blog & ItemList) ----------
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    url: `${SITE}/blog`,
    name: "T VANAMM Blog",
    description:
      "Tea insights, chai recipes, franchise success stories, and industry news from T VANAMM.",
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: "T VANAMM",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    },
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: (blogPosts || []).slice(0, 12).map((p, i) => {
      const slug = slugify(p.slug || p.title, `post-${p.id}`);
      return {
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/blog?p=${slug}`,
        item: {
          "@type": "BlogPosting",
          headline: p.title,
          description: p.excerpt || p.content?.slice(0, 160),
          datePublished: p.created_at,
          author: p.author
            ? { "@type": "Person", name: p.author }
            : { "@type": "Organization", name: "T VANAMM" },
          image: p.image_url ? [{ "@type": "ImageObject", url: p.image_url }] : undefined,
          mainEntityOfPage: `${SITE}/blog?p=${slug}`,
        },
      };
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Route-level SEO */}
      <Helmet>
        <title>Tea Insights & Franchise Knowledge | T VANAMM Blog</title>
        <meta
          name="description"
          content="Discover tea insights, health benefits, recipes, and T VANAMM franchise success stories. Learn how to start a profitable chai franchise with expert tips."
        />
        <link rel="canonical" href={`${SITE}/blog`} />
        {/* Hints & internal prefetch for UX */}
        <link rel="prefetch" href="/franchise" as="document" />
        <link rel="prefetch" href="/contact" as="document" />
        {/* Schemas */}
        <script type="application/ld+json">{JSON.stringify(blogLd)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Tea Insights & Stories
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover the world of tea through expert insights, health benefits, recipes,
            and inspiring franchise success stories.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
              aria-label="Search blog articles"
            />
          </div>

          {/* Subtle internal links (SEO assist) */}
          <div className="mt-6 text-sm text-muted-foreground">
            Looking to start a chai franchise?{" "}
            <Link className="underline hover:text-primary" to="/franchise">
              Explore T VANAMM Tea Franchise
            </Link>{" "}
            or{" "}
            <Link className="underline hover:text-primary" to="/contact">
              talk to our team
            </Link>
            .
          </div>
        </div>
      </section>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-foreground mb-8">Featured Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {featuredArticles.map((article) => {
                    const slug = slugify(article.slug || article.title, `post-${article.id}`);
                    const date = new Date(article.created_at).toLocaleDateString();
                    const read = readingTime(article.excerpt || article.content || "");
                    return (
                      <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-smooth">
                        <div className="aspect-video relative">
                          <img
                            src={article.image_url || "/src/assets/hero-tea-cup.webp"}
                            alt={article.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                          <Badge className={`absolute top-4 left-4 ${getCategoryColor(article.category)}`}>
                            {categories.find((c) => c.id === article.category)?.name || "General"}
                          </Badge>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {article.excerpt || (article.content || "").substring(0, 150) + "..."}
                          </p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {article.author || "T VANAMM"}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {date}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {read}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              className="group"
                              onClick={() => handleReadMore(article)}
                            >
                              Read More
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            {/* Crawlable link to the same modal content */}
                            <Link
                              to={`/blog?p=${slug}`}
                              className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-accent"
                              aria-label={`Open article ${article.title}`}
                            >
                              Open Link
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* All Articles */}
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-8">Latest Articles</h2>
              {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArticles.map((article) => {
                    const slug = slugify(article.slug || article.title, `post-${article.id}`);
                    const date = new Date(article.created_at).toLocaleDateString();
                    const read = readingTime(article.excerpt || article.content || "");
                    return (
                      <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-smooth">
                        <div className="aspect-video relative">
                          <img
                            src={article.image_url || "/src/assets/hero-tea-cup.webp"}
                            alt={article.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                          <Badge className={`absolute top-4 left-4 ${getCategoryColor(article.category)}`}>
                            {categories.find((c) => c.id === article.category)?.name || "General"}
                          </Badge>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {article.excerpt || (article.content || "").substring(0, 100) + "..."}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {date}
                            </div>
                            <span className="mx-2">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {read}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="group"
                              onClick={() => handleReadMore(article)}
                            >
                              Read More
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Link
                              to={`/blog?p=${slug}`}
                              className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-accent"
                              aria-label={`Open article ${article.title}`}
                            >
                              Open Link
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No articles found matching your search.
                  </p>
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
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground"
                    }`}
                    aria-pressed={selectedCategory === category.id}
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
                <Input type="email" placeholder="Your email address" aria-label="Your email address" />
                <Button variant="brand" className="w-full">
                  Subscribe to Newsletter
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <BlogPostModal post={selectedPost} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Blog;
