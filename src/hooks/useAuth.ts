import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export const useProfile = () => {
  const { user } = useAuthContext();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useUserRole = () => {
  const { data: profile } = useProfile();
  return profile?.role || 'customer';
};