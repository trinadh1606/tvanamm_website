import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePendingOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-orders', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase.rpc('has_pending_unpaid_orders', {
        p_user_id: user.id
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};