import React, { useState, lazy, Suspense, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import {
  Store, TrendingUp, Users, Award, Shield, Headphones,
  Phone, Mail, MapPin, Download, CheckCircle, GraduationCap,
  Megaphone, Settings, Truck, BarChart3, Target, Briefcase,
  Calendar, CheckCircle2, Trophy, DollarSign, Clock, Building2, Handshake
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StickyPaymentReminder from "@/components/common/StickyPaymentReminder";

// Lazy-load heavy sections/components to reduce the initial bundle
const StatisticsSection = lazy(() => import("@/components/home/StatisticsSection"));
const TestimonialsSection = lazy(() => import("@/components/home/TestimonialsSection"));
const InteractiveMap = lazy(() => import("@/components/ui/interactive-map"));
const FranchiseEnquiryModal = lazy(() => import("@/components/franchise/FranchiseEnquiryModal"));

// CURRENT: using bundled assets. LATER: move to /public and replace with string paths (e.g., "/images/hero-tea-garden-1.webp")
import heroTeaGarden from "@/assets/hero-tea-garden-1.webp";
import heroTeaPicking from "@/assets/hero-tea-picking.webp";
import heroTeaCup from "@/assets/hero-tea-cup.webp";

/** Render children only when scrolled into view (cuts initial JS work) */
function InView({
  rootMargin = "200px",
  children,
  placeholderHeight = 240,
}: {
  rootMargin?: string;
  children: (visible: boolean) => React.ReactNode;
  placeholderHeight?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return <div ref={ref}>{visible ? children(true) : <div style={{ minHeight: placeholderHeight }} />}</div>;
}

const SITE = "https://tvanamm.com";

const Franchise: React.FC = () => {
  const [formData, setFormData] = useState({
    contactPerson: "",
    phone: "",
    email: "",
    city: "",
    message: "",
    // Honeypot to deter simple bots
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const benefits = [
    {
      icon: Store,
      title: "High ROI investment",
      description:
        "Start your premium tea business with minimal capital investment and maximum growth potential",
    },
    {
      icon: TrendingUp,
      title: "Proven Business Model",
      description:
        "Join 150+ successful partners with our time-tested franchise system and comprehensive support",
    },
    {
      icon: Users,
      title: "Trend Setting Menu",
      description:
        "Tap into India's ₹50,000+ crore tea market with increasing demand for premium quality products",
    },
    {
      icon: Award,
      title: "Premium Brand",
      description:
        "Partner with T VANAMM — a trusted name with 5+ years of excellence and thousands of satisfied customers",
    },
    {
      icon: Shield,
      title: "Brand Recognition",
      description:
        "Sustained brand with active social media presence and established market footprint",
    },
    {
      icon: Headphones,
      title: "Support for Partners",
      description:
        "Continuous training, marketing assistance, and dedicated business development support",
    },
  ];

  const supportServices = [
    {
      icon: GraduationCap,
      title: "Staff Training",
      description:
        "Professional training modules to ensure your staff delivers exceptional customer experiences",
    },
    {
      icon: Megaphone,
      title: "Marketing Support",
      description:
        "National and local campaigns, promotional materials, and digital marketing assistance",
    },
    {
      icon: Settings,
      title: "Operational Support",
      description:
        "Daily operations playbooks, inventory management, and quality control processes",
    },
    {
      icon: Truck,
      title: "Supply Chain",
      description:
        "Direct access to premium tea products with reliable logistics and competitive wholesale pricing",
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description:
        "Performance tracking tools and sales insights to optimize your operations",
    },
  ];

  const investmentTiers = [
    {
      title: "City Franchise",
      investment: "₹5–8 Lakhs",
      features: [
        "Exclusive city rights",
        "Complete setup support",
        "Marketing materials",
        "Training program",
        "Monthly ROI: 15–25%",
      ],
    },
    {
      title: "State Franchise",
      investment: "₹15–25 Lakhs",
      features: [
        "Entire state rights",
        "Master franchise benefits",
        "Sub-franchise opportunities",
        "Premium support",
        "Monthly ROI: 20–30%",
      ],
    },
    {
      title: "Regional Franchise",
      investment: "₹50+ Lakhs",
      features: [
        "Multi-state territory",
        "Regional master rights",
        "Maximum profit potential",
        "VIP support",
        "Monthly ROI: 25–35%",
      ],
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot
    if (formData.company.trim() !== "") {
      toast({
        title: "Submission blocked",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    // India phone validation (optional)
    const phoneOk =
      !formData.phone ||
      /^(?:\+?91[-\s]?)?[6-9]\d{9}$/.test(formData.phone.replace(/\s+/g, ""));
    if (!phoneOk) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Indian mobile number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("leads").insert([
        {
          name: formData.contactPerson.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: `Franchise Inquiry - ${formData.city}: ${formData.message.trim()}`,
          source: "franchise",
        },
      ]);
      if (error) throw error;

      // GA conversion (if available)
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "generate_lead", {
          event_category: "engagement",
          event_label: "franchise_form",
          value: 1,
        });
      }

      toast({
        title: "Application submitted",
        description: "Our franchise team will contact you within 24 hours.",
      });

      setFormData({
        contactPerson: "",
        phone: "",
        email: "",
        city: "",
        message: "",
        company: "",
      });
    } catch {
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Route-level SEO */}
      <Helmet>
        <title>Tea Franchise Opportunities | Join T VANAMM Network</title>
        <meta
          name="description"
          content="Start your own tea business with T VANAMM. Training, supply chain, marketing support & proven ROI. Choose City, State or Regional franchise models."
        />
        <link rel="canonical" href={`${SITE}/franchise`} />
        {/* OG / Twitter */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Tea Franchise Opportunities | T VANAMM" />
        <meta
          property="og:description"
          content="Premium tea & chai franchise with low investment and high returns across Telangana & Andhra Pradesh."
        />
        <meta property="og:url" content={`${SITE}/franchise`} />
        <meta property="og:image" content={`${SITE}/tea-og-image.webp`} />
        <meta name="twitter:card" content="summary_large_image" />

        {/* JSON-LD: Product (franchise offering) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "T VANAMM Tea Franchise",
            description: "Premium tea franchise opportunity with comprehensive support",
            brand: "T VANAMM",
            offers: { "@type": "Offer", availability: "https://schema.org/InStock" },
            url: `${SITE}/franchise`,
          })}
        </script>

        {/* JSON-LD: Breadcrumbs */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: "Franchise", item: `${SITE}/franchise` },
            ],
          })}
        </script>

        {/* JSON-LD: FAQ */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How much investment is required?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Investment varies by model. City: ₹5–8L, State: ₹15–25L, Regional: ₹50L+. Get the detailed breakup on this page.",
                },
              },
              {
                "@type": "Question",
                name: "What support do franchisees receive?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "End-to-end support including site guidance, setup, staff training, supply chain, marketing and performance analytics.",
                },
              },
              {
                "@type": "Question",
                name: "When can I launch after signing?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Typical launch in 5–6 weeks after agreement, depending on fit-out and local approvals.",
                },
              },
            ],
          })}
        </script>
      </Helmet>

      {/* HERO */}
      <section
        className="relative min-h-screen bg-gradient-to-br from-tea-green to-tea-green/90 py-20 overflow-hidden"
        aria-label="Franchise Hero"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-black/20">
          <div className="absolute inset-0 opacity-20">
            <img
              src={heroTeaGarden}
              alt="Tea Garden"
              className="w-full h-full object-cover"
              width={2400}
              height={1200}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="text-center w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Join the <span className="text-accent">T VANAMM</span>
                <span className="block text-white/90 text-4xl md:text-5xl mt-2">
                  Franchise Family
                </span>
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
                Build your premium tea empire with India&apos;s trusted franchise network.
                <span className="block mt-2 text-lg">
                  Low investment • High returns • Comprehensive support
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" onClick={() => setShowEnquiryModal(true)}>
                  <Briefcase className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => setShowBrochureModal(true)}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Brochure
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics (lazy, in-view) */}
      <InView>
        {(visible) => (
          <Suspense fallback={<div className="h-48 w-full bg-muted animate-pulse" aria-hidden />}>
            {visible ? <StatisticsSection /> : null}
          </Suspense>
        )}
      </InView>

      {/* Visual Gallery */}
      <section className="py-20 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              From Garden to Your Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the premium quality journey that makes T VANAMM the preferred choice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { src: heroTeaPicking, title: "Premium Sourcing", sub: "Hand-picked from finest gardens" },
              { src: heroTeaGarden, title: "Quality Processing", sub: "Modern facilities & techniques" },
              { src: heroTeaCup, title: "Perfect Blend", sub: "Exquisite taste & aroma" },
            ].map((item) => (
              <Card key={item.title} className="relative overflow-hidden border-0 shadow-elegant">
                <div className="aspect-video relative">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    width={1200}
                    height={675}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-white/80">{item.sub}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Franchise Opportunities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Franchise Opportunities</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join a premium tea franchise with proven success and comprehensive support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="p-6 bg-white hover:shadow-card text-center border-l-4 border-l-tea-green"
              >
                <div className="w-16 h-16 bg-tea-light text-tea-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8" aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Comprehensive Franchise Support
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              End-to-end help from day one to long-term growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportServices.map((service) => (
              <Card key={service.title} className="p-6 bg-white hover:shadow-card">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-20 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Your Franchise Journey</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From application to grand opening, we guide you at every step.
            </p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: "1", title: "Enquiry & Application", desc: "Submit application & initial discussion", icon: Briefcase, timeframe: "Day 1" },
            { step: "2", title: "Evaluation", desc: "Territory analysis & approval", icon: Target, timeframe: "Week 1–2" },
            { step: "3", title: "Agreement", desc: "Sign franchise agreement and finalize terms", icon: GraduationCap, timeframe: "Week 3–4" },
            { step: "4", title: "Training", desc: "Comprehensive product training", icon: GraduationCap, timeframe: "Week 3–4" },
            { step: "5", title: "Launch", desc: "Grand opening with marketing support", icon: Trophy, timeframe: "Week 5–6" },
          ].map((p) => (
            <Card key={p.step} className="p-6 bg-white hover:shadow-card text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                {p.step}
              </div>
              <div className="mt-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <p.icon className="w-8 h-8 text-primary" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {p.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">{p.desc}</p>
                <div className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3 mr-1" aria-hidden />
                  {p.timeframe}
                </div>
              </div>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Business Performance Metrics
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real numbers from successful franchise partners across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { metric: "₹2.4L", label: "Average Monthly Revenue", icon: DollarSign, trend: "+23%" },
              { metric: "18%", label: "Average Monthly ROI", icon: TrendingUp, trend: "+5%" },
              { metric: "8 months", label: "Average Payback Period", icon: Calendar, trend: "-2 months" },
              { metric: "94%", label: "Partner Satisfaction Rate", icon: Trophy, trend: "+6%" },
            ].map((s) => (
              <Card key={s.label} className="p-6 bg-gradient-to-br from-background to-muted/20 hover:shadow-card text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-6 h-6 text-primary" aria-hidden />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{s.metric}</div>
                <div className="text-muted-foreground text-sm mb-2">{s.label}</div>
                <div className="inline-flex items-center text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" aria-hidden />
                  {s.trend}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (lazy, in-view) */}
      <InView>
        {(visible) => (
          <Suspense fallback={<div className="h-64 w-full bg-muted animate-pulse" aria-hidden />}>
            {visible ? <TestimonialsSection /> : null}
          </Suspense>
        )}
      </InView>

      {/* Investment Options */}
      <section className="py-20 bg-gray-50" aria-labelledby="investment-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="investment-heading" className="text-4xl font-bold text-foreground mb-6">
              Investment Options
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the model that best fits your capacity and goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {investmentTiers.map((tier) => (
              <Card key={tier.title} className="p-8 bg-white border-2 border-transparent hover:border-primary/20 hover:shadow-card">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{tier.title}</h3>
                  <div className="text-3xl font-bold text-primary">{tier.investment}</div>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mr-3 flex-shrink-0" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button variant="brand" className="w-full" onClick={() => setShowEnquiryModal(true)}>
                  Enquire Now
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Franchise Application
            </h2>
            <p className="text-xl text-muted-foreground">
              Fill out the form below and our team will contact you within 24 hours.
            </p>
          </div>

          <Card className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Honeypot */}
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Full Name</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    inputMode="tel"
                    pattern="^(?:\+?91[-\s]?)?[6-9]\d{9}$"
                    title="Valid Indian mobile number, e.g. +91 9000000000 or 9000000000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Preferred City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your preferred city"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Brief Message (Optional)</Label>
                <Input
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us a bit about your interest"
                />
              </div>

              <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Partner Spotlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Franchise Partner Spotlights
            </h2>
            <p className="text-xl text-muted-foreground">
              Meet some of our successful partners and their journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Rajesh Kumar",
                location: "Mumbai Central",
                revenue: "₹4.2L/month",
                growth: "180% in 2 years",
                quote:
                  "From a small investment to multiple outlets — T VANAMM helped me grow fast.",
                year: "Since 2021",
              },
              {
                name: "Priya Sharma",
                location: "Bengaluru HSR",
                revenue: "₹3.8L/month",
                growth: "150% ROI achieved",
                quote:
                  "The support system is incredible. Every challenge got a practical solution.",
                year: "Since 2022",
              },
              {
                name: "Amit Patel",
                location: "Ahmedabad CG Road",
                revenue: "₹5.1L/month",
                growth: "200% customer base",
                quote:
                  "Quality products and strong brand recognition make sales effortless.",
                year: "Since 2020",
              },
            ].map((p) => (
              <Card
                key={p.name}
                className="p-6 bg-gradient-to-br from-background to-muted/20 hover:shadow-card"
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-primary" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {p.location} • {p.year}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                    <span className="font-semibold text-primary">{p.revenue}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-sm text-muted-foreground">Business Growth</span>
                    <span className="font-semibold text-green-600">{p.growth}</span>
                  </div>
                </div>

                <blockquote className="text-muted-foreground text-sm italic leading-relaxed text-center">
                  “{p.quote}”
                </blockquote>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Map (lazy map) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Get in Touch</h2>
            <p className="text-xl text-muted-foreground">
              Questions? Our franchise team is here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6 bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Call Our Franchise Team
                    </h3>
                    <p className="text-muted-foreground">
                      +91 93906 58544 • +91 90000 08479
                    </p>
                    <p className="text-sm text-muted-foreground">
                      9 AM – 8 PM (Mon–Sat)
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Email Franchise Support
                    </h3>
                    <p className="text-muted-foreground">tvanamm@gmail.com</p>
                    <p className="text-sm text-muted-foreground">
                      Response within 24 hours
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Visit Our Head Office
                    </h3>
                    <p className="text-muted-foreground">
                      Plot No. 12, Rd Number 8, Gayatri Nagar
                    </p>
                    <p className="text-muted-foreground">Kukatpally, Hyderabad 500072</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Map (only loads when in view) */}
            <InView placeholderHeight={350}>
              {(visible) => (
                <Suspense
                  fallback={<div className="h-72 w-full bg-muted animate-pulse rounded-lg" />}
                >
                  {visible ? (
                    <InteractiveMap
                      address="Plot No. 12, Rd Number 8, Gayatri Nagar, Kukatpally, Hyderabad 500072"
                      googleMapsLink="https://maps.google.com/?q=Plot+No.+12,+Rd+Number+8,+Gayatri+Nagar,+Kukatpally,+Hyderabad+500072"
                    />
                  ) : null}
                </Suspense>
              )}
            </InView>
          </div>

          {/* Quick actions */}
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

      {/* Enquiry Modal (lazy) */}
      <Suspense fallback={null}>
        {showEnquiryModal ? (
          <FranchiseEnquiryModal
            isOpen={showEnquiryModal}
            onClose={() => setShowEnquiryModal(false)}
          />
        ) : null}
      </Suspense>

      {/* Brochure Modal */}
      {showBrochureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 m-4 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Download Franchise Brochure</h3>
            <p className="text-muted-foreground mb-4">
              Get detailed information about our franchise models, investment and support.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowBrochureModal(false)}>
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={() => {
                  toast({
                    title: "Brochure request received",
                    description:
                      "Our team will send the brochure to your email within 24 hours.",
                  });
                  if (typeof window !== "undefined" && (window as any).gtag) {
                    (window as any).gtag("event", "download_brochure", {
                      event_category: "engagement",
                      event_label: "franchise_brochure",
                    });
                  }
                  setShowBrochureModal(false);
                }}
              >
                Request Brochure
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Sticky reminder for authenticated users */}
      {user && <StickyPaymentReminder />}
    </div>
  );
};

export default Franchise;
