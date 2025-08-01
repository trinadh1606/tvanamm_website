import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const useRealTimeOrders = (searchTerm?: string, statusFilter?: string) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('orders_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order change:', payload);
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          
          // Show notification for order status changes
          if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
            const newOrder = payload.new as any;
            const oldOrder = payload.old as any;
            
            if (newOrder.status !== oldOrder.status) {
              toast.success(`Order ${newOrder.order_number} status updated to ${newOrder.status}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['orders', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name,
              sku
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('order_number', `%${searchTerm}%`);
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data: orders, error } = await query;
      
      if (error) throw error;

      // Fetch user profiles separately for orders that have user_id
      if (orders && orders.length > 0) {
        const userIds = [...new Set(orders.map(order => order.user_id).filter(Boolean))];
        
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, full_name, email, phone')
            .in('user_id', userIds);

          if (profilesError) {
            console.warn('Error fetching profiles:', profilesError);
          } else {
            // Attach profile data to orders
            const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
            orders.forEach((order: any) => {
              order.profiles = profileMap.get(order.user_id) || null;
            });
          }
        }
      }

      return orders;
    },
    refetchInterval: 15000, // Refetch every 15 seconds
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      notes 
    }: {
      orderId: string;
      status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
      notes?: string;
    }) => {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      // Add timestamps and user tracking for specific statuses
      switch (status) {
        case 'packed':
          updates.packed_at = new Date().toISOString();
          updates.packed_by = user?.id;
          break;
        case 'shipped':
          updates.shipped_at = new Date().toISOString();
          updates.shipped_by = user?.id;
          break;
        case 'delivered':
          updates.delivered_at = new Date().toISOString();
          break;
      }

      if (notes) {
        updates.notes = notes;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Order ${data.order_number} status updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    }
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
      loyaltyReward
    }: {
      items: Array<{
        product_id: string;
        quantity: number;
        unit_price: number;
      }>;
      shippingAddress: any;
      billingAddress?: any;
      paymentMethod: string;
      notes?: string;
      loyaltyReward?: {
        type: 'delivery' | 'tea_cups' | null;
        pointsUsed: number;
        description: string;
      };
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Calculate totals
      const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      const deliveryFee = loyaltyReward?.type === 'delivery' ? 0 : 50; // Free delivery if loyalty reward
      const finalAmount = totalAmount + deliveryFee;

      // Generate order number
      const { data: orderNumber } = await supabase.rpc('generate_order_number');

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total_amount: totalAmount,
          delivery_fee: deliveryFee,
          final_amount: finalAmount,
          shipping_address: shippingAddress,
          billing_address: billingAddress || shippingAddress,
          payment_method: paymentMethod,
          notes: notes,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Handle loyalty reward if selected
      if (loyaltyReward && loyaltyReward.type && loyaltyReward.pointsUsed > 0) {
        if (loyaltyReward.type === 'tea_cups') {
          // Create gift redemption for tea cups
          const { error: giftError } = await supabase.rpc('handle_loyalty_redemption', {
            p_user_id: user.id,
            p_points_to_redeem: loyaltyReward.pointsUsed,
            p_order_id: order.id,
            p_gift_id: null // We'll need to create a special tea cups gift or handle this differently
          });
          if (giftError) throw giftError;
        } else if (loyaltyReward.type === 'delivery') {
          // Create delivery voucher redemption
          const { error: voucherError } = await supabase.rpc('use_delivery_voucher', {
            p_user_id: user.id,
            p_order_id: order.id,
            p_points_used: loyaltyReward.pointsUsed
          });
          if (voucherError) throw voucherError;
        }
      }

      return order;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
      toast.success(`Order ${data.order_number} created successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create order: ${error.message}`);
    }
  });
};