import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCanPlaceOrder = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['can-place-order', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase.rpc('can_user_place_order', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking order permissions:', error);
        return false;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });
};