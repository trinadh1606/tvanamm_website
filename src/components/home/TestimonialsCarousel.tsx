import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star } from 'lucide-react';
import { useFeaturedTestimonials } from '@/hooks/useTestimonials';
import Autoplay from 'embla-carousel-autoplay';
const TestimonialsCarousel = () => {
  const {
    data: testimonials,
    isLoading
  } = useFeaturedTestimonials();
  const autoplay = React.useRef(Autoplay({
    delay: 4000,
    stopOnInteraction: true
  }));
  if (isLoading) {
    return <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </section>;
  }
  const renderStars = (rating: number) => {
    return Array.from({
      length: 5
    }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} />);
  };
  return <section className="py-20 bg-card mx-px">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from our satisfied customers and franchise partners about their T VANAMM experience
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Carousel className="w-full" plugins={[autoplay.current]} onMouseEnter={autoplay.current.stop} onMouseLeave={autoplay.current.reset}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials?.map(testimonial => <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="border-border hover:shadow-lg transition-all h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        {renderStars(testimonial.rating)}
                      </div>
                      <p className="text-muted-foreground mb-6 italic flex-grow">
                        "{testimonial.testimonial_text}"
                      </p>
                      <div className="border-t border-border pt-4 mt-auto">
                        <p className="font-semibold text-foreground">
                          {testimonial.customer_name}
                        </p>
                        {testimonial.customer_location && <p className="text-sm text-muted-foreground">
                            {testimonial.customer_location}
                          </p>}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 bg-card border-border hover:bg-accent" />
            <CarouselNext className="hidden md:flex -right-12 bg-card border-border hover:bg-accent" />
          </Carousel>
          
          {/* Mobile dots indicator */}
          <div className="flex justify-center mt-8 md:hidden">
            <div className="flex space-x-2">
              {testimonials?.map((_, index) => <div key={index} className="w-2 h-2 rounded-full bg-muted-foreground/20" />)}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default TestimonialsCarousel;