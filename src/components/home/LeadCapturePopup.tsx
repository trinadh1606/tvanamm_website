import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Download } from 'lucide-react';
import { useCreateLead } from '@/hooks/useLeads';
import { sanitizeFormData, validateInput, isValidEmail, rateLimitTracker } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';
import masterCatalogueImage from '@/assets/master-catalogue-2025.jpg';

const LeadCapturePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const createLeadMutation = useCreateLead();
  const { toast } = useToast();

  useEffect(() => {
    // Show popup after 5 seconds if not shown before in this session
    const hasShownPopup = sessionStorage.getItem('leadPopupShown');
    
    if (!hasShownPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('leadPopupShown', 'true');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side rate limiting
    if (!rateLimitTracker.canAttempt('lead-capture', 3, 300000)) { // 3 attempts per 5 minutes
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
    
    // Sanitize form data
    const sanitizedData = sanitizeFormData(formData);
    
    createLeadMutation.mutate({
      ...sanitizedData,
      source: 'catalogue_download'
    });
    
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '/path-to-master-catalogue.pdf'; // Replace with actual PDF path
    link.download = 'T-VANAMM-Master-Catalogue-2025.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsOpen(false);
    setFormData({ name: '', email: '', phone: '', message: '' });
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
            Download Our Master Catalogue 2025
          </DialogTitle>
        </DialogHeader>
        
        <div>
          
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
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any specific interests or questions?"
                rows={3}
              />
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="w-full sm:w-32 flex-shrink-0">
                <img 
                  src={masterCatalogueImage} 
                  alt="Master Catalogue 2025" 
                  className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-lg mx-auto"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Comprehensive Product Guide
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Get access to our complete 2025 Master Catalogue featuring:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-6">
                  <li>• Premium tea varieties & specifications</li>
                  <li>• Wholesale pricing & package details</li>
                  <li>• Franchise opportunities & investment info</li>
                  <li>• Quality certifications & sourcing details</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 w-full sm:w-auto"
                disabled={createLeadMutation.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                {createLeadMutation.isPending ? 'Downloading...' : 'Download Now'}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCapturePopup;