import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Define a static list of featured items
const featuredItems = [
  {
    id: '1',
    name: 'Premium Green Tea',
    description: 'Fresh leaves handpicked.',
    image: '/assets/green_tea.webp',
  },
  {
    id: '2',
    name: 'Premium Black Tea',
    description: 'Fresh leaves handpicked from the Himalayas.',
    image: '/assets/black_tea.webp',
  },
  {
    id: '3',
    name: 'Hibiscus Tea',
    description: 'A soothing blend of chamomile and mint.',
    image: '/assets/hibiscus_tea.webp',
  },
  {
    id: '4',
    name: 'Oolong Tea',
    description: 'Classic black tea with bergamot aroma.',
    image: '/assets/oolong_tea.webp',
  },
  {
    id: '5',
    name: 'Fruit Punch Soda',
    description: 'Refreshing mix of berries and citrus.',
    image: '/assets/green_tea.webp',
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
            {featuredItems.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                {/* Equal-height cards: make the card & content take full height and use flex layout */}
                <Card className="group h-full flex flex-col hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-0 h-full flex flex-col">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        /* If `h-68` isn't in your Tailwind config, `h-[17rem]` keeps the same visual size */
                        className="w-full h-[17rem] h-68 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Flex-grow ensures content area expands uniformly across cards */}
                    <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
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
