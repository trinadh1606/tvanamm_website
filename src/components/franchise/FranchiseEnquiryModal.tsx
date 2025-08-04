import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCreateLead } from '@/hooks/useLeads';
import { sanitizeFormData, validateInput, isValidEmail, isValidPhone, rateLimitTracker } from '@/utils/security';

interface FranchiseEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FranchiseEnquiryModal: React.FC<FranchiseEnquiryModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: ''
  });
  
  const { toast } = useToast();
  const createLead = useCreateLead();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side rate limiting
    if (!rateLimitTracker.canAttempt('franchise-enquiry', 2, 600000)) { // 2 attempts per 10 minutes
      toast({
        title: "Too Many Attempts",
        description: "Please wait before submitting another enquiry.",
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
    
    const cityValidation = validateInput(formData.city, 2, 50);
    if (!cityValidation.isValid) {
      toast({
        title: "Invalid City",
        description: cityValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Sanitize form data
      const sanitizedData = sanitizeFormData(formData);
      
      await createLead.mutateAsync({
        ...sanitizedData,
        source: 'franchise_enquiry'
      });
      
      // Reset form and close modal
      setFormData({ name: '', email: '', phone: '', city: '', message: '' });
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Your Franchise Journey</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
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
              placeholder="Enter your email"
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

          <div className="space-y-2">
            <Label htmlFor="message">Brief Message (Optional)</Label>
            <Input
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Brief message about your interest"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              disabled={createLead.isPending}
              className="flex-1"
            >
              {createLead.isPending ? 'Submitting...' : 'Submit Enquiry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FranchiseEnquiryModal;