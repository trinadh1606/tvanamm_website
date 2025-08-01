import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreateOrderData {
  items: Array<{
    id: string;
    name: string;
    basePrice: number; // GST-exclusive price
    price: number; // GST-inclusive price
    quantity: number;
    gstRate: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  subtotal: number;
  gstAmount: number;
  deliveryFee?: number;
  total: number;
  selectedRedemption?: string;
  loyaltyPointsUsed?: number;
  giftId?: string;
}

export const useCreateOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      if (!user) throw new Error('User not authenticated');

      // Check for recent orders to prevent duplicates
      const { data: hasRecentOrder, error: recentOrderError } = await supabase.rpc('check_recent_order', {
        p_user_id: user.id
      });
      
      if (recentOrderError) throw recentOrderError;
      if (hasRecentOrder) throw new Error('Please wait before placing another order');

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase.rpc('generate_order_number');
      if (orderNumberError) throw orderNumberError;

      // Create order with GST breakdown
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumberData,
          shipping_address: orderData.shippingAddress,
          total_amount: orderData.subtotal,
          delivery_fee: orderData.deliveryFee || 0,
          final_amount: orderData.total, // This should already have loyalty discount applied
          status: 'pending',
          payment_status: 'pending',
          notes: orderData.selectedRedemption || `GST Amount: ₹${orderData.gstAmount.toFixed(2)}`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with GST rates
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.basePrice, // Store GST-exclusive base price
        total_price: item.price * item.quantity, // Store GST-inclusive total
        gst_rate: item.gstRate
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Handle loyalty points redemption if applicable
      if (orderData.loyaltyPointsUsed && orderData.loyaltyPointsUsed > 0) {
        const { error: loyaltyError } = await supabase.rpc('handle_loyalty_redemption', {
          p_user_id: user.id,
          p_points_to_redeem: orderData.loyaltyPointsUsed,
          p_order_id: order.id,
          p_gift_id: orderData.giftId || null
        });

        if (loyaltyError) throw loyaltyError;
      }

      // Get admin/owner user IDs and create notifications for them
      const { data: adminUserIds, error: adminError } = await supabase.rpc('get_admin_owner_user_ids');
      if (adminError) console.warn('Failed to get admin user IDs:', adminError);
      
      if (adminUserIds && adminUserIds.length > 0) {
        const notifications = adminUserIds.map((adminUserId: string) => ({
          user_id: adminUserId,
          title: 'New Order Received',
          message: `New order #${order.order_number} from franchise partner. Please review and confirm.`,
          type: 'order' as const,
          data: { 
            order_id: order.id, 
            order_number: order.order_number,
            total_amount: order.final_amount 
          }
        }));

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);
        
        if (notificationError) console.warn('Failed to create notifications:', notificationError);
      }

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
      toast.success(`Order #${order.order_number} placed successfully! Awaiting confirmation.`);
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      toast.error(error.message || 'Failed to create order. Please try again.');
    }
  });
};

export const useConfirmOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, deliveryFee }: { orderId: string; deliveryFee?: number }) => {
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id
      };

      if (deliveryFee !== undefined) {
        updateData.delivery_fee = deliveryFee;
        // Calculate final amount separately since we can't use raw SQL
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('id', orderId)
          .single();
        
        if (currentOrder) {
          // Get the current order to check if loyalty points were used
          const { data: fullOrder } = await supabase
            .from('orders')
            .select('total_amount, final_amount')
            .eq('id', orderId)
            .single();
          
          if (fullOrder) {
            // Calculate the loyalty discount that was already applied
            const loyaltyDiscount = fullOrder.total_amount - fullOrder.final_amount;
            // Apply delivery fee but maintain the loyalty discount
            updateData.final_amount = fullOrder.total_amount + deliveryFee - loyaltyDiscount;
          }
        }
        updateData.delivery_fee_added_by = user.id;
      }

      const { data: order, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select('*')
        .single();

      if (error) throw error;

      // Create notification for franchise member
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: order.user_id,
          title: 'Order Confirmed',
          message: `Your order #${order.order_number} has been confirmed. ${deliveryFee ? `Delivery fee of ₹${deliveryFee} added. ` : ''}Please proceed with payment.`,
          type: 'order',
          data: { 
            order_id: order.id, 
            order_number: order.order_number,
            final_amount: order.final_amount,
            requires_payment: true
          }
        });

      if (notificationError) console.warn('Failed to create notification:', notificationError);

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Order #${order.order_number} confirmed successfully!`);
    },
    onError: (error: any) => {
      console.error('Order confirmation error:', error);
      toast.error(error.message || 'Failed to confirm order. Please try again.');
    }
  });
};