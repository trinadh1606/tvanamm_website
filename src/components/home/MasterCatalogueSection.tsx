import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, CheckCircle } from 'lucide-react';
import { useCreateLead } from '@/hooks/useLeads';
import { sanitizeFormData, validateInput, isValidEmail, isValidPhone, rateLimitTracker } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

const MasterCatalogueSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    email: ''
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

    // Client-side rate limiting: 3 attempts / 5 minutes
    if (!rateLimitTracker.canAttempt('contact-us', 3, 300000)) {
      toast({
        title: 'Too many attempts',
        description: 'Please wait a few minutes before submitting again.',
        variant: 'destructive'
      });
      return;
    }

    // Validate required fields
    const nameValidation = validateInput(formData.name, 2, 100);
    if (!nameValidation.isValid) {
      toast({ title: 'Invalid Name', description: nameValidation.error, variant: 'destructive' });
      return;
    }

    const cityValidation = validateInput(formData.city, 2, 100);
    if (!cityValidation.isValid) {
      toast({ title: 'Invalid City', description: cityValidation.error, variant: 'destructive' });
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast({ title: 'Invalid Phone', description: 'Please enter a valid phone number.', variant: 'destructive' });
      return;
    }

    // Email is optional — only validate if provided
    if (formData.email && !isValidEmail(formData.email)) {
      toast({ title: 'Invalid Email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    const sanitizedData = sanitizeFormData(formData);

    createLeadMutation.mutate(
      {
        ...sanitizedData,
        message: 'Reach Us / Contact Request',
        source: 'homepage_contact'
      },
      {
        onSuccess: () => {
          toast({
            title: 'Thanks! We’ve received your details.',
            description: 'Our team will reach out shortly.',
            variant: 'default'
          });
          setFormData({ name: '', phone: '', city: '', email: '' });
        },
        onError: () => {
          toast({
            title: 'Something went wrong',
            description: 'Please try again in a moment.',
            variant: 'destructive'
          });
        }
      }
    );
  };

  const reasons = [
    'Franchise & partnership enquiries',
    'Bulk / wholesale orders',
    'Menu & pricing clarifications',
    'Support & training assistance',
    'Custom requirements & events'
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Reach Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tell us a bit about you and what you’re looking for. We’ll get back within business hours.
          </p>
        </div>

        <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-primary/10">
          <div className="p-8 lg:p-12">
            {/* Why contact us */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-foreground mb-3">How can we help?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    className="h-11"
                    aria-invalid={!formData.name ? undefined : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 98XXXXXXXX"
                    required
                    className="h-11"
                    pattern="[0-9+\-\s()]{7,15}"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Your city"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email (optional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="h-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                disabled={createLeadMutation.isPending}
              >
                <Send className="w-5 h-5 mr-2" />
                {createLeadMutation.isPending ? 'Submitting…' : 'Send Request'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                * We respect your privacy. Your information is secure and used only to contact you back.
              </p>
            </form>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MasterCatalogueSection;
