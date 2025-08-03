import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useAnalytics = () => {
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel('analytics-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
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
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      // Get total revenue from orders
      const { data: revenueData } = await supabase
        .from('orders')
        .select('final_amount')
        .eq('payment_status', 'completed');
      
      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.final_amount), 0) || 0;
      
      // Get total orders count
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      // Get active franchises count from profiles (users with franchise role)
      const { count: activeFranchises } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'franchise')
        .eq('is_verified', true);
      
      return {
        totalRevenue,
        totalOrders: totalOrders || 0,
        activeFranchises: activeFranchises || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 60000, // Refetch every 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
};

export const useSalesTrend = () => {
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel('sales-trend-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['sales-trend'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['sales-trend'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, final_amount')
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by month and calculate totals
      const monthlyData = data.reduce((acc, order) => {
        const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
        if (!acc[month]) acc[month] = 0;
        acc[month] += Number(order.final_amount);
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
  });
};

export const useProductDistribution = () => {
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for order_items
  useEffect(() => {
    const channel = supabase
      .channel('product-distribution-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['product-distribution'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['product-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          quantity,
          products (
            name,
            categories (
              name
            )
          )
        `);
      
      if (error) throw error;
      
      // Group by category and sum quantities
      const categoryData = data.reduce((acc, item) => {
        const categoryName = item.products?.categories?.name || 'Other';
        if (!acc[categoryName]) acc[categoryName] = 0;
        acc[categoryName] += item.quantity;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(categoryData).map(([name, quantity]) => ({
        name,
        quantity
      }));
    },
    staleTime: 15 * 60 * 1000, // 15 minutes cache
    refetchOnWindowFocus: false,
  });
};

export const useOrderStatusDistribution = () => {
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel('order-status-distribution-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['order-status-distribution'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['order-status-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status');
      
      if (error) throw error;
      
      // Group by status and count
      const statusData = data.reduce((acc, order) => {
        const status = order.status || 'pending';
        if (!acc[status]) acc[status] = 0;
        acc[status] += 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(statusData).map(([status, count]) => ({
        status,
        count,
        name: status.charAt(0).toUpperCase() + status.slice(1)
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
};

export const useRecentActivities = () => {
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel('recent-activities-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          final_amount,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map(order => ({
        id: order.id,
        type: 'Order',
        description: `Order ${order.order_number}`,
        amount: order.final_amount,
        status: order.status,
        time: order.created_at
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnWindowFocus: false,
  });
};