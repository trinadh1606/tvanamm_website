import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  DollarSign, 
  HeadphonesIcon,
  Calculator,
  FileText
} from 'lucide-react';
import { useCreateLead } from '@/hooks/useLeads';

const FranchiseInfoSection = () => {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isROICalculatorOpen, setIsROICalculatorOpen] = useState(false);
  const [applicationForm, setApplicationForm] = useState({ name: '', email: '', phone: '', city: '', message: '' });
  const [roiInputs, setRoiInputs] = useState({ investment: 500000, monthly_sales: 150000 });

  const createLeadMutation = useCreateLead();

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLeadMutation.mutate({
      name: applicationForm.name,
      email: applicationForm.email,
      phone: applicationForm.phone,
      city: applicationForm.city,
      message: `Franchise Application - ${applicationForm.city}: ${applicationForm.message}`,
      source: 'franchise_application'
    });
    setIsApplicationModalOpen(false);
    setApplicationForm({ name: '', email: '', phone: '', city: '', message: '' });
  };

  const calculateROI = () => {
    const monthlyProfit = roiInputs.monthly_sales * 0.20;
    const annualProfit = monthlyProfit * 12;
    const roiPercentage = (annualProfit / roiInputs.investment) * 100;
    return {
      monthlyProfit: monthlyProfit.toFixed(0),
      annualProfit: annualProfit.toFixed(0),
      roiPercentage: roiPercentage.toFixed(1),
      paybackMonths: (roiInputs.investment / monthlyProfit).toFixed(1)
    };
  };

  const roiData = calculateROI();

  return (
    <>
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              T VANAMM Franchise Opportunity
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Partner with a brand that's brewing success across India. From an established business model to robust support, we empower our franchisees to thrive.
            </p>
          </div>

          {/* Why Franchise With Us */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground text-center mb-4">
              Why Franchise with T VANAMM
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Benefit from our proven systems, strong brand equity, and comprehensive training & support designed for your success.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-border hover:shadow-lg transition-all">
                <CardHeader className="text-center">
                  <TrendingUp className="mx-auto mb-2" />
                  <CardTitle className="text-xl">Proven Business Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    90% of our outlets achieve positive cash flow within the first 6 months.
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-border hover:shadow-lg transition-all">
                <CardHeader className="text-center">
                  <HeadphonesIcon className="mx-auto mb-2" />
                  <CardTitle className="text-xl">Full Training & Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive onboarding, operational guidance, and ongoing marketing assistance.
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-border hover:shadow-lg transition-all">
                <CardHeader className="text-center">
                  <MapPin className="mx-auto mb-2" />
                  <CardTitle className="text-xl">Exclusive Territories</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Secure your market with protected franchise territory and local branding strategies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Franchise Highlights */}
          <div className="mb-16 bg-card p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <TrendingUp className="mx-auto" />
                <h4 className="font-semibold">High ROI</h4>
                <p className="text-sm text-muted-foreground">Average returns of 30% annually.</p>
              </div>
              <div className="space-y-2">
                <Users className="mx-auto" />
                <h4 className="font-semibold">Community Growth</h4>
                <p className="text-sm text-muted-foreground">Join a network of passionate franchise partners.</p>
              </div>
              <div className="space-y-2">
                <HeadphonesIcon className="mx-auto" />
                <h4 className="font-semibold">24/7 Support</h4>
                <p className="text-sm text-muted-foreground">Dedicated operations and marketing helpline.</p>
              </div>
              <div className="space-y-2">
                <Calculator className="mx-auto" />
                <h4 className="font-semibold">Technology Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced POS, inventory tracking and analytics dashboard for data-driven decisions.
                </p>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setIsApplicationModalOpen(true)}
                className="min-w-[200px]"
              >
                <FileText className="w-4 h-4 mr-2" />
                Apply for Franchise
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setIsROICalculatorOpen(true)}
                className="min-w-[200px]"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate ROI
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Free consultation • Territory mapping • Custom business plan
            </p>
          </div>
        </div>
      </section>

      {/* Application Modal */}
      <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Franchise Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="app-name">Full Name *</Label>
                <Input
                  id="app-name"
                  value={applicationForm.name}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="app-email">Email *</Label>
                <Input
                  id="app-email"
                  type="email"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="Your email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="app-phone">Phone *</Label>
                <Input
                  id="app-phone"
                  value={applicationForm.phone}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  placeholder="Your phone"
                />
              </div>
              <div>
                <Label htmlFor="app-city">Preferred City *</Label>
                <Input
                  id="app-city"
                  value={applicationForm.city}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, city: e.target.value }))}
                  required
                  placeholder="City name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="app-message">Brief Message (Optional)</Label>
              <Input
                id="app-message"
                value={applicationForm.message}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Brief message about your interest"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createLeadMutation.isPending}
              >
                {createLeadMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsApplicationModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ROI Calculator Modal */}
      <Dialog open={isROICalculatorOpen} onOpenChange={setIsROICalculatorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ROI Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="investment-amount">Initial Investment (₹)</Label>
              <Input
                id="investment-amount"
                type="number"
                value={roiInputs.investment}
                onChange={(e) => setRoiInputs(prev => ({ ...prev, investment: Number(e.target.value) }))}
                placeholder="500000"
              />
            </div>
            <div>
              <Label htmlFor="monthly-sales">Expected Monthly Sales (₹)</Label>
              <Input
                id="monthly-sales"
                type="number"
                value={roiInputs.monthly_sales}
                onChange={(e) => setRoiInputs(prev => ({ ...prev, monthly_sales: Number(e.target.value) }))}
                placeholder="150000"
              />
            </div>
            
            <div className="bg-card p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-foreground">Projected Returns</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Monthly Profit:</span>
                  <div className="font-semibold">₹{roiData.monthlyProfit}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Annual Profit:</span>
                  <div className="font-semibold">₹{roiData.annualProfit}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">ROI %:</span>
                  <div className="font-semibold text-primary">{roiData.roiPercentage}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Payback Period:</span>
                  <div className="font-semibold">{roiData.paybackMonths} months</div>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => {
                setIsROICalculatorOpen(false);
                setIsApplicationModalOpen(true);
              }}
            >
              Apply for Franchise
            </Button>
          </div>
        </DialogContent>
      </Dialog> 
    </>
  );
};

export default FranchiseInfoSection;
