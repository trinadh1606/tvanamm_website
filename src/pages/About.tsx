import React from 'react';
import { SEOHead } from '@/components/SEO/SEOHead';
import { Eye, Compass, Heart, Leaf, Users, Award, MapPin, Phone, Mail, Globe, Shield, Truck, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useAuth';
import StickyPaymentReminder from '@/components/common/StickyPaymentReminder';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import StatisticsSection from '@/components/home/StatisticsSection';
import InteractiveMap from '@/components/ui/interactive-map';
import heroTeaGarden from '@/assets/hero-tea-garden-1.jpg';
import heroTeaPicking from '@/assets/hero-tea-picking.jpg';
import heroTeaCup from '@/assets/hero-tea-cup.jpg';
const About = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const userRole = useUserRole();
  const achievements = [{
    number: "150+",
    label: "Curated Products",
    icon: Leaf
  }, {
    number: "2021",
    label: "Founded",
    icon: Award
  }, {
    number: "500+",
    label: "Happy Customers",
    icon: Users
  }, {
    number: "4.9/5",
    label: "Customer Rating",
    icon: Award
  }];
  const features = [{
    icon: Leaf,
    title: "100% Organic Ingredients",
    description: "Sourced directly from certified organic farms with full traceability"
  }, {
    icon: Award,
    title: "Traditional Recipes",
    description: "Time-tested formulations passed down generations with modern refinements"
  }, {
    icon: Shield,
    title: "Quality Assured",
    description: "Rigorous testing and quality control at every step of production"
  }, {
    icon: Truck,
    title: "Sustainable Practices",
    description: "Environmentally conscious production methods and ethical sourcing"
  }];
  const timeline = [{
    year: "2021",
    title: "Company Founded",
    description: "Mrs. N. Naga Jyothi establishes T Vanamm with a vision to revolutionize healthy beverages"
  }, {
    year: "2022",
    title: "Product Line Expansion",
    description: "Launched premium tea collection and introduced innovative ice cream flavors"
  }, {
    year: "2023",
    title: "Quality Certifications",
    description: "Achieved organic certification and established quality control standards"
  }, {
    year: "2024",
    title: "Market Growth",
    description: "Expanded to 500+ customers across India with 4.9★ rating"
  }, {
    year: "2025",
    title: "Future Vision",
    description: "Scaling nationwide presence and launching franchise opportunities"
  }];
  const certifications = [{
    name: "Organic Certification",
    icon: Leaf,
    status: "Certified"
  }, {
    name: "Food Safety Standards",
    icon: Shield,
    status: "Compliant"
  }, {
    name: "Quality Assurance",
    icon: CheckCircle,
    status: "ISO Certified"
  }, {
    name: "Sustainable Sourcing",
    icon: Globe,
    status: "Verified"
  }];
  const sustainabilityFeatures = [{
    icon: Leaf,
    title: "Eco-Friendly Packaging",
    description: "100% biodegradable and recyclable packaging materials",
    impact: "50% reduction in carbon footprint"
  }, {
    icon: Users,
    title: "Fair Trade Practices",
    description: "Direct partnerships ensuring fair wages for farmers",
    impact: "Supporting 200+ farming families"
  }, {
    icon: Globe,
    title: "Carbon Neutral Operations",
    description: "Offsetting emissions through renewable energy initiatives",
    impact: "Zero net carbon emissions by 2025"
  }, {
    icon: Heart,
    title: "Community Development",
    description: "Educational programs and healthcare support for rural communities",
    impact: "Impacting 1000+ lives annually"
  }];
  const pressAndAwards = [{
    title: "Best Startup Award 2023",
    organization: "Indian Tea Association",
    description: "Recognized for innovation in traditional tea processing"
  }, {
    title: "Sustainable Business Excellence",
    organization: "Green Business Council",
    description: "Outstanding commitment to environmental responsibility"
  }, {
    title: "Customer Choice Award",
    organization: "Beverage Industry Forum",
    description: "Highest customer satisfaction in premium tea category"
  }, {
    title: "Quality Excellence Certification",
    organization: "Food Safety Authority",
    description: "Meeting international standards for food safety and quality"
  }];
  const teamMembers = [{
    name: "Mrs. N. Naga Jyothi",
    role: "Founder & CEO",
    expertise: "Business Strategy & Product Development",
    experience: "15+ years in FMCG industry",
    vision: "Making wellness accessible through premium beverages"
  }, {
    name: "Quality Assurance Team",
    role: "R&D Department",
    expertise: "Product Innovation & Quality Control",
    experience: "Collective 25+ years experience",
    vision: "Ensuring every product exceeds customer expectations"
  }, {
    name: "Supply Chain Team",
    role: "Operations & Logistics",
    expertise: "Sustainable Sourcing & Distribution",
    experience: "Industry veterans with proven track record",
    vision: "Building transparent and ethical supply chains"
  }];
  const companyValues = [{
    icon: Heart,
    title: "Customer-Centric Approach",
    description: "Every decision is made with our customers' health and satisfaction in mind. We listen, adapt, and continuously improve based on feedback.",
    principles: ["Active listening to customer needs", "Rapid response to feedback", "Continuous product improvement"]
  }, {
    icon: Leaf,
    title: "Environmental Stewardship",
    description: "We are committed to protecting the planet for future generations through sustainable practices and eco-friendly initiatives.",
    principles: ["Sustainable sourcing practices", "Carbon-neutral operations", "Biodegradable packaging"]
  }, {
    icon: Users,
    title: "Community Partnership",
    description: "Building long-term relationships with farmers, suppliers, and local communities to create shared value and mutual growth.",
    principles: ["Fair trade partnerships", "Community development programs", "Educational initiatives"]
  }, {
    icon: Award,
    title: "Innovation & Excellence",
    description: "Constantly pushing boundaries in product development while maintaining the highest standards of quality and taste.",
    principles: ["Continuous R&D investment", "Traditional wisdom meets modern technology", "Quality without compromise"]
  }];
  const processSteps = [{
    step: "01",
    title: "Sourcing",
    description: "Direct partnerships with organic tea gardens ensuring premium quality leaves",
    image: heroTeaPicking
  }, {
    step: "02",
    title: "Processing",
    description: "Traditional methods combined with modern technology for optimal flavor",
    image: heroTeaGarden
  }, {
    step: "03",
    title: "Quality Control",
    description: "Multiple quality checkpoints ensuring consistency and excellence",
    image: heroTeaCup
  }, {
    step: "04",
    title: "Packaging",
    description: "Eco-friendly packaging that preserves freshness and maintains quality",
    image: heroTeaCup
  }];
  const values = [{
    icon: Heart,
    title: "Passion for Tea",
    description: "Our dedication to perfection drives every aspect of our tea crafting process."
  }, {
    icon: Leaf,
    title: "Sustainable Sourcing",
    description: "Direct trade practices that support farmers and protect the environment."
  }, {
    icon: Users,
    title: "Wellness Revolution",
    description: "Health-focused approach to creating beverages that nourish body and soul."
  }, {
    icon: Award,
    title: "Excellence",
    description: "Commitment to the highest standards in every cup we deliver."
  }];
  return <div className="min-h-screen bg-background">
      <SEOHead title="About T VANAMM - Authentic Indian Tea Heritage" description="Learn about T VANAMM's commitment to premium authentic Indian tea, our heritage, quality standards, and mission to bring the finest tea directly from gardens to your cup." keywords="about t vanamm, indian tea heritage, authentic tea, premium tea quality, tea gardens" canonicalUrl="https://tvanamm.com/about" />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                About T Vanamm
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Crafting Wellness Through
                <span className="block text-primary">Premium Tea</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Mrs. N. Naga Jyothi's vision since 2021 has been to revolutionize the tea industry 
                by combining traditional wisdom with modern wellness principles, creating exceptional 
                beverages that nurture both body and spirit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="brand" size="lg" onClick={() => navigate('/order')}>
                  Explore Our Products
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                  Contact Us
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 animate-scale-in">
              <img src={heroTeaGarden} alt="Tea Garden" className="rounded-lg shadow-lg object-cover h-48 w-full" />
              <img src={heroTeaPicking} alt="Tea Picking" className="rounded-lg shadow-lg object-cover h-48 w-full mt-8" />
              <img src={heroTeaCup} alt="Premium Tea Cup" className="rounded-lg shadow-lg object-cover h-48 w-full -mt-8" />
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border">
                <div className="text-2xl font-bold text-primary mb-2">4.9★</div>
                <div className="text-sm text-muted-foreground">Customer Rating</div>
                <div className="text-lg font-semibold text-foreground">500+ Happy Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <StatisticsSection />

      {/* Quality Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Why Choose T Vanamm</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our commitment to quality, tradition, and innovation sets us apart in the industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <Card key={feature.title} className="p-6 text-center hover:shadow-lg transition-all duration-300 hover-scale">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Company Timeline Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Our Journey</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From a visionary idea to a trusted brand - the T Vanamm story of growth and excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {timeline.map((milestone, index) => <Card key={milestone.year} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                  <h3 className="font-semibold text-foreground mb-3">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{milestone.description}</p>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Manufacturing Process Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">From Garden to Cup</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our meticulous process ensures every product meets the highest standards of quality and taste.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {processSteps.map((step, index) => <Card key={step.step} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video relative overflow-hidden">
                  <img src={step.image} alt={step.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Quality Certifications</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our commitment to excellence is validated by industry-leading certifications and standards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert, index) => <Card key={cert.name} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <cert.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cert.name}</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {cert.status}
                </Badge>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To become a household name across India, recognized for our commitment to quality, 
                  health, and sustainability. We envision a future where T Vanamm products are 
                  synonymous with wellness and trusted in every Indian home.
                </p>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Compass className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide quality, affordable beverages that promote health and wellness. 
                  We are committed to using the finest ingredients, supporting local communities, 
                  and delivering exceptional products that exceed customer expectations.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Core Values Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Our Core Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These fundamental principles guide every decision we make and every product we create.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {companyValues.map((value, index) => <Card key={value.title} className="p-8 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{value.description}</p>
                    <div className="space-y-2">
                      {value.principles.map((principle, idx) => <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">{principle}</span>
                        </div>)}
                    </div>
                  </div>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Leadership & Expertise</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the passionate team driving T Vanamm's mission of wellness and excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => <Card key={member.name} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center text-primary text-xl font-bold mb-6 mx-auto">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Expertise:</strong> {member.expertise}</p>
                  <p><strong>Experience:</strong> {member.experience}</p>
                  <blockquote className="italic border-l-2 border-primary/20 pl-4 mt-4">
                    "{member.vision}"
                  </blockquote>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Sustainability & Community Impact Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Sustainability & Community Impact</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our commitment extends beyond business success to creating positive environmental and social impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sustainabilityFeatures.map((feature, index) => <Card key={feature.title} className="p-8 hover:shadow-lg transition-shadow group">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {feature.impact}
                    </Badge>
                  </div>
                </div>
              </Card>)}
          </div>

          <div className="mt-16 text-center">
            
          </div>
        </div>
      </section>

      {/* Awards & Recognition Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Awards & Recognition</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our commitment to excellence has been recognized by industry leaders and organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pressAndAwards.map((award, index) => <Card key={award.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{award.title}</h3>
                    <p className="text-primary text-sm font-medium mb-2">{award.organization}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{award.description}</p>
                  </div>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Enhanced Founder Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-foreground mb-6">Meet Our Visionary Founder</h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Mrs. N. Naga Jyothi</strong> founded T Vanamm in 2021 
                  with a revolutionary vision: to transform the traditional beverage industry by prioritizing 
                  health, quality, and customer satisfaction above all else.
                </p>
                <p>
                  With over 15 years of experience in the FMCG industry, she identified a critical gap in the market—
                  people wanted healthier alternatives to conventional beverages without compromising on taste. 
                  This insight led to the creation of T Vanamm's unique product line that combines traditional 
                  brewing methods with modern health science.
                </p>
                <p>
                  Her leadership philosophy centers on transparency, innovation, and community impact. Under her 
                  guidance, T Vanamm has pioneered sustainable sourcing practices, established direct trade 
                  relationships with farmers, and maintained an unwavering commitment to product quality.
                </p>
                <div className="bg-muted/50 rounded-lg p-6 border-l-4 border-primary">
                  <h4 className="font-semibold text-foreground mb-3">Founder's Philosophy</h4>
                  <ul className="space-y-2 text-base">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Quality is never an accident; it is always the result of intelligent effort</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Sustainable business practices create lasting value for all stakeholders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Innovation thrives when traditional wisdom meets modern technology</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-4 mx-auto">
                    NJ
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">Mrs. N. Naga Jyothi</h3>
                  <p className="text-primary font-medium mb-4">Founder & CEO</p>
                  <blockquote className="text-muted-foreground italic leading-relaxed mb-6">
                    "My vision is to make T Vanamm a household name across India, known for products 
                    that bring health, happiness, and authentic flavors to every family."
                  </blockquote>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">15+</div>
                      <div className="text-sm text-muted-foreground">Years Experience</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">2021</div>
                      <div className="text-sm text-muted-foreground">Company Founded</div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Key Achievements</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Built T Vanamm from startup to 500+ customers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Established partnerships with 200+ farming families</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Leaf className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Pioneer in sustainable tea industry practices</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Maintained 4.9★ customer satisfaction rating</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <TestimonialsSection />

      {/* Contact & Location Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Visit Our Headquarters</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Come experience our commitment to quality firsthand at our state-of-the-art facility.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Head Office</h3>
                    <p className="text-muted-foreground">
                      T Vanamm Private Limited<br />
                      Hyderabad, Telangana, India
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Contact Information</h3>
                    <p className="text-muted-foreground">
                      Phone: +91 XXXXX XXXXX<br />
                      WhatsApp Business: Available
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            
            <div>
              <InteractiveMap address="T Vanamm Private Limited, Hyderabad, Telangana, India" googleMapsLink="https://maps.google.com/?q=Hyderabad,Telangana,India" />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Join the T Vanamm Wellness Revolution
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Experience the perfect blend of tradition, innovation, and wellness. Join thousands of satisfied 
            customers who have made T Vanamm their preferred choice for healthy, delicious beverages.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <Truck className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Quick and secure delivery across India</p>
            </Card>
            <Card className="p-6 text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Quality Guarantee</h3>
              <p className="text-sm text-muted-foreground">100% satisfaction or money back</p>
            </Card>
            <Card className="p-6 text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Expert Support</h3>
              <p className="text-sm text-muted-foreground">Dedicated customer service team</p>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="brand" size="lg" className="text-lg px-8 py-3" onClick={() => navigate('/order')}>
              Shop Premium Products
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3" onClick={() => navigate('/franchise')}>
              Become a Partner
            </Button>
            <Button variant="secondary" size="lg" className="text-lg px-8 py-3" onClick={() => navigate('/contact')}>
              Get in Touch
            </Button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">Follow our journey on social media</p>
            <div className="flex justify-center gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                Instagram
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                Facebook
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                LinkedIn
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                YouTube
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Payment Reminder for Franchise Users Only */}
      {user && userRole === 'franchise' && <StickyPaymentReminder />}
    </div>;
};
export default About;