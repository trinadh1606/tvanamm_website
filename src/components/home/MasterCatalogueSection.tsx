import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, CheckCircle } from 'lucide-react';
import { useCreateLead } from '@/hooks/useLeads';
import { sanitizeFormData, validateInput, isValidEmail, isValidPhone, rateLimitTracker } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';
import masterCatalogueImage from '@/assets/master-catalogue-2025.webp';

const MasterCatalogueSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const createLeadMutation = useCreateLead();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side rate limiting
    if (!rateLimitTracker.canAttempt('master-catalogue', 3, 300000)) { // 3 attempts per 5 minutes
      toast({
        title: "Too Many Attempts",
        description: "Please wait before submitting again.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate inputs
    const nameValidation = validateInput(formData.name, 2, 100);
    if (!nameValidation.isValid) {
      toast({
        title: "Invalid Name",
        description: nameValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isValidPhone(formData.phone)) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      });
      return;
    }
    
    // Sanitize form data
    const sanitizedData = sanitizeFormData(formData);
    
    createLeadMutation.mutate({
      ...sanitizedData,
      message: 'Master Catalogue Download Request',
      source: 'homepage_catalogue'
    });
    
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '/Uploads/T VANAMM MASTER CATALOUGE.pdf'; 
    link.download = 'T-VANAMM-Master-Catalogue-2025.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setFormData({ name: '', email: '', phone: '' });
  };

  const benefits = [
    'Complete product specifications & pricing',
    'Wholesale rates & bulk order discounts',
    'Franchise investment opportunities',
    'Quality certifications & sourcing details',
    'Seasonal offers & promotional materials',
    'Technical support & training resources'
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Download Our Master Catalogue 2025
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get instant access to our comprehensive product catalogue featuring premium teas, 
            wholesale pricing, and complete franchise information.
          </p>
        </div>

        <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-primary/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left side - Form */}
            <div className="p-8 lg:p-12">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  What's Inside Our Catalogue?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone"
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="h-11"
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="brand"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={createLeadMutation.isPending}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {createLeadMutation.isPending ? 'Preparing Download...' : 'Download Master Catalogue'}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  * We respect your privacy. Your information is secure and will only be used to send you the catalogue and relevant updates.
                </p>
              </form>
            </div>

            {/* Right side - Image */}
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/20 p-8 lg:p-12 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-4">
                  <img 
                    src={masterCatalogueImage} 
                    alt="T VANAMM Master Catalogue 2025" 
                    className="w-64 h-80 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    2025 Edition
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <div className="text-xs text-muted-foreground">100+ Products</div>
                <div className="text-sm font-bold text-foreground">Premium Quality</div>
              </div>
              
              <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <div className="text-xs text-muted-foreground">Free Download</div>
                <div className="text-sm font-bold text-primary">Instant Access</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MasterCatalogueSection;