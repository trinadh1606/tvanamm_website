import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Enhanced loyalty gifts with edit/disable functionality
export const useEnhancedLoyaltyGifts = () => {
  return useQuery({
    queryKey: ['enhanced-loyalty-gifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_gifts')
        .select('*')
        .order('points_required', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
};

// Update gift details (admin only)
export const useUpdateLoyaltyGift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      giftId, 
      updates 
    }: {
      giftId: string;
      updates: {
        name?: string;
        description?: string;
        points_required?: number;
        stock_quantity?: number;
        is_active?: boolean;
        can_edit?: boolean;
        auto_update_stock?: boolean;
      };
    }) => {
      const { data, error } = await supabase
        .from('loyalty_gifts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', giftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-loyalty-gifts'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-redemption-options'] });
      toast.success('Gift updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update gift: ${error.message}`);
    }
  });
};

// Create new loyalty gift
export const useCreateLoyaltyGift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (giftData: {
      name: string;
      description: string;
      points_required: number;
      stock_quantity: number;
      image_url?: string;
      is_active?: boolean;
      can_edit?: boolean;
      auto_update_stock?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('loyalty_gifts')
        .insert({
          ...giftData,
          is_active: giftData.is_active ?? true,
          can_edit: giftData.can_edit ?? true,
          auto_update_stock: giftData.auto_update_stock ?? true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-loyalty-gifts'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-redemption-options'] });
      toast.success('Gift created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create gift: ${error.message}`);
    }
  });
};

// Enhanced gift redemptions with status management
export const useEnhancedGiftRedemptions = () => {
  return useQuery({
    queryKey: ['enhanced-gift-redemptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_redemptions')
        .select(`
          *,
          loyalty_gifts (
            name,
            description,
            image_url
          ),
          profiles!gift_redemptions_user_id_fkey (
            full_name,
            email,
            tvanamm_id
          ),
          franchises!gift_redemptions_user_id_fkey (
            tvanamm_id,
            contact_person,
            business_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

// Real-time loyalty system hooks
export const useRealTimeLoyaltyData = () => {
  const queryClient = useQueryClient();

  return {
    setupRealtimeSubscriptions: () => {
      const loyaltyPointsChannel = supabase
        .channel('loyalty-points-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'loyalty_points'
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
            queryClient.invalidateQueries({ queryKey: ['franchise-loyalty-stats'] });
          }
        )
        .subscribe();

      const transactionsChannel = supabase
        .channel('loyalty-transactions-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'loyalty_transactions'
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['franchise-loyalty-transactions'] });
          }
        )
        .subscribe();

      const giftsChannel = supabase
        .channel('loyalty-gifts-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'loyalty_gifts'
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['enhanced-loyalty-gifts'] });
            queryClient.invalidateQueries({ queryKey: ['loyalty-redemption-options'] });
          }
        )
        .subscribe();

      const redemptionsChannel = supabase
        .channel('gift-redemptions-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'gift_redemptions'
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['enhanced-gift-redemptions'] });
            queryClient.invalidateQueries({ queryKey: ['gift-redemptions'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(loyaltyPointsChannel);
        supabase.removeChannel(transactionsChannel);
        supabase.removeChannel(giftsChannel);
        supabase.removeChannel(redemptionsChannel);
      };
    }
  };
};

// Adjust gift stock manually
export const useAdjustGiftStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      giftId, 
      newQuantity, 
      reason 
    }: {
      giftId: string;
      newQuantity: number;
      reason: string;
    }) => {
      const { data, error } = await supabase
        .from('loyalty_gifts')
        .update({ 
          stock_quantity: Math.max(0, newQuantity),
          updated_at: new Date().toISOString()
        })
        .eq('id', giftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-loyalty-gifts'] });
      toast.success('Stock updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update stock: ${error.message}`);
    }
  });
};

// Check user delivery voucher availability
export const useUserDeliveryVouchers = (userId?: string) => {
  return useQuery({
    queryKey: ['user-delivery-vouchers', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('voucher_redemptions')
        .select('*')
        .eq('user_id', userId)
        .eq('voucher_type', 'free_delivery')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
};