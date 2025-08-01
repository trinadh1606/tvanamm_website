import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useOwnerRecentActivity = () => {
  const query = useQuery({
    queryKey: ['owner-recent-activity'],
    queryFn: async () => {
      // Get recent orders with user info
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      // Get recent user signups (only last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(2);

      // Get recent payment transactions
      const { data: recentPayments } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

      // Get low stock products
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('name, stock_quantity, minimum_stock')
        .lt('stock_quantity', 10)
        .limit(2);

      const activities = [];

      // Add order activities
      if (recentOrders && recentOrders.length > 0) {
        recentOrders.forEach(order => {
          const customerName = order.profiles?.full_name || order.profiles?.email || 'Unknown Customer';
          activities.push({
            type: 'order',
            description: `Order ${order.order_number} (${order.status}) - ${customerName}`,
            timestamp: order.created_at,
            color: order.status === 'delivered' ? 'bg-green-500' : 
                   order.status === 'shipped' ? 'bg-blue-500' : 
                   order.status === 'confirmed' ? 'bg-indigo-500' : 'bg-orange-500'
          });
        });
      }

      // Add user signup activities
      if (recentUsers && recentUsers.length > 0) {
        recentUsers.forEach(user => {
          activities.push({
            type: 'signup',
            description: `New user registered: ${user.full_name || user.email} (${user.role || 'customer'})`,
            timestamp: user.created_at,
            color: 'bg-purple-500'
          });
        });
      }

      // Add payment activities
      if (recentPayments && recentPayments.length > 0) {
        recentPayments.forEach(payment => {
          activities.push({
            type: 'payment',
            description: `Payment ${payment.status}: ₹${payment.amount}`,
            timestamp: payment.created_at,
            color: payment.status === 'completed' ? 'bg-green-500' : 
                   payment.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
          });
        });
      }

      // Add inventory alerts
      if (lowStockProducts && lowStockProducts.length > 0) {
        lowStockProducts.forEach(product => {
          activities.push({
            type: 'inventory',
            description: `Low stock: ${product.name} (${product.stock_quantity}/${product.minimum_stock || 10} units)`,
            timestamp: new Date().toISOString(),
            color: 'bg-red-500'
          });
        });
      }

      // Add fallback activity if no real data
      if (activities.length === 0) {
        activities.push({
          type: 'system',
          description: 'Dashboard initialized - monitoring system activity',
          timestamp: new Date().toISOString(),
          color: 'bg-gray-500'
        });
      }

      // Sort by timestamp and return top 6
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 6);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Set up real-time subscription for updates
  useEffect(() => {
    const channel = supabase
      .channel('owner-activity-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_transactions'
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query]);

  return query;
};