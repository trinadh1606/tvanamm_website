import React, { useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
const TopPicksSection = () => {
  const {
    data: products,
    isLoading: productsLoading
  } = useProducts();
  const plugin = useRef(Autoplay({
    delay: 3000,
    stopOnInteraction: true
  }));
  if (productsLoading) {
    return <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Top Picks</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully curated selection of premium teas, refreshing beverages, and delightful treats
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({
            length: 8
          }).map((_, i) => <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>)}
          </div>
        </div>
      </section>;
  }

  // Get a curated mix of products (top picks from all categories)
  const getFeaturedProducts = () => {
    if (!products) return [];

    // Sort by price (premium items first) and take the best selection
    return products.filter(product => product.stock_quantity > 0) // Only in-stock items
    .sort((a, b) => b.price - a.price) // Premium items first
    .slice(0, 12); // Limit to 12 featured items
  };
  const featuredProducts = getFeaturedProducts();
  if (featuredProducts.length === 0) {
    return null;
  }
  return <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Our Top Picks</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of premium teas, refreshing beverages, and delightful treats
          </p>
        </div>

        <Carousel 
          className="w-full"
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredProducts.map(product => <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      {product.images && product.images[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No Image</span>
                        </div>}
                      <div className="absolute top-2 right-2">
                        
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      
                      {product.description && <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>}

                      
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>)}
          </CarouselContent>
          
          <CarouselPrevious className="hidden md:flex -left-12 bg-white shadow-lg border-0" />
          <CarouselNext className="hidden md:flex -right-12 bg-white shadow-lg border-0" />
        </Carousel>

        <div className="text-center mt-12">
          
        </div>
      </div>
    </section>;
};
export default TopPicksSection;