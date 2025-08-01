import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Award, Users, Gift, TrendingUp, Plus, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoyaltyManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [pointsToAdd, setPointsToAdd] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch loyalty data
  const { data: loyaltyData, isLoading } = useQuery({
    queryKey: ['admin-loyalty-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .order('total_lifetime_points', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch recent transactions
  const { data: recentTransactions } = useQuery({
    queryKey: ['admin-loyalty-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-loyalty-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_points'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-loyalty-data'] });
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
          queryClient.invalidateQueries({ queryKey: ['admin-loyalty-transactions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filteredLoyaltyData = loyaltyData?.filter(item =>
    item.tvanamm_id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddPoints = async () => {
    if (!selectedUser || !pointsToAdd || !description) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const points = parseInt(pointsToAdd);
      const tvanammId = loyaltyData?.find(item => item.user_id === selectedUser)?.tvanamm_id;

      if (!tvanammId) {
        toast.error('TVANAMM ID not found for user');
        return;
      }

      const { data, error } = await supabase.rpc('add_loyalty_points_manual', {
        p_tvanamm_id: tvanammId,
        p_points: points,
        p_description: description,
        p_admin_user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      if ((data as any).success) {
        toast.success('Points added successfully');
        setIsAddPointsOpen(false);
        setSelectedUser('');
        setPointsToAdd('');
        setDescription('');
        queryClient.invalidateQueries({ queryKey: ['admin-loyalty-data'] });
        queryClient.invalidateQueries({ queryKey: ['admin-loyalty-transactions'] });
      } else {
        toast.error((data as any).error || 'Failed to add points');
      }
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to add points');
    }
  };

  const totalUsers = loyaltyData?.length || 0;
  const totalPoints = loyaltyData?.reduce((sum, item) => sum + (item.current_balance || 0), 0) || 0;
  const totalEarned = loyaltyData?.reduce((sum, item) => sum + (item.points_earned || 0), 0) || 0;
  const totalRedeemed = loyaltyData?.reduce((sum, item) => sum + (item.points_redeemed || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Loyalty Management</h1>
          <p className="text-muted-foreground mt-2">Manage franchise loyalty program</p>
        </div>
        <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Points
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Loyalty Points</DialogTitle>
              <DialogDescription>
                Manually add or deduct points for a franchise member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select User</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a franchise member" />
                  </SelectTrigger>
                  <SelectContent>
                    {loyaltyData?.map((item) => (
                      <SelectItem key={item.user_id} value={item.user_id}>
                        User {item.tvanamm_id} 
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Points (use negative for deduction)</label>
                <Input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                  placeholder="Enter points amount"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for points adjustment"
                />
              </div>
              <Button onClick={handleAddPoints} className="w-full">
                Add Points
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEarned.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRedeemed.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or TVANAMM ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <div className="grid gap-4">
        {filteredLoyaltyData.length > 0 ? (
          filteredLoyaltyData.map((item) => (
            <Card key={item.user_id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground">User {item.tvanamm_id}</h4>
                    <Badge variant="outline" className="mt-1">
                      {item.tvanamm_id}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold text-foreground">{item.current_balance || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lifetime Points</p>
                    <p className="text-lg font-semibold text-foreground">{item.total_lifetime_points || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Points Redeemed</p>
                    <p className="text-lg font-semibold text-foreground">{item.points_redeemed || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No loyalty members found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest loyalty point activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      User {transaction.tvanamm_id}
                    </p>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points} points
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No recent transactions</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}