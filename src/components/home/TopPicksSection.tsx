import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Define a static list of featured items
const featuredItems = [
  {
    id: '1',
    name: 'Premium Mint Tea',
    description: 'Fresh leaves handpicked.',
    image: 'src/assets/minttea.webp',
  },
  {
    id: '2',
    name: 'Premium Black Tea',
    description: 'Classic black tea with bergamot aroma.',
    image: 'src/assets/blacktea.webp',
  },
  {
    id: '3',
    name: 'Hibiscus Tea',
    description: 'A soothing blend of hibiscus.',
    image: 'src/assets/3.png',
  },
  {
    id: '4',
    name: 'Oolong Tea',
    description: 'Classic oolong tea with bergamot aroma.',
    image: 'src/assets/2.webp',
  },
  {
    id: '5',
    name: 'Fresh Lime Soda',
    description: 'Refreshing mix of citrus and soda.',
    image: 'src/assets/lime.webp',
  },
  // Add more items as needed
];

const TopPicksSection = () => {
  // Embla autoplay plugin
  const autoplay = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
    })
  );

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Our Top Picks</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of premium teas, refreshing beverages, and delightful treats
          </p>
        </div>

        <Carousel
          className="w-full"
          plugins={[autoplay.current]}
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
          opts={{
            loop: true,
            align: "center",
            duration: 30, // Smoother sliding duration
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredItems.map(item => (
              <CarouselItem
                key={item.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <Card className="group hover:shadow-lg transition-all duration-500 border-0 bg-card/50 backdrop-blur-sm overflow-hidden transform hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg h-48">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                        style={{ transformOrigin: 'center center' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    <div className="p-4 space-y-3">
                      <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-500">
                        {item.name}
                      </h4>

                      <p className="text-sm text-muted-foreground line-clamp-2 transition-all duration-500 group-hover:text-foreground">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex -left-12 bg-white/80 hover:bg-white shadow-lg border-0 backdrop-blur-sm transition-all duration-300 hover:scale-110" />
          <CarouselNext className="hidden md:flex -right-12 bg-white/80 hover:bg-white shadow-lg border-0 backdrop-blur-sm transition-all duration-300 hover:scale-110" />
        </Carousel>
        
        {/* Custom CSS for additional smoothness */}
        <style>
          {`
            .embla__slide {
              transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .embla__slide:not(.is-snapped) {
              opacity: 0.7;
              transform: scale(0.95);
            }
            
            .embla__slide.is-snapped {
              opacity: 1;
              transform: scale(1);
            }
          `}
        </style>
      </div>
    </section>
  );
};

export default TopPicksSection;