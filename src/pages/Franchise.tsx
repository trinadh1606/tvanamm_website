import React, { useState } from 'react';
import { SEOHead } from '@/components/SEO/SEOHead';
import { Store, TrendingUp, Users, Award, Shield, Headphones, Phone, Mail, MapPin, Download, CheckCircle, BookOpen, GraduationCap, Megaphone, Settings, Truck, BarChart3, Star, Target, Globe, Briefcase, Calculator, Calendar, CheckCircle2, Trophy, DollarSign, Clock, TrendingDown, Building2, Handshake, LineChart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FranchiseEnquiryModal from '@/components/franchise/FranchiseEnquiryModal';
import { useAuth } from '@/contexts/AuthContext';
import StickyPaymentReminder from '@/components/common/StickyPaymentReminder';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import StatisticsSection from '@/components/home/StatisticsSection';
import InteractiveMap from '@/components/ui/interactive-map';
import FranchiseInfoSection from '@/components/home/FranchiseInfoSection';
import heroTeaGarden from '@/assets/hero-tea-garden-1.jpg';
import heroTeaPicking from '@/assets/hero-tea-picking.jpg';
import heroTeaCup from '@/assets/hero-tea-cup.jpg';
const Franchise = () => {
  const [formData, setFormData] = useState({
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const benefits = [{
    icon: Store,
    title: "High ROI investment",
    description: "Start your premium tea business with minimal capital investment and maximum growth potential",
    color: "emerald"
  }, {
    icon: TrendingUp,
    title: "Proven Business Model",
    description: "Join 150+ successful partners with our time-tested franchise system and comprehensive support",
    color: "blue"
  }, {
    icon: Users,
    title: "Trend Setting Menu",
    description: "Tap into India's ₹50,000+ crore tea market with increasing demand for premium quality products",
    color: "purple"
  }, {
    icon: Award,
    title: "Premium Brand",
    description: "Partner with T VANAMM - a trusted name with 5+ years of excellence and thousands of satisfied customers",
    color: "orange"
  }, {
    icon: Shield,
    title: "Brand Regcognition",
    description: "A Sustained brand with exclusive social media presence and esthablished market presence",
    color: "red"
  }, {
    icon: Headphones,
    title: "Suppourt to Franchise partners",
    description: "Receive continuous training, marketing assistance, and dedicated business development support",
    color: "teal"
  }];
  const supportServices = [
   {
    icon: GraduationCap,
    title: "Staff Training",
    description: "Professional team training modules to ensure your staff delivers exceptional customer experiences"
  }, {
    icon: Megaphone,
    title: "Marketing Support",
    description: "National and local marketing campaigns, promotional materials, and digital marketing assistance"
  }, {
    icon: Settings,
    title: "Operational Support",
    description: "Daily operations guidance, inventory management, and quality control processes"
  }, {
    icon: Truck,
    title: "Supply Chain",
    description: "Direct access to premium tea products with reliable supply chain and competitive wholesale pricing"
  }, {
    icon: BarChart3,
    title: "Business Analytics",
    description: "Performance tracking tools, sales analytics, and business intelligence to optimize your operations"
  }];

  const investmentTiers = [{
    title: "City Franchise",
    investment: "₹5-8 Lakhs",
    features: ["Exclusive city rights", "Complete setup support", "Marketing materials", "Training program", "Monthly ROI: 15-25%"]
  }, {
    title: "State Franchise",
    investment: "₹15-25 Lakhs",
    features: ["Entire state rights", "Master franchise benefits", "Sub-franchise opportunities", "Premium support", "Monthly ROI: 20-30%"]
  }, {
    title: "Regional Franchise",
    investment: "₹50+ Lakhs",
    features: ["Multi-state territory", "Regional master rights", "Maximum profit potential", "VIP support", "Monthly ROI: 25-35%"]
  }];
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('leads').insert([{
        name: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        message: `Franchise Inquiry - ${formData.city}: ${formData.message}`,
        source: 'franchise'
      }]);
      if (error) throw error;
      toast({
        title: "Application Submitted Successfully!",
        description: "Our franchise team will contact you within 24 hours.",
        variant: "default"
      });

      // Reset form
      setFormData({
        contactPerson: '',
        phone: '',
        email: '',
        city: '',
        message: ''
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-background">
      <SEOHead title="Tea Franchise Opportunities - Join T VANAMM Network" description="Start your own tea business with T VANAMM franchise. Get training, quality products, marketing support, and comprehensive business assistance. Low investment, high returns." keywords="tea franchise, franchise opportunities, business opportunities, tea business, low investment franchise, profitable franchise" canonicalUrl="https://tvanamm.com/franchise" schema={{
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "T VANAMM Tea Franchise",
      "description": "Premium tea franchise opportunity with comprehensive support",
      "brand": "T VANAMM",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock"
      }
    }} />
      {/* Enhanced Hero Section with Background */}
      <section className="relative min-h-screen bg-gradient-to-br from-tea-green to-tea-green/90 py-20 overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0 bg-black/20">
          <div className="absolute inset-0 opacity-20">
            <img src={heroTeaGarden} alt="Tea Garden" className="w-full h-full object-cover" />
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="text-center animate-fade-in w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Join the <span className="text-accent">TVANAMM</span>
                <span className="block text-white/90 text-4xl md:text-5xl mt-2">Franchise Family</span>
              </h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
                  <div className="text-white/80 text-sm">Successful Partners</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-3xl md:text-4xl font-bold text-white">₹2L+</div>
                  <div className="text-white/80 text-sm">Monthly Revenue</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-3xl md:text-4xl font-bold text-white">15+</div>
                  <div className="text-white/80 text-sm">Years Excellence</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-3xl md:text-4xl font-bold text-white">96%</div>
                  <div className="text-white/80 text-sm">Success Rate</div>
                </div>
              </div>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8">
                Build your premium tea empire with India's most trusted franchise network. 
                <span className="block mt-2 text-lg">Low investment • High returns • Comprehensive support</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" onClick={() => setShowEnquiryModal(true)}>
                  <Briefcase className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => setShowBrochureModal(true)}>
                  <Download className="mr-2 h-5 w-5" />
                  Download Brochure
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Statistics Section */}
      <StatisticsSection />

      {/* Visual Gallery Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">From Garden to Your Business</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the premium quality journey that makes T VANAMM the preferred choice for tea lovers across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden group hover-scale border-0 shadow-elegant">
              <div className="aspect-video relative">
                <img src={heroTeaPicking} alt="Tea Picking Process" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Premium Sourcing</h3>
                  <p className="text-white/80">Hand-picked from finest gardens</p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden group hover-scale border-0 shadow-elegant">
              <div className="aspect-video relative">
                <img src={heroTeaGarden} alt="Tea Gardens" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Quality Processing</h3>
                  <p className="text-white/80">Modern facilities & techniques</p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden group hover-scale border-0 shadow-elegant">
              <div className="aspect-video relative">
                <img src={heroTeaCup} alt="Premium Tea" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Perfect Blend</h3>
                  <p className="text-white/80">Exquisite taste & aroma</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Franchise Opportunities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Franchise Opportunities</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join India's most trusted premium tea franchise with proven success and comprehensive support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => <Card key={benefit.title} className="p-6 bg-white hover:shadow-card transition-smooth text-center group border-l-4 border-l-tea-green" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="w-16 h-16 bg-tea-light text-tea-green rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-smooth">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Franchise Support Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Comprehensive Franchise Support</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide end-to-end support to ensure your franchise success from day one to long-term growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportServices.map((service, index) => <Card key={service.title} className="p-6 bg-white hover:shadow-card transition-smooth group" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-smooth">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Franchise Journey Timeline */}
      <section className="py-20 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Your Franchise Journey</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From application to grand opening, we guide you through every step of your franchise journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{
            step: "1",
            title: "Enquiry & Application",
            desc: "Submit application & initial discussion",
            icon: Briefcase,
            timeframe: "Day 1"
          }, {
            step: "2",
            title: "Evaluation",
            desc: "Territory analysis & approval process",
            icon: Target,
            timeframe: "Week 1-2"
          },
          {
            step: "3",
            title: "Agreement",
            desc: "Sign franchise agreement and finalize terms",
            icon: GraduationCap,
            timeframe: "Week 3-4"
          },
          {
            step: "4",
            title: "Training",
            desc: "Comprehensive product training",
            icon: GraduationCap,
            timeframe: "Week 3-4"
          }, {
            step: "5",
            title: "Launch",
            desc: "Grand opening with marketing support",
            icon: Trophy,
            timeframe: "Week 5-6"
          }].map((phase, index) => <Card key={phase.step} className="p-6 bg-white hover:shadow-card transition-smooth group text-center relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {phase.step}
                </div>
                <div className="mt-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-smooth">
                    <phase.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{phase.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{phase.desc}</p>
                  <div className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    {phase.timeframe}
                  </div>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Business Metrics & ROI Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Business Performance Metrics</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real numbers from our successful franchise partners across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[{
            metric: "₹2.4L",
            label: "Average Monthly Revenue",
            icon: DollarSign,
            trend: "+23%"
          }, {
            metric: "18%",
            label: "Average Monthly ROI",
            icon: TrendingUp,
            trend: "+5%"
          }, {
            metric: "8 months",
            label: "Average Payback Period",
            icon: Calendar,
            trend: "-2 months"
          }, {
            metric: "94%",
            label: "Partner Satisfaction Rate",
            icon: Trophy,
            trend: "+6%"
          }].map((stat, index) => <Card key={stat.label} className="p-6 bg-gradient-to-br from-background to-muted/20 hover:shadow-card transition-smooth text-center group">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-smooth">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.metric}</div>
                <div className="text-muted-foreground text-sm mb-2">{stat.label}</div>
                <div className="inline-flex items-center text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.trend}
                </div>
              </Card>)}
          </div>

          {/* ROI Calculator Integration */}
          
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <TestimonialsSection />

      {/* Investment Options */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Investment Options</h2>
            <p className="text-xl text-muted-foreground">
              Choose the franchise model that best fits your investment capacity and business goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {investmentTiers.map((tier, index) => <Card key={tier.title} className="p-8 bg-white border-2 border-transparent hover:border-primary/20 hover:shadow-card transition-smooth" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{tier.title}</h3>
                  <div className="text-3xl font-bold text-primary">{tier.investment}</div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => <li key={idx} className="flex items-center text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                      {feature}
                    </li>)}
                </ul>

                <Button variant="brand" className="w-full" onClick={() => setShowEnquiryModal(true)}>
                  Enquire Now
                </Button>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Franchise Application</h2>
            <p className="text-xl text-muted-foreground">
              Fill out the form below and our franchise team will contact you within 24 hours.
            </p>
          </div>

          <Card className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Full Name</Label>
                  <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="Enter your full name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email address" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Enter your phone number" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Preferred City</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter your preferred city" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Brief Message (Optional)</Label>
                <Input id="message" name="message" value={formData.message} onChange={handleInputChange} placeholder="Brief message about your interest" />
              </div>

              <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Quality Assurance Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Quality Assurance Promise</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every T VANAMM franchise maintains our exceptional quality standards through rigorous processes and continuous monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
            title: "Source Quality Control",
            desc: "Direct partnerships with premium tea gardens ensuring consistent quality from leaf to cup",
            icon: CheckCircle2
          }, {
            title: "Processing Standards",
            desc: "State-of-the-art processing facilities with strict hygiene and quality control protocols",
            icon: Settings
          }, {
            title: "Packaging Excellence",
            desc: "Advanced packaging technology preserving freshness and extending shelf life",
            icon: Shield
          }, {
            title: "Regular Audits",
            desc: "Monthly quality audits and franchise inspections to maintain brand standards",
            icon: BarChart3
          }, {
            title: "Training Programs",
            desc: "Continuous education on quality maintenance and customer service excellence",
            icon: GraduationCap
          }, {
            title: "Customer Feedback",
            desc: "Real-time customer feedback system for immediate quality improvements",
            icon: Users
          }].map((quality, index) => <Card key={quality.title} className="p-6 bg-white hover:shadow-card transition-smooth group">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-smooth">
                  <quality.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{quality.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{quality.desc}</p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Franchise Partner Spotlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Franchise Partner Spotlights</h2>
            <p className="text-xl text-muted-foreground">
              Meet some of our most successful franchise partners and their inspiring business journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            name: "Rajesh Kumar",
            location: "Mumbai Central",
            revenue: "₹4.2L/month",
            growth: "180% in 2 years",
            quote: "From a small investment to owning multiple outlets - T VANAMM made my entrepreneurial dreams come true.",
            year: "Since 2021"
          }, {
            name: "Priya Sharma",
            location: "Bangalore HSR",
            revenue: "₹3.8L/month",
            growth: "150% ROI achieved",
            quote: "The support system is incredible. Every challenge is met with immediate assistance and practical solutions.",
            year: "Since 2022"
          }, {
            name: "Amit Patel",
            location: "Ahmedabad CG Road",
            revenue: "₹5.1L/month",
            growth: "200% customer base",
            quote: "Quality products and strong brand recognition make every sale effortless. Customers trust T VANAMM.",
            year: "Since 2020"
          }].map((partner, index) => <Card key={partner.name} className="p-6 bg-gradient-to-br from-background to-muted/20 hover:shadow-card transition-smooth">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{partner.name}</h3>
                  <p className="text-muted-foreground text-sm">{partner.location} • {partner.year}</p>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                    <span className="font-semibold text-primary">{partner.revenue}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-sm text-muted-foreground">Business Growth</span>
                    <span className="font-semibold text-green-600">{partner.growth}</span>
                  </div>
                </div>
                
                <blockquote className="text-muted-foreground text-sm italic leading-relaxed text-center">
                  "{partner.quote}"
                </blockquote>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section with Interactive Map */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Get in Touch</h2>
            <p className="text-xl text-muted-foreground">
              Have questions? Our franchise team is here to help you every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="p-6 bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Call Our Franchise Team</h3>
                    <p className="text-muted-foreground">+91 93906 58544 • +91 90000 08479</p>
                    <p className="text-sm text-muted-foreground">Available 9 AM - 8 PM (Mon-Sat)</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Email Franchise Support</h3>
                    <p className="text-muted-foreground">tvanamm@gmail.com</p>
                    <p className="text-sm text-muted-foreground">Response within 24 hours</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Visit Our Head Office</h3>
                    <p className="text-muted-foreground">Plot No. 12, Rd Number 8, Gayatri Nagar</p>
                    <p className="text-muted-foreground">Kukatpally, Hyderabad 500072</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Interactive Map */}
            <div>
              <InteractiveMap address="Plot No. 12, Rd Number 8, Gayatri Nagar, Kukatpally, Hyderabad 500072" googleMapsLink="https://maps.google.com/?q=Plot+No.+12,+Rd+Number+8,+Gayatri+Nagar,+Kukatpally,+Hyderabad+500072" />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="brand" size="lg" onClick={() => setShowEnquiryModal(true)}>
              <Handshake className="mr-2 h-5 w-5" />
              Schedule a Meeting
            </Button>
            <Button variant="outline" size="lg" onClick={() => setShowBrochureModal(true)}>
              <Download className="mr-2 h-5 w-5" />
              Download Franchise Kit
            </Button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <FranchiseEnquiryModal isOpen={showEnquiryModal} onClose={() => setShowEnquiryModal(false)} />
      
      {/* Brochure Download Modal */}
      {showBrochureModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 m-4 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Download Franchise Brochure</h3>
            <p className="text-muted-foreground mb-4">
              Get detailed information about our franchise opportunities, investment requirements, and support services.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowBrochureModal(false)}>
                Cancel
              </Button>
              <Button variant="brand" onClick={() => {
            toast({
              title: "Brochure Download",
              description: "Our team will send the brochure to your email within 24 hours."
            });
            setShowBrochureModal(false);
          }}>
                Request Brochure
              </Button>
            </div>
          </Card>
        </div>}

      {/* Conditional Sticky Payment Reminder for franchise users */}
      {user && <StickyPaymentReminder />}
    </div>;
};
export default Franchise;