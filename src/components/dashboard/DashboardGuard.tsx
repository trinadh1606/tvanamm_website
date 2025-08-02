import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function DashboardGuard() {
  const { user, loading } = useAuth();
  const userRole = useUserRole();

  // Get user profile data to check dashboard access
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile-dashboard-access', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('dashboard_access_enabled, role, is_verified')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Show loading state while checking authentication
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Critical security check: No user authentication
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Critical security check: Profile fetch error
  if (profileError) {
    console.error('Profile fetch error:', profileError);
    return <Navigate to="/auth" replace />;
  }

  // Critical security check: No profile data
  if (!profile) {
    return <Navigate to="/" replace />;
  }

  // Critical security check: Role-based access control
  const allowedRoles = ['admin', 'owner', 'franchise'];
  if (!profile.role || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }
//Home... fix it 

  // Critical security check: User must be verified
  if (!profile.is_verified) {
    return <Navigate to="/" replace />;
  }

  // Critical security check: Dashboard access must be explicitly enabled
  if (profile.dashboard_access_enabled !== true) {
    return <Navigate to="/" replace />;
  }

  // Additional role validation against client-side role
  if (userRole && userRole !== profile.role) {
    console.error('Role mismatch detected:', { clientRole: userRole, serverRole: profile.role });
    return <Navigate to="/auth" replace />;
  }

  return <DashboardLayout />;
}