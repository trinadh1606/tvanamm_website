import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { SEOEnhancer } from '@/components/SEO/SEOEnhancer';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  Store, 
  Phone, 
  Star, 
  CheckCircle,
  ArrowRight,
  Award,
  Heart,
  Leaf,
  Mountain,
  Sparkles,
  Timer,
  Crown,
  Coffee,
  GraduationCap,
  Shield,
  MapPin,
  Clock
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCanPlaceOrder } from '@/hooks/useOrderRestrictions';
import { toast } from 'sonner';
import teaGardenHero from '@/assets/tea-garden-hero.webp';
import teaTastingProfessional from '@/assets/tea-tasting-professional.webp';

const teaHeritage = [
  { icon: Crown, title: 'Premium Selection', desc: 'Hand-picked finest tea leaves', color: 'text-yellow-600' },
  { icon: Heart, title: 'Traditional Methods', desc: 'Time-honored brewing techniques', color: 'text-red-600' },
  { icon: Sparkles, title: 'Quality Assured', desc: 'International quality standards', color: 'text-purple-600' },
  { icon: Leaf, title: '100% Organic', desc: 'Pure, natural, chemical-free', color: 'text-emerald-600' },
  { icon: Timer, title: 'Fresh Daily', desc: 'Prepared fresh every day', color: 'text-teal-600' }
];

const deliveryPartners = [
  { name: 'Swiggy', logo: 'https://logos-world.net/wp-content/uploads/2020/11/Swiggy-Logo.png' },
  { name: 'Zomato', logo: 'https://logos-world.net/wp-content/uploads/2020/11/Zomato-Logo.png' },
  { name: 'Food Panda', logo: 'https://logos-world.net/wp-content/uploads/2020/11/Foodpanda-Logo.png' },
  { name: 'MagicPin', logo: 'https://www.magicpin.in/assets/images/magicpin-logo.png' }
];

const testimonials = [
  {
    name: "NAGA JYOTHI & SIVA KUMAR",
    location: "Tea Experts, T VANAMM",
    text: "Our commitment to quality and tradition ensures every cup delivers the authentic taste and aroma that defines premium Indian tea.",
    rating: 5
  },
  {
    name: "NAGA JYOTHI AND R&D TEAM",
    location: "Master Blenders, T VANAMM", 
    text: "Five generations of expertise guide our hands as we craft each blend, maintaining the perfect balance of tradition and innovation.",
    rating: 5
  },
  {
    name: "NAGA JYOTHI & QUALITY TEAM",
    location: "Quality Assurance, T VANAMM",
    text: "Every batch undergoes rigorous testing to meet our uncompromising standards, ensuring consistency in every cup we serve.",
    rating: 5
  }
];

export const GeneralUserOrderPage = () => {
  const topPicksAutoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const partnersAutoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const { data: products, isLoading } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: canPlaceOrder } = useCanPlaceOrder();

  const handleOrderClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (canPlaceOrder === false) {
      toast.error('Your account access has been disabled. Contact admin for assistance.');
      return;
    }

    navigate('/franchise');
  };

  const categories = ['all', 'black-tea', 'green-tea', 'herbal-tea', 'specialty-tea'];
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6 w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => 
                <div key={i} className="h-80 bg-muted rounded-lg"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Convert products for SEO
  const seoProducts = filteredProducts?.slice(0, 8).map(product => ({
    name: product.name,
    description: product.description || `Premium ${product.name} from T VANAMM`,
    price: product.price,
    category: 'Tea'
  })) || [];

  return (
    <>
      <SEOEnhancer
        title="Order Premium Indian Tea Online - T VANAMM Tea Collection"
        description="Order authentic Indian tea online through our franchise partners. Premium quality tea blends, fresh preparation, and pan-India delivery. Experience traditional brewing excellence."
        keywords="order tea online, Indian tea delivery, premium tea, franchise tea, authentic tea blends, organic tea, tea delivery India"
        products={seoProducts}
        type="product"
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🍃 Hero Section - Tea Heritage */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-100 border border-emerald-200 rounded-full mb-8">
            <Leaf className="w-5 h-5 text-emerald-600 mr-2" />
            <span className="text-emerald-700 font-semibold">Authentic Indian Tea Heritage</span>
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-8 leading-tight whitespace-nowrap">
            Experience the Greatness of <span className="whitespace-nowrap">T VANAMM</span>
          </h1>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed">
            Discover the art of perfect tea brewing with our premium collection. From the pristine gardens of Darjeeling to traditional Assam estates, every cup tells a story of heritage, quality, and excellence.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <Badge variant="secondary" className="px-6 py-3 text-lg">🌿 100% Organic </Badge>
          </div>
        </div>

        {/* 🌱 Tea Heritage & Quality Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-6">The Art of Perfect Tea</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              For five generations, <span className="whitespace-nowrap">T VANAMM</span> has been crafting exceptional tea experiences. Our master blenders combine traditional wisdom with modern techniques to create teas that capture the essence of India's finest tea gardens.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <Mountain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Premium Garden Selection</h3>
                  <p className="text-muted-foreground">Sourced from the finest tea estates in Darjeeling, Assam, and Nilgiris</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Master Tea Blenders</h3>
                  <p className="text-muted-foreground">Generations of expertise in traditional tea blending techniques</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Quality Assurance</h3>
                  <p className="text-muted-foreground">Rigorous quality testing and organic certification standards</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
              <OptimizedImage
                src={teaTastingProfessional}
                alt="Professional tea taster evaluating T VANAMM premium tea quality"
                className="w-full h-full object-cover"
                loading="eager"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-xl font-bold mb-2">Professional Tea Tasting</p>
                <p className="text-white/90">Every batch tested for perfection</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🏆 Our Top Picks */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-6">Our Top Picks</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover our carefully curated selection of premium teas, refreshing beverages, and delightful treats
            </p>
          </div>
          
          {!isLoading && products && products.length > 0 && (
            <Carousel 
              className="w-full"
              plugins={[topPicksAutoplay.current]}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {products
                  .filter(product => product.stock_quantity > 0)
                  .sort((a, b) => b.price - a.price)
                  .slice(0, 12)
                  .map(product => (
                    <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden rounded-t-lg">
                            {product.images && product.images[0] ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name} 
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-48 bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-3">
                            <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                              {product.name}
                            </h4>
                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-primary">₹{product.price}</span>
                              <Badge variant="secondary">Premium</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 bg-white shadow-lg border-0" />
              <CarouselNext className="hidden md:flex -right-12 bg-white shadow-lg border-0" />
            </Carousel>
          )}
        </div>

        {/* ⭐ Heritage & Excellence */}
        <Card className="mb-16 overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-foreground mb-6">Why <span className="whitespace-nowrap">T VANAMM</span> Stands Apart</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover what makes our tea exceptional - from garden selection to your perfect cup
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {teaHeritage.map((feature, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                    <feature.icon className={`w-10 h-10 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 🌿 Tea Experience & Education */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-3">
            <h2 className="text-4xl font-bold text-foreground mb-8">
              How to Experience <span className="whitespace-nowrap">T VANAMM</span> Tea
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              <span className="whitespace-nowrap">T VANAMM</span> operates through authorized franchise partners to ensure freshness and quality. Each cup is prepared with care, maintaining our traditional standards while bringing convenience to your doorstep.
            </p>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Find Your Nearest Partner</h3>
                  <p className="text-muted-foreground">Connect with our authorized franchise partners in your area</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Choose Your Fav Tea</h3>
                  <p className="text-muted-foreground">Select from our premium collection of 30+ tea varieties</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Enjoy Fresh Tea</h3>
                  <p className="text-muted-foreground">Experience freshly prepared tea delivered to your location</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
              <OptimizedImage
                src={teaGardenHero}
                alt="T VANAMM tea garden showcasing premium tea cultivation and heritage"
                className="w-full h-full object-cover"
                loading="eager"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-xl font-bold mb-2">Garden to Cup Excellence</p>
                <p className="text-white/90">From Fresh Tea garden to your perfect cup</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🚚 Our Delivery Partners */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-6">Our Delivery Partners</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Order <span className="whitespace-nowrap">T VANAMM</span> tea through our trusted delivery platform partners across India
            </p>
          </div>
          
          <Carousel 
            className="w-full"
            plugins={[partnersAutoplay.current]}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {deliveryPartners.map((partner, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <img 
                            src={partner.logo} 
                            alt={`${partner.name} logo`} 
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                            }}
                          />
                        </div>
                        <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {partner.name}
                        </h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Available Now
                        </Badge>
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

        {/* 📞 Contact & Support Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Contact & Support
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Office Address</p>
                      <p className="text-sm text-muted-foreground">Kukatpally, Hyderabad</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Phone Numbers</p>
                      <p className="text-sm text-muted-foreground">+91 9000008479, +91 9390658544</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Operating Hours</p>
                      <p className="text-sm text-muted-foreground">7:00 AM - 11:00 PM Daily</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Bulk Orders
                </h3>
                <p className="text-muted-foreground mb-4">
                  Special pricing available for corporate catering and bulk orders. 
                  Contact us for customized solutions.
                </p>
                <Button onClick={() => navigate('/contact')}>
                  Get Bulk Quote
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
};