import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const usePackingItems = (orderId: string) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for packing items
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`packing_items_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'packing_items',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['packing-items', orderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  return useQuery({
    queryKey: ['packing-items', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packing_items')
        .select(`
          *,
          products (
            name,
            images,
            sku
          )
        `)
        .eq('order_id', orderId)
        .order('created_at');

      if (error) throw error;
      return data;
    },
    enabled: !!orderId
  });
};

export const useUpdatePackingItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      packedQuantity, 
      isPacked, 
      notes 
    }: { 
      itemId: string;
      packedQuantity?: number;
      isPacked?: boolean;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {};
      
      if (packedQuantity !== undefined) updateData.packed_quantity = packedQuantity;
      if (isPacked !== undefined) {
        updateData.is_packed = isPacked;
        if (isPacked) {
          updateData.packed_at = new Date().toISOString();
          updateData.packed_by = user.id;
        }
      }
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('packing_items')
        .update(updateData)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing-items'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update packing item');
    }
  });
};

export const useStartPacking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data: order, error } = await supabase
        .from('orders')
        .update({
          status: 'packing' as any,
          packing_started_at: new Date().toISOString(),
          packing_started_by: user.id
        })
        .eq('id', orderId)
        .select('*, profiles!user_id(*)')
        .single();

      if (error) throw error;

      // Create notification for franchise member
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: order.user_id,
          title: 'Order Being Packed',
          message: `Your order #${order.order_number} is now being packed. You'll be notified when it's ready for shipping.`,
          type: 'order',
          data: { 
            order_id: order.id, 
            order_number: order.order_number,
            status: 'packing'
          }
        });

      if (notificationError) console.warn('Failed to create notification:', notificationError);

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Started packing order #${order.order_number}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start packing');
    }
  });
};

export const useCompletePacking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, notes }: { orderId: string; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: order, error } = await supabase
        .from('orders')
        .update({
          status: 'packed',
          packing_completed_at: new Date().toISOString(),
          packing_notes: notes
        })
        .eq('id', orderId)
        .select('*, profiles!user_id(*)')
        .single();

      if (error) throw error;

      // Create notification for franchise member
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: order.user_id,
          title: 'Order Packed',
          message: `Your order #${order.order_number} has been packed and is ready for shipping.`,
          type: 'order',
          data: { 
            order_id: order.id, 
            order_number: order.order_number,
            status: 'packed'
          }
        });

      if (notificationError) console.warn('Failed to create notification:', notificationError);

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['packing-items'] });
      toast.success(`Order #${order.order_number} packed successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete packing');
    }
  });
};

export const useShipOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      trackingNumber, 
      courierPartner,
      additionalInfo 
    }: { 
      orderId: string;
      trackingNumber: string;
      courierPartner: string;
      additionalInfo?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const trackingInfo = {
        tracking_number: trackingNumber,
        courier_partner: courierPartner,
        shipped_date: new Date().toISOString(),
        ...additionalInfo
      };

      const { data: order, error } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          shipped_at: new Date().toISOString(),
          shipped_by: user.id,
          tracking_info: trackingInfo
        })
        .eq('id', orderId)
        .select('*, profiles!user_id(*)')
        .single();

      if (error) throw error;

      // Create notification for franchise member
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: order.user_id,
          title: 'Order Shipped',
          message: `Your order #${order.order_number} has been shipped via ${courierPartner}. Tracking number: ${trackingNumber}`,
          type: 'order',
          data: { 
            order_id: order.id, 
            order_number: order.order_number,
            tracking_number: trackingNumber,
            courier_partner: courierPartner,
            status: 'shipped'
          }
        });

      if (notificationError) console.warn('Failed to create notification:', notificationError);

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Order #${order.order_number} shipped successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to ship order');
    }
  });
};