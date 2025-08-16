import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Define a static list of featured items
const featuredItems = [
  {
    id: '1',
    name: 'Premium Green Tea',
    description: 'Fresh leaves handpicked.',
    image: '/images/green-tea.webp',
  },
    {
    id: '2',
    name: 'Premium Green Tea',
    description: 'Fresh leaves handpicked from the Himalayas.',
    image: '/images/green-tea.webp',
  },
  {
    id: '3',
    name: 'Herbal Infusion',
    description: 'A soothing blend of chamomile and mint.',
    image: '/images/herbal-infusion.webp',
  },
  {
    id: '4',
    name: 'Earl Grey Delight',
    description: 'Classic black tea with bergamot aroma.',
    image: '/images/earl-grey.webp',
  },
  {
    id: '5',
    name: 'Fruit Punch Soda',
    description: 'Refreshing mix of berries and citrus.',
    image: '/images/fruit-punch.webp',
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
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredItems.map(item => (
              <CarouselItem
                key={item.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-4 space-y-3">
                      <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex -left-12 bg-white shadow-lg border-0" />
          <CarouselNext className="hidden md:flex -right-12 bg-white shadow-lg border-0" />
        </Carousel>
      </div>
    </section>
  );
};

export default TopPicksSection;
