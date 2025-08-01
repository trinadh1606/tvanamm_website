import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Hook for franchise loyalty statistics
export const useFranchiseLoyaltyStats = () => {
  return useQuery({
    queryKey: ['franchise-loyalty-stats'],
    queryFn: async () => {
      // Get total points issued for franchise members
      const { data: totalIssued, error: issuedError } = await supabase
        .from('loyalty_points')
        .select('total_lifetime_points')
        .not('tvanamm_id', 'is', null);
      
      if (issuedError) throw issuedError;
      
      // Get total points redeemed for franchise members
      const { data: totalRedeemed, error: redeemedError } = await supabase
        .from('loyalty_points')
        .select('points_redeemed')
        .not('tvanamm_id', 'is', null);
      
      if (redeemedError) throw redeemedError;
      
      // Get active franchise members count from profiles
      const { count: activeMembers, error: membersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'franchise')
        .eq('is_verified', true);
      
      if (membersError) throw membersError;

      const pointsIssued = totalIssued?.reduce((sum, item) => sum + (item.total_lifetime_points || 0), 0) || 0;
      const pointsRedeemed = totalRedeemed?.reduce((sum, item) => sum + (item.points_redeemed || 0), 0) || 0;
      const redemptionRate = pointsIssued > 0 ? ((pointsRedeemed / pointsIssued) * 100) : 0;

      return {
        totalPointsIssued: pointsIssued,
        totalPointsRedeemed: pointsRedeemed,
        activeMembers: activeMembers || 0,
        redemptionRate: Math.round(redemptionRate * 100) / 100
      };
    },
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });
};

// Hook for franchise member search and management
export const useFranchiseMembers = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['franchise-members', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          tvanamm_id,
          full_name,
          email,
          phone,
          store_location,
          store_phone,
          is_verified,
          created_at
        `)
        .eq('role', 'franchise')
        .eq('is_verified', true)
        .not('tvanamm_id', 'is', null);

      if (searchTerm) {
        query = query.or(`
          tvanamm_id.ilike.%${searchTerm}%,
          full_name.ilike.%${searchTerm}%,
          email.ilike.%${searchTerm}%
        `);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get loyalty points for each franchise member
      const profilesWithPoints = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: loyaltyData } = await supabase
            .from('loyalty_points')
            .select('current_balance, total_lifetime_points, points_earned, points_redeemed')
            .eq('user_id', profile.user_id)
            .single();
          
          return {
            ...profile,
            loyalty_points: loyaltyData
          };
        })
      );
      
      return profilesWithPoints;
    },
    refetchInterval: 30000, // Real-time updates
  });
};

// Hook for manual loyalty adjustment using TVANAMM ID
export const useManualLoyaltyAdjustmentByTvanamm = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      tvanammId, 
      points, 
      description 
    }: {
      tvanammId: string;
      points: number;
      description: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('add_loyalty_points_manual', {
        p_tvanamm_id: tvanammId,
        p_points: points,
        p_description: description,
        p_admin_user_id: user.id
      });

      if (error) throw error;
      
      const result = data as any;
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to update points');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-loyalty-stats'] });
      queryClient.invalidateQueries({ queryKey: ['franchise-members'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
      toast.success('Loyalty points updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update points: ${error.message}`);
    }
  });
};

// Hook for recent loyalty transactions across all franchise members
export const useFranchiseLoyaltyTransactions = (limit: number = 50) => {
  return useQuery({
    queryKey: ['franchise-loyalty-transactions', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select(`
          id,
          user_id,
          tvanamm_id,
          points,
          type,
          description,
          created_at,
          order_id
        `)
        .not('tvanamm_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    }
  });
};

// Hook for gift redemptions management
export const useGiftRedemptions = () => {
  return useQuery({
    queryKey: ['gift-redemptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_redemptions')
        .select(`
          id,
          user_id,
          gift_id,
          points_used,
          status,
          created_at,
          shipping_address,
          loyalty_gifts (
            name,
            description
          ),
          profiles!gift_redemptions_user_id_fkey (
            tvanamm_id,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

// Hook to update gift redemption status
export const useUpdateGiftRedemptionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      redemptionId, 
      status 
    }: {
      redemptionId: string;
      status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
    }) => {
      const { data, error } = await supabase
        .from('gift_redemptions')
        .update({ status })
        .eq('id', redemptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-redemptions'] });
      toast.success('Gift redemption status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });
};