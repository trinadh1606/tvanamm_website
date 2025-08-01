import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Coins, Truck, Coffee, Check, X } from 'lucide-react';
import { useLoyaltyPoints } from '@/hooks/useLoyalty';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SimpleLoyaltyCheckoutProps {
  orderTotal: number;
  onRewardSelected: (reward: { type: 'delivery' | 'tea_cups' | null; pointsUsed: number; description: string }) => void;
}

export default function SimpleLoyaltyCheckout({ 
  orderTotal, 
  onRewardSelected 
}: SimpleLoyaltyCheckoutProps) {
  const { user } = useAuth();
  const { data: loyaltyPoints, isLoading: pointsLoading } = useLoyaltyPoints();
  const [selectedReward, setSelectedReward] = useState<string>('none');
  const [isApplying, setIsApplying] = useState(false);
  const [appliedReward, setAppliedReward] = useState<any>(null);

  const currentBalance = loyaltyPoints?.current_balance || 0;

  // Fixed loyalty options
  const loyaltyOptions = [
    {
      id: 'none',
      type: null,
      name: 'No Reward',
      description: 'Continue without using loyalty points',
      pointsCost: 0,
      icon: X,
      available: true
    },
    {
      id: 'delivery',
      type: 'delivery',
      name: 'Free Delivery',
      description: 'Get free delivery on this order',
      pointsCost: 100,
      icon: Truck,
      available: currentBalance >= 100
    },
    {
      id: 'tea_cups',
      type: 'tea_cups',
      name: '30 Tea Cups',
      description: 'Get 30 premium tea cups delivered with your order',
      pointsCost: 500,
      icon: Coffee,
      available: currentBalance >= 500
    }
  ];

  const handleApplyReward = async () => {
    const selectedOption = loyaltyOptions.find(opt => opt.id === selectedReward);
    if (!selectedOption || selectedOption.type === null) {
      // Clear any existing reward
      setAppliedReward(null);
      onRewardSelected({ type: null, pointsUsed: 0, description: '' });
      return;
    }

    if (!selectedOption.available) {
      toast.error('Insufficient points for this reward');
      return;
    }

    setIsApplying(true);
    try {
      // For now, we'll just track the selection locally
      // Points will be deducted when the actual order is placed
      setAppliedReward(selectedOption);
      onRewardSelected({
        type: selectedOption.type as 'delivery' | 'tea_cups',
        pointsUsed: selectedOption.pointsCost,
        description: selectedOption.name
      });
      toast.success(`${selectedOption.name} selected!`);
    } catch (error: any) {
      toast.error('Failed to select reward');
    } finally {
      setIsApplying(false);
    }
  };

  const clearReward = () => {
    setSelectedReward('none');
    setAppliedReward(null);
    onRewardSelected({ type: null, pointsUsed: 0, description: '' });
    toast.success('Reward removed');
  };

  if (pointsLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Loading Loyalty Rewards...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Loyalty Rewards
          </div>
          <Badge variant="outline" className="text-primary">
            {currentBalance} points available
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {appliedReward ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {appliedReward.name} selected!
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearReward}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {appliedReward.pointsCost} points will be deducted
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <RadioGroup value={selectedReward} onValueChange={setSelectedReward}>
              {loyaltyOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 p-4 border rounded-lg transition-all ${
                      selectedReward === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    } ${
                      !option.available && option.type !== null ? 'opacity-50' : ''
                    }`}
                  >
                    <RadioGroupItem 
                      value={option.id} 
                      id={option.id}
                      disabled={!option.available && option.type !== null}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        selectedReward === option.id ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Label 
                          htmlFor={option.id} 
                          className="font-medium cursor-pointer"
                        >
                          {option.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                        {option.pointsCost > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={option.available ? "outline" : "secondary"}
                              className="text-xs"
                            >
                              {option.pointsCost} points
                            </Badge>
                            {!option.available && (
                              <span className="text-xs text-destructive">
                                Need {option.pointsCost - currentBalance} more points
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            <Button 
              onClick={handleApplyReward}
              disabled={isApplying}
              className="w-full"
            >
              {isApplying ? 'Applying...' : 'Apply Selection'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}