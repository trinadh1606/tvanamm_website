import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Eye, Compass, Heart, Leaf, Users, Award, MapPin, Phone, Mail,
  Globe, Shield, Truck, Clock, CheckCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useAuth";
// Lazy load heavy sections to trim initial JS
const TestimonialsSection = lazy(() => import("@/components/home/TestimonialsSection"));
const StatisticsSection   = lazy(() => import("@/components/home/StatisticsSection"));
const InteractiveMap      = lazy(() => import("@/components/ui/interactive-map"));

import heroTeaGarden from "@/assets/hero-tea-garden-1.webp";
import heroTeaPicking from "@/assets/hero-tea-picking.webp";
import heroTeaCup from "@/assets/hero-tea-cup.webp";
import StickyPaymentReminder from "@/components/common/StickyPaymentReminder";

// Render children only when scrolled near viewport
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

const About: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = useUserRole();

  const achievements = [
    { number: "150+", label: "Curated Products", icon: Leaf },
    { number: "2021", label: "Founded", icon: Award },
    { number: "500+", label: "Happy Customers", icon: Users },
    { number: "4.9/5", label: "Customer Rating", icon: Award },
  ];

  const features = [
    { icon: Leaf,   title: "100% Organic Ingredients", description: "Sourced directly from certified organic farms with full traceability" },
    { icon: Award,  title: "Traditional Recipes",      description: "Time-tested formulations passed down generations with modern refinements" },
    { icon: Shield, title: "Quality Assured",          description: "Rigorous testing and quality control at every step of production" },
    { icon: Truck,  title: "Sustainable Practices",    description: "Environmentally conscious production methods and ethical sourcing" },
  ];

  const timeline = [
    { year: "2021", title: "Company Founded",        description: "Mrs. N. Naga Jyothi establishes T VANAMM with a vision to revolutionize healthy beverages" },
    { year: "2022", title: "Product Line Expansion", description: "Launched premium tea collection and introduced innovative ice cream flavors" },
    { year: "2023", title: "Quality Certifications", description: "Achieved organic certification and established quality control standards" },
    { year: "2024", title: "Market Growth",          description: "Expanded to 500+ customers across India with 4.9★ rating" },
    { year: "2025", title: "Future Vision",          description: "Scaling nationwide presence and launching franchise opportunities" },
  ];

  const certifications = [
    { name: "Organic Certification",  icon: Leaf,       status: "Certified" },
    { name: "Food Safety Standards",  icon: Shield,     status: "Compliant" },
    { name: "Quality Assurance",      icon: CheckCircle,status: "ISO Certified" },
    { name: "Sustainable Sourcing",   icon: Globe,      status: "Verified" },
  ];

  const sustainabilityFeatures = [
    { icon: Leaf,  title: "Eco-Friendly Packaging",   description: "100% biodegradable and recyclable packaging materials", impact: "50% reduction in carbon footprint" },
    { icon: Users, title: "Fair Trade Practices",     description: "Direct partnerships ensuring fair wages for farmers",   impact: "Supporting 200+ farming families" },
    { icon: Globe, title: "Carbon Neutral Operations",description: "Offsetting emissions through renewable energy",        impact: "Zero net carbon emissions by 2025" },
    { icon: Heart, title: "Community Development",    description: "Education & healthcare support for rural communities", impact: "Impacting 1000+ lives annually" },
  ];

  const pressAndAwards = [
    { title: "Best Startup Award 2023",           organization: "Indian Tea Association",     description: "Recognized for innovation in traditional tea processing" },
    { title: "Sustainable Business Excellence",   organization: "Green Business Council",      description: "Outstanding commitment to environmental responsibility" },
    { title: "Customer Choice Award",             organization: "Beverage Industry Forum",     description: "Highest customer satisfaction in premium tea category" },
    { title: "Quality Excellence Certification",  organization: "Food Safety Authority",       description: "Meeting international standards for food safety and quality" },
  ];

  const teamMembers = [
    { name: "Mrs. N. Naga Jyothi", role: "Founder & CEO", expertise: "Business Strategy & Product Development", experience: "15+ years in FMCG", vision: "Making wellness accessible through premium beverages" },
    { name: "Quality Assurance Team", role: "R&D Department", expertise: "Product Innovation & Quality Control", experience: "Collective 25+ years", vision: "Ensuring every product exceeds expectations" },
    { name: "Supply Chain Team", role: "Operations & Logistics", expertise: "Sustainable Sourcing & Distribution", experience: "Industry veterans", vision: "Building transparent, ethical supply chains" },
  ];

  const processSteps = [
    { step: "01", title: "Sourcing",         description: "Direct partnerships with organic tea gardens ensuring premium leaves", image: heroTeaPicking },
    { step: "02", title: "Processing",       description: "Traditional methods + modern tech for optimal flavor",                image: heroTeaGarden },
    { step: "03", title: "Quality Control",  description: "Multiple checkpoints ensuring consistency and excellence",           image: heroTeaCup },
    { step: "04", title: "Packaging",        description: "Eco-friendly packaging that preserves freshness",                    image: heroTeaCup },
  ];

  const companyValues = [
    {
      icon: Heart,
      title: "Customer-Centric Approach",
      description:
        "Every decision is made with our customers' health and satisfaction in mind.",
      principles: [
        "Active listening to customer needs",
        "Rapid response to feedback",
        "Continuous product improvement",
      ],
    },
    {
      icon: Leaf,
      title: "Environmental Stewardship",
      description:
        "Committed to protecting the planet through sustainable practices and initiatives.",
      principles: ["Sustainable sourcing", "Carbon-neutral ops", "Biodegradable packaging"],
    },
    {
      icon: Users,
      title: "Community Partnership",
      description:
        "Building long-term relationships with farmers and local communities.",
      principles: ["Fair trade partnerships", "Community development", "Educational initiatives"],
    },
    {
      icon: Award,
      title: "Innovation & Excellence",
      description:
        "Pushing boundaries while maintaining the highest standards of quality.",
      principles: ["R&D investment", "Tradition meets technology", "Quality without compromise"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Route-level SEO */}
      <Helmet>
        <title>About T VANAMM — Authentic Indian Tea, Quality & Vision</title>
        <meta
          name="description"
          content="Discover T VANAMM: authentic Indian tea, sustainable sourcing, rigorous quality, and our vision to make premium wellness beverages widely accessible."
        />
        <link rel="canonical" href={`${SITE}/about`} />
        {/* OG / Twitter */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About T VANAMM" />
        <meta
          property="og:description"
          content="Our story, values, certifications, and the team crafting premium Indian tea with sustainable practices."
        />
        <meta property="og:url" content={`${SITE}/about`} />
        <meta property="og:image" content={`${SITE}/tea-og-image.webp`} />
        <meta name="twitter:card" content="summary_large_image" />

        {/* JSON-LD: Organization with Founder */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "T VANAMM",
            url: SITE,
            logo: `${SITE}/logo.png`,
            sameAs: [
              "https://facebook.com/tvanamm",
              "https://instagram.com/tvanamm",
              "https://x.com/tvanamm",
            ],
            founder: {
              "@type": "Person",
              name: "Mrs. N. Naga Jyothi",
              jobTitle: "Founder & CEO",
            },
            address: {
              "@type": "PostalAddress",
              addressLocality: "Hyderabad",
              addressRegion: "Telangana",
              postalCode: "500072",
              addressCountry: "IN",
            },
            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: "+91-9390658544",
                contactType: "customer service",
                areaServed: "IN",
                availableLanguage: ["en", "hi", "te"],
              },
            ],
          })}
        </script>

        {/* JSON-LD: AboutPage + Breadcrumbs */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About T VANAMM",
            url: `${SITE}/about`,
            mainEntityOfPage: `${SITE}/about`,
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: "About", item: `${SITE}/about` },
            ],
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background" aria-label="About T VANAMM">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">About T VANAMM</Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Crafting Wellness Through
                <span className="block text-primary">Premium Tea</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                T VANAMM is more than a beverage brand — it’s a vision to redefine daily indulgence through authentic flavors, accessible luxury, and inclusive opportunity.
                Our curated menu spans herbal teas, mocktails, shakes, ice creams, juices, and wholesome snacks — crafted for purity, richness, and innovation.
                We empower entrepreneurs with a low-entry franchise model, end-to-end training, and zero royalty fees to drive shared success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="brand" size="lg" onClick={() => navigate("/order")}>
                  Explore Our Products
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/contact")}>
                  Contact Us
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src={heroTeaGarden}
                alt="Tea Garden"
                className="rounded-lg shadow-lg object-cover h-48 w-full"
                loading="eager"
                decoding="async"
                width={800}
                height={600}
              />
              <img
                src={heroTeaPicking}
                alt="Tea Picking"
                className="rounded-lg shadow-lg object-cover h-48 w-full mt-8"
                loading="lazy"
                decoding="async"
                width={800}
                height={600}
              />
              <img
                src={heroTeaCup}
                alt="Premium Tea Cup"
                className="rounded-lg shadow-lg object-cover h-48 w-full -mt-8"
                loading="lazy"
                decoding="async"
                width={800}
                height={600}
              />
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border">
                <div className="text-2xl font-bold text-primary mb-2">4.9★</div>
                <div className="text-sm text-muted-foreground">Customer Rating</div>
                <div className="text-lg font-semibold text-foreground">500+ Happy Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats (lazy, in-view) */}
      <InView>
        {(visible) => (
          <Suspense fallback={<div className="h-48 bg-muted animate-pulse" aria-hidden />}>
            {visible ? <StatisticsSection /> : null}
          </Suspense>
        )}
      </InView>

      {/* Why Choose */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Why Choose T VANAMM</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our commitment to quality, tradition, and innovation sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <Card key={f.title} className="p-6 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-primary" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Our Journey</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From a visionary idea to a trusted brand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {timeline.map((m) => (
              <Card key={m.year} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">{m.year}</div>
                  <h3 className="font-semibold text-foreground mb-3">{m.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">From Garden to Cup</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our meticulous process ensures quality and taste.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {processSteps.map((s) => (
              <Card key={s.step} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {s.step}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Quality Certifications</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Excellence validated by industry-leading standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((c) => (
              <Card key={c.name} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <c.icon className="w-6 h-6 text-primary" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{c.name}</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {c.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="p-8 hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-primary" aria-hidden />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become a household name across India, recognized for quality, health, and sustainability.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Compass className="w-8 h-8 text-primary" aria-hidden />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To provide quality, affordable beverages while supporting communities and the environment.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Our Core Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Principles that guide every product we create.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {companyValues.map((v) => (
              <Card key={v.title} className="p-8 hover:shadow-lg transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <v.icon className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">{v.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{v.description}</p>
                    <div className="space-y-2">
                      {v.principles.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" aria-hidden />
                          <span className="text-sm text-muted-foreground">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Leadership & Expertise</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the team driving T VANAMM’s mission.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {teamMembers.map((m) => (
              <Card key={m.name} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center text-primary text-xl font-bold mb-6 mx-auto" aria-hidden>
                  {m.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{m.name}</h3>
                <p className="text-primary font-medium mb-3">{m.role}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Expertise:</strong> {m.expertise}</p>
                  <p><strong>Experience:</strong> {m.experience}</p>
                  <blockquote className="italic border-l-2 border-primary/20 pl-4 mt-4">
                    “{m.vision}”
                  </blockquote>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Sustainability & Community Impact</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Positive environmental and social impact baked into our model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sustainabilityFeatures.map((s) => (
              <Card key={s.title} className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <s.icon className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-3">{s.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{s.description}</p>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {s.impact}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Awards & Recognition</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Recognized by industry leaders and organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pressAndAwards.map((a) => (
              <Card key={a.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{a.title}</h3>
                    <p className="text-primary text-sm font-medium mb-2">{a.organization}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{a.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-foreground mb-6">Meet Our Visionary Founder</h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Mrs. N. Naga Jyothi</strong> founded T VANAMM in 2021 with a vision to transform the beverage industry by prioritizing health, quality, and customer satisfaction.
                </p>
                <p>
                  With 15+ years of FMCG experience, she combined traditional brewing methods with modern health science to craft our unique product line.
                </p>
                <p>
                  Her leadership centers on transparency, innovation, and community impact — from direct trade relationships to sustainable sourcing.
                </p>
                <div className="bg-muted/50 rounded-lg p-6 border-l-4 border-primary">
                  <h4 className="font-semibold text-foreground mb-3">Founder's Philosophy</h4>
                  <ul className="space-y-2 text-base">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" aria-hidden />Quality is the result of intelligent effort</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" aria-hidden />Sustainable practices create lasting value</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" aria-hidden />Innovation thrives where tradition meets tech</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-4 mx-auto" aria-hidden>NJ</div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">Mrs. N. Naga Jyothi</h3>
                  <p className="text-primary font-medium mb-4">Founder & CEO</p>
                  <blockquote className="text-muted-foreground italic leading-relaxed mb-6">
                    “My vision is to make T VANAMM a household name across India, bringing health, happiness, and authentic flavors to every family.”
                  </blockquote>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div><div className="text-2xl font-bold text-primary">15+</div><div className="text-sm text-muted-foreground">Years Experience</div></div>
                    <div><div className="text-2xl font-bold text-primary">2021</div><div className="text-sm text-muted-foreground">Company Founded</div></div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Key Achievements</h4>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-center gap-3"><Award className="w-5 h-5 text-primary" aria-hidden />Built T VANAMM from startup to 500+ customers</div>
                  <div className="flex items-center gap-3"><Users className="w-5 h-5 text-primary" aria-hidden />Partnerships with 200+ farming families</div>
                  <div className="flex items-center gap-3"><Leaf className="w-5 h-5 text-primary" aria-hidden />Pioneer in sustainable tea practices</div>
                  <div className="flex items-center gap-3"><Heart className="w-5 h-5 text-primary" aria-hidden />Maintained 4.9★ customer satisfaction</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (lazy, in-view) */}
      <InView>
        {(visible) => (
          <Suspense fallback={<div className="h-64 bg-muted animate-pulse" aria-hidden />}>
            {visible ? <TestimonialsSection /> : null}
          </Suspense>
        )}
      </InView>

      {/* Contact & Location */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Visit Our Headquarters</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience our commitment to quality firsthand.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" aria-hidden />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Head Office</h3>
                    <p className="text-muted-foreground">
                      T VANAMM Private Limited<br />
                      Hyderabad, Telangana, India
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary mt-1" aria-hidden />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Contact Information</h3>
                    <p className="text-muted-foreground">
                      Phone: +91 93906 58544, +91 90000 08479<br />
                      Email: tvanamm@gmail.com
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary mt-1" aria-hidden />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Mon–Fri: 9:00 AM – 6:00 PM<br />
                      Sat: 9:00 AM – 2:00 PM • Sun: Closed
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Map loads only when in view */}
            <InView placeholderHeight={350}>
              {(visible) => (
                <Suspense fallback={<div className="h-72 w-full bg-muted animate-pulse rounded-lg" />}>
                  {visible ? (
                    <InteractiveMap
                      address="T VANAMM Private Limited, Hyderabad, Telangana, India"
                      googleMapsLink="https://maps.google.com/?q=Hyderabad,Telangana,India"
                    />
                  ) : null}
                </Suspense>
              )}
            </InView>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Join the T VANAMM Wellness Revolution</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Tradition, innovation, and wellness in every cup.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <Truck className="w-8 h-8 text-primary mx-auto mb-3" aria-hidden />
              <h3 className="font-semibold text-foreground mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Quick and secure across India</p>
            </Card>
            <Card className="p-6 text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" aria-hidden />
              <h3 className="font-semibold text-foreground mb-2">Quality Guarantee</h3>
              <p className="text-sm text-muted-foreground">100% satisfaction or money back</p>
            </Card>
            <Card className="p-6 text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" aria-hidden />
              <h3 className="font-semibold text-foreground mb-2">Expert Support</h3>
              <p className="text-sm text-muted-foreground">Dedicated team for you</p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="brand" size="lg" className="text-lg px-8 py-3" onClick={() => navigate("/order")}>
              Shop Premium Products
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3" onClick={() => navigate("/franchise")}>
              Become a Partner
            </Button>
            <Button variant="secondary" size="lg" className="text-lg px-8 py-3" onClick={() => navigate("/contact")}>
              Get in Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky reminder for franchise users only */}
      {user && userRole === "franchise" ? <StickyPaymentReminder /> : null}
    </div>
  );
};

export default About;
