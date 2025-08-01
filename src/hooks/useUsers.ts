import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
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

export const useAssignTvanammId = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      role 
    }: {
      userId: string;
      role: 'admin' | 'franchise' | 'owner';
    }) => {
      const { data: tvanammId } = await supabase.rpc('generate_tvanamm_id');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          tvanamm_id: tvanammId,
          role,
          profile_completion_status: 'approved',
          dashboard_access_enabled: true,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          assigned_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      return { success: true, tvanammId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`TVANAMM ID ${data.tvanammId} assigned successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign TVANAMM ID: ${error.message}`);
    }
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      role, 
      dashboardAccess 
    }: {
      userId: string;
      role: 'admin' | 'franchise' | 'owner';
      dashboardAccess: boolean;
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          role,
          dashboard_access_enabled: dashboardAccess,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          assigned_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    }
  });
};

export const useToggleUserVerification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      isVerified 
    }: {
      userId: string;
      isVerified: boolean;
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('user_id', userId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User verification status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update verification status: ${error.message}`);
    }
  });
};