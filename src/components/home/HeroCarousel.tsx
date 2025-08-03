import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import heroGarden from '@/assets/hero-tea-garden-1.jpg';
import heroPicking from '@/assets/hero-tea-picking.jpg';
import heroCup from '@/assets/hero-tea-cup.jpg';

const slides = [
  {
    id: 1,
    image: heroGarden,
    title: "Savour the rich blend of Tvanamm in every sip",
    subtitle: "Premium Tea from the Heart of India",
    description: "Discover the finest quality tea sourced directly from the lush tea gardens.",
    primaryCTA: "Explore Our Legacy",
    secondaryCTA: "Become a Partner",
    primaryAction: "/about",
    secondaryAction: "/franchise"
  },
  {
    id: 2,
    image: heroPicking,
    title: "Handpicked with Tradition",
    subtitle: "Crafted for the cultured",
    description: "Every leaf is carefully selected to bring you the perfect balance of flavor and aroma.",
    primaryCTA: "View Products",
    secondaryCTA: "Join Our Network",
    primaryAction: "/order",
    secondaryAction: "/franchise"
  },
  {
    id: 3,
    image: heroCup,
    title: "Uncompromising Quality unforgetable taste",
    subtitle: "Premium Quality, Authentic Flavor",
    description: "Experience the rich heritage and exceptional quality that makes T VANAMM special.",
    primaryCTA: "Order Now",
    secondaryCTA: "Franchise Opportunities",
    primaryAction: "/order",
    secondaryAction: "/franchise"
  }
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="animate-fade-in">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30 mb-6">
                🍃 Premium Indian Tea
              </span>
            </div>

            {/* Main Content */}
            <div className="space-y-6 animate-slide-up">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                {currentSlideData.title}
              </h1>
              
              <h2 className="text-xl md:text-2xl text-emerald-200 font-semibold">
                {currentSlideData.subtitle}
              </h2>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
                {currentSlideData.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  variant="hero"
                  onClick={() => navigate(currentSlideData.primaryAction)}
                  className="animate-bounce-in"
                >
                  {currentSlideData.primaryCTA}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(currentSlideData.secondaryAction)}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm animate-bounce-in"
                  style={{ animationDelay: '0.1s' }}
                >
                  {currentSlideData.secondaryCTA}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-smooth backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-smooth backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-smooth ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20 animate-bounce">
        <div className="flex flex-col items-center text-white/70">
          <span className="text-sm mb-2">Scroll</span>
          <div className="w-px h-12 bg-white/30"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;