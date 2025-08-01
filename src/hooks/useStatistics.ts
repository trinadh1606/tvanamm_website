import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSiteStatistics = () => {
  return useQuery({
    queryKey: ['site-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_statistics')
        .select('stat_key, stat_value')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      
      // Convert array to object for easier access
      const statistics = data.reduce((acc, stat) => {
        acc[stat.stat_key] = stat.stat_value;
        return acc;
      }, {} as Record<string, number>);
      
      return statistics;
    }
  });
};