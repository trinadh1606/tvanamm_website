import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useTestimonials = () => {
  const queryClient = useQueryClient();
  
  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('testimonials-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'testimonials'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['testimonials'] });
          queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useFeaturedTestimonials = () => {
  const queryClient = useQueryClient();
  
  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('featured-testimonials-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'testimonials',
          filter: 'is_featured=eq.true'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['featured-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};