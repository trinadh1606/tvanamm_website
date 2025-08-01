import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Enhanced user assignment with multi-step process
export const useAssignUserDetails = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      role, 
      tvanammId, 
      storeLocation, 
      storePhone 
    }: {
      userId: string;
      role: 'admin' | 'franchise' | 'owner';
      tvanammId?: string;
      storeLocation?: string;
      storePhone?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('assign_user_details', {
        p_user_id: userId,
        p_role: role,
        p_tvanamm_id: tvanammId,
        p_store_location: storeLocation,
        p_store_phone: storePhone,
        p_admin_user_id: user.id
      });

      if (error) throw error;
      
      const result = data as any;
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to assign user details');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['franchise-members'] });
      toast.success('User details assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign details: ${error.message}`);
    }
  });
};

// Toggle dashboard access for verified users
export const useToggleDashboardAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      enabled 
    }: {
      userId: string;
      enabled: boolean;
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          dashboard_access_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Dashboard access ${variables.enabled ? 'enabled' : 'disabled'}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update access: ${error.message}`);
    }
  });
};

// Enhanced users query with real-time updates
export const useEnhancedUsers = () => {
  return useQuery({
    queryKey: ['enhanced-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

// Voucher management hooks
export const useVoucherRedemptions = () => {
  return useQuery({
    queryKey: ['voucher-redemptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voucher_redemptions')
        .select(`
          *,
          franchises!voucher_redemptions_tvanamm_id_fkey (
            contact_person,
            business_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useDeliveryVoucher = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      pointsUsed 
    }: {
      orderId: string;
      pointsUsed: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('use_delivery_voucher', {
        p_user_id: user.id,
        p_order_id: orderId,
        p_points_used: pointsUsed
      });

      if (error) throw error;
      
      const result = data as any;
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to use delivery voucher');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
      queryClient.invalidateQueries({ queryKey: ['voucher-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
      toast.success('Free delivery voucher applied successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to apply voucher: ${error.message}`);
    }
  });
};