import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  DollarSign, 
  Award, 
  HeadphonesIcon,
  Calculator,
  FileText
} from 'lucide-react';
import { useCreateLead } from '@/hooks/useLeads';

const FranchiseInfoSection = () => {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isROICalculatorOpen, setIsROICalculatorOpen] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: ''
  });
  
  const [roiInputs, setRoiInputs] = useState({
    investment: 500000,
    monthly_sales: 150000
  });

  const createLeadMutation = useCreateLead();

  const benefits = [
    {
      icon: TrendingUp,
      title: 'High ROI Potential',
      description: 'Average returns of 25-30% annually with proper execution'
    },
    {
      icon: Users,
      title: 'Growing Market',
      description: 'Tea consumption in India grows at 8% annually'
    },
    {
      icon: MapPin,
      title: 'Territory Protection',
      description: 'Exclusive territory rights with population-based mapping'
    },
    {
      icon: Award,
      title: 'Brand Recognition',
      description: 'Established brand with 15+ years of market presence'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Complete business support from setup to operations'
    },
    {
      icon: DollarSign,
      title: 'Low Investment',
      description: 'Start your franchise with investment as low as ₹3 Lakhs'
    }
  ];

  const investmentTiers = [
    {
      type: 'Mini Franchise',
      investment: '₹3-5 Lakhs',
      area: '200-500 sq ft',
      population: '50K-1L',
      roi: '25-30%',
      features: ['Basic inventory', 'Marketing support', 'Training included']
    },
    {
      type: 'Standard Franchise',
      investment: '₹5-10 Lakhs',
      area: '500-1000 sq ft',
      population: '1-3L',
      roi: '30-35%',
      features: ['Premium inventory', 'Advanced marketing', 'Ongoing support']
    },
    {
      type: 'Premium Franchise',
      investment: '₹10-20 Lakhs',
      area: '1000+ sq ft',
      population: '3L+',
      roi: '35-40%',
      features: ['Complete setup', 'Premium branding', 'Dedicated support']
    }
  ];

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
    setApplicationForm({
      name: '',
      email: '',
      phone: '',
      city: '',
      message: ''
    });
  };

  const calculateROI = () => {
    const monthlyProfit = roiInputs.monthly_sales * 0.20; // Assuming 20% profit margin
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
              Join India's fastest-growing tea franchise network and build a profitable business 
              in the ever-expanding tea market
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Investment Tiers */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground text-center mb-8">
              Choose Your Investment Level
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {investmentTiers.map((tier, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-all">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl text-foreground">
                      {tier.type}
                    </CardTitle>
                    <div className="text-2xl font-bold text-primary">
                      {tier.investment}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Area:</span>
                        <div className="font-semibold">{tier.area}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Population:</span>
                        <div className="font-semibold">{tier.population}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary" className="text-sm">
                        Expected ROI: {tier.roi}
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
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
              Free consultation available • Territory mapping • Business plan assistance
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