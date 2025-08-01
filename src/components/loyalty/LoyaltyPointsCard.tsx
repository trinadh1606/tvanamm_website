import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Star, Gift, TrendingUp, Clock, Award } from 'lucide-react';
import { useLoyaltyPoints, useLoyaltyTransactions } from '@/hooks/useLoyalty';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const LoyaltyPointsCard = () => {
  const { user } = useAuth();
  const { data: loyaltyPoints, isLoading: pointsLoading } = useLoyaltyPoints();
  const { data: transactions, isLoading: transactionsLoading } = useLoyaltyTransactions();
  const [tvanammId, setTvanammId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTvanammId = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('tvanamm_id')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.tvanamm_id) {
        setTvanammId(profile.tvanamm_id);
      }
    };

    fetchTvanammId();
  }, [user]);

  // Real-time subscription for loyalty updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('loyalty-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_points',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          toast.success('Loyalty points updated!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!tvanammId) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Award className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
            <p>Loyalty points are available for franchise members only.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pointsLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentBalance = loyaltyPoints?.current_balance || 0;
  const totalEarned = loyaltyPoints?.total_lifetime_points || 0;
  const totalRedeemed = loyaltyPoints?.points_redeemed || 0;
  const isGiftEligible = currentBalance >= 500;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-primary" />
          Loyalty Points
          <Badge variant="secondary" className="ml-auto">
            TVANAMM {tvanammId}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {currentBalance.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Current Points</p>
          {isGiftEligible && (
            <Badge variant="default" className="mt-2 bg-primary text-primary-foreground">
              <Gift className="h-3 w-3 mr-1" />
              Gift Eligible
            </Badge>
          )}
        </div>

        <Separator />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-semibold text-foreground">
              {totalEarned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-foreground">
              {totalRedeemed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Redeemed</p>
          </div>
        </div>

        {/* Transaction History Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              View Transaction History
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Transaction History
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-96">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between items-start p-3 rounded-lg border">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="h-5 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions?.length ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-start p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                      <Badge
                        variant={transaction.type === 'earned' ? 'default' : 'secondary'}
                        className={
                          transaction.type === 'earned'
                            ? 'bg-primary text-primary-foreground'
                            : ''
                        }
                      >
                        {transaction.type === 'earned' ? '+' : ''}
                        {transaction.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-xs">Start making orders to earn points!</p>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Earning Info */}
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Earn 20 points on orders ≥ ₹5,000 when delivered
          </p>
          <p className="text-xs text-muted-foreground">
            1 point = ₹1 discount • 500 points = Premium gifts
          </p>
        </div>
      </CardContent>
    </Card>
  );
};