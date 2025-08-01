import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Coins, TrendingUp, Clock, Star } from 'lucide-react';
import { useLoyaltyPoints, useLoyaltyTransactions } from '@/hooks/useLoyalty';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const FranchiseLoyaltyPage = () => {
  const queryClient = useQueryClient();
  const { data: loyaltyPoints, isLoading: pointsLoading } = useLoyaltyPoints();
  const { data: transactions, isLoading: transactionsLoading } = useLoyaltyTransactions();

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('loyalty_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_points'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_transactions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'redeemed':
        return <Star className="h-4 w-4 text-blue-600" />;
      default:
        return <Coins className="h-4 w-4 text-primary" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'text-green-600';
      case 'redeemed':
        return 'text-blue-600';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Loyalty Points</h1>
          <p className="text-muted-foreground">Track your loyalty points and transaction history</p>
        </div>
      </div>

      {/* Loyalty Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {pointsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">
                  {loyaltyPoints?.current_balance?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available for use
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {pointsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {loyaltyPoints?.total_lifetime_points?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime earnings
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redeemed</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {pointsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  {loyaltyPoints?.points_redeemed?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Points used
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {transactionsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between items-center p-3 rounded-lg border">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-5 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.description || `Points ${transaction.type}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'earned' ? '+' : ''}
                        {transaction.points.toLocaleString()} pts
                      </p>
                      <Badge 
                        variant={transaction.type === 'earned' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Start ordering to earn loyalty points!</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseLoyaltyPage;