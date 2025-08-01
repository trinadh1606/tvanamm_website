import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leadData: {
      name: string;
      email: string;
      phone?: string;
      message?: string;
      source?: string;
      city?: string;
      [key: string]: any;
    }) => {
      console.log('Creating lead with data:', leadData);
      
      // Use the edge function for rate-limited form submission
      const { data, error } = await supabase.functions.invoke('check-form-rate-limit', {
        body: { leadData }
      });

      if (error) {
        console.error('Form submission error:', error);
        throw new Error(error.message || 'Failed to submit form');
      }

      if (!data.success) {
        if (data.rateLimitExceeded) {
          throw new Error(data.error || 'Too many submissions. Please try again later.');
        }
        throw new Error(data.error || 'Failed to submit form');
      }
      
      console.log('Lead created successfully:', data.lead);
      return data.lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Thank you! We will contact you soon.');
    },
    onError: (error: Error) => {
      console.error('Lead submission failed:', error);
      toast.error(`Failed to submit form: ${error.message}`);
    }
  });
};