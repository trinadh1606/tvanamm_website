import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateLead } from '@/hooks/useLeads';
import { sanitizeFormData, validateInput, isValidEmail, rateLimitTracker } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

const LeadCapturePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: ''
  });

  const createLeadMutation = useCreateLead();
  const { toast } = useToast();

  useEffect(() => {
    const hasShownPopup = sessionStorage.getItem('leadPopupShown');
    if (!hasShownPopup) {
      setIsOpen(true); // Show immediately on load
      sessionStorage.setItem('leadPopupShown', 'true');
    }
  }, []);

  // Basic phone validation (allows +, spaces, dashes, parentheses; 7–15 digits total)
  const isValidPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side rate limiting
    if (!rateLimitTracker.canAttempt('lead-capture', 3, 300000)) {
      toast({
        title: 'Too Many Attempts',
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
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number (7–15 digits).',
        variant: 'destructive'
      });
      return;
    }

    // Email is optional; validate only if present
    if (formData.email && !isValidEmail(formData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    // Sanitize and send
    const sanitizedData = sanitizeFormData(formData);

    createLeadMutation.mutate(
      {
        ...sanitizedData,
        source: 'lead_popup'
      },
      {
        onSuccess: () => {
          toast({
            title: 'Thanks!',
            description: 'Your message has been sent. Our team will reach out soon.'
          });
          setIsOpen(false);
          setFormData({ name: '', email: '', phone: '', city: '', message: '' });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Reach Us
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              autoComplete="tel"
              inputMode="tel"
            />
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="Which city are you in?"
              autoComplete="address-level2"
            />
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us a bit about your need"
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 w-full sm:w-auto"
              disabled={createLeadMutation.isPending}
            >
              {createLeadMutation.isPending ? 'Sending...' : 'Send'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsOpen(false)}
            >
              Maybe Later
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCapturePopup;
