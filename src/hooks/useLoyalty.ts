import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useLoyaltyPoints = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['loyalty-points', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useLoyaltyTransactions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['loyalty-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useLoyaltyRedemptionOptions = () => {
  return useQuery({
    queryKey: ['loyalty-redemption-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_gifts')
        .select('*')
        .order('points_required');
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Real-time updates
  });
};

export const useFranchiseLoyalty = () => {
  return useQuery({
    queryKey: ['franchise-loyalty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          tvanamm_id,
          full_name,
          email,
          role
        `)
        .eq('role', 'franchise')
        .eq('is_verified', true);
      
      if (error) throw error;
      return data?.map(profile => ({
        id: profile.user_id,
        business_name: `TVANAMM ${profile.tvanamm_id}`,
        member_count: 1,
        total_points: 0,
        lifetime_points: 0,
        member_details: {
          full_name: profile.full_name,
          points: 0,
          lifetime_points: 0,
        }
      })) || [];
    }
  });
};

export const useManualLoyaltyAdjustment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, points, description }: {
      userId: string;
      points: number;
      description: string;
    }) => {
      // Update loyalty points
      const { data: currentPoints, error: fetchError } = await supabase
        .from('loyalty_points')
        .select('current_balance, points_earned, points_redeemed, total_lifetime_points')
        .eq('user_id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newBalance = currentPoints.current_balance + points;
      
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({ 
          current_balance: newBalance,
          points_earned: points > 0 ? (currentPoints.points_earned || 0) + points : (currentPoints.points_earned || 0),
          points_redeemed: points < 0 ? (currentPoints.points_redeemed || 0) + Math.abs(points) : (currentPoints.points_redeemed || 0),
          total_lifetime_points: points > 0 ? (currentPoints.total_lifetime_points || 0) + points : (currentPoints.total_lifetime_points || 0)
        })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: userId,
          points,
          type: points > 0 ? 'earned' : 'redeemed',
          description
        });
      
      if (transactionError) throw transactionError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
      toast.success('Loyalty points adjusted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to adjust points: ${error.message}`);
    }
  });
};

export const useRedeemLoyaltyPoints = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ optionId, points, shippingAddress }: {
      optionId: string;
      points: number;
      shippingAddress?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Check if user has enough points
      const { data: userPoints, error: pointsError } = await supabase
        .from('loyalty_points')
        .select('current_balance')
        .eq('user_id', user.id)
        .single();
      
      if (pointsError) throw pointsError;
      if (userPoints.current_balance < points) {
        throw new Error('Insufficient points');
      }
      
      // Create gift redemption
      const { error: redemptionError } = await supabase
        .from('gift_redemptions')
        .insert({
          user_id: user.id,
          gift_id: optionId,
          points_used: points,
          shipping_address: shippingAddress,
          status: 'pending'
        });
      
      if (redemptionError) throw redemptionError;
      
      // Update user points
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({ 
          current_balance: userPoints.current_balance - points,
          points_redeemed: userPoints.current_balance + points
        })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: user.id,
          points: -points,
          type: 'redeemed',
          description: `Gift redemption: ${optionId}`
        });
      
      if (transactionError) throw transactionError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
      toast.success('Points redeemed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to redeem points: ${error.message}`);
    }
  });
};

export const useUpdateLoyaltyGift = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      description?: string;
      points_required?: number;
      stock_quantity?: number;
      is_active?: boolean;
      image_url?: string;
    }) => {
      const { data, error } = await supabase
        .from('loyalty_gifts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-redemption-options'] });
      toast.success('Loyalty gift updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update gift: ${error.message}`);
    }
  });
};