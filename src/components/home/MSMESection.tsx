import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, Phone, Mail } from 'lucide-react';
import { useCreateLead } from '@/hooks/useLeads';

const MSMESection = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    business_type: '',
    loan_amount: '',
    message: ''
  });

  const createLeadMutation = useCreateLead();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLeadMutation.mutate({
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      message: `MSME/Loan Inquiry: Business Type: ${contactForm.business_type}, Loan Amount: ${contactForm.loan_amount}, Message: ${contactForm.message}`,
      source: 'msme_inquiry'
    });
    setIsContactModalOpen(false);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      business_type: '',
      loan_amount: '',
      message: ''
    });
  };

  return (
    <>
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <Building2 className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              MSME Registered Company
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Our company is MSME registered and provides comprehensive support for getting business loans 
              to help your business grow and thrive.
            </p>
            
            <div className="bg-primary/10 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-3">What We Offer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  MSME Registration Support
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Business Loan Assistance
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Documentation Help
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Government Scheme Guidance
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setIsContactModalOpen(true)}
                className="min-w-[200px]"
              >
                <Mail className="w-4 h-4 mr-2" />
                Get Loan Support
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px]"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call: +91-93906-58544
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Business Loan Support Inquiry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-name">Full Name *</Label>
                <Input
                  id="contact-name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="Your email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-phone">Phone *</Label>
                <Input
                  id="contact-phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  placeholder="Your phone"
                />
              </div>
              <div>
                <Label htmlFor="business-type">Business Type</Label>
                <Input
                  id="business-type"
                  value={contactForm.business_type}
                  onChange={(e) => setContactForm(prev => ({ ...prev, business_type: e.target.value }))}
                  placeholder="e.g., Manufacturing, Trading"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="loan-amount">Required Loan Amount</Label>
              <Input
                id="loan-amount"
                value={contactForm.loan_amount}
                onChange={(e) => setContactForm(prev => ({ ...prev, loan_amount: e.target.value }))}
                placeholder="e.g., ₹10 Lakhs"
              />
            </div>
            <div>
              <Label htmlFor="contact-message">Your Requirements</Label>
              <Textarea
                id="contact-message"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us about your business and loan requirements..."
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={createLeadMutation.isPending}
              >
                {createLeadMutation.isPending ? 'Submitting...' : 'Submit Inquiry'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsContactModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MSMESection;