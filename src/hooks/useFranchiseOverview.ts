import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFranchiseOverview = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['franchise-overview', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get franchise member's TVANAMM ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('tvanamm_id')
        .eq('user_id', user.id)
        .single();
      
      if (!profile?.tvanamm_id) return null;
      
      // Get orders for this franchise member
      const { data: ordersData, count: totalOrders } = await supabase
        .from('orders')
        .select('final_amount, created_at', { count: 'exact' })
        .eq('user_id', user.id);
      
      // Calculate this month's orders
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const thisMonthOrders = ordersData?.filter(order => 
        new Date(order.created_at) >= thisMonth
      ) || [];
      
      const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => 
        sum + Number(order.final_amount), 0
      );
      
      // Get pending orders count
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed', 'packed', 'shipped']);
      
      return {
        totalOrders: totalOrders || 0,
        thisMonthRevenue,
        pendingOrders: pendingOrders || 0
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });
};

export const useFranchiseRecentActivity = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['franchise-recent-activity', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('order_number, status, created_at, final_amount')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      // Get recent loyalty transactions
      const { data: transactions } = await supabase
        .from('loyalty_transactions')
        .select('points, type, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      const activities = [
        ...(orders?.map(order => ({
          type: 'order',
          description: `Order ${order.order_number} - ${order.status}`,
          time: order.created_at,
          amount: order.final_amount
        })) || []),
        ...(transactions?.map(transaction => ({
          type: 'loyalty',
          description: transaction.description || `${transaction.points} points ${transaction.type}`,
          time: transaction.created_at,
          points: transaction.points
        })) || [])
      ];
      
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);
    },
    enabled: !!user,
    refetchInterval: 15000, // Real-time updates every 15 seconds
  });
};