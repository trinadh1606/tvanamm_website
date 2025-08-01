import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UserPlus, Trash2, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

interface NewUserNotification {
  id: string;
  title: string;
  message: string;
  data: {
    new_user_id: string;
    new_user_email: string;
    new_user_name: string;
    action_type: string;
    requires_action: boolean;
  };
  created_at: string;
  is_read: boolean;
}

interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  dashboard_access_enabled: boolean;
  tvanamm_id: string | null;
  created_at: string;
}

export default function NewUserManagement() {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<string>('franchise');
  const [tvanammId, setTvanammId] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [storePhone, setStorePhone] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch new user notifications
  const { data: newUserNotifications } = useQuery({
    queryKey: ['new-user-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .contains('data', { action_type: 'new_user_signup' })
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        data: item.data as any
      })) as NewUserNotification[];
    },
    refetchInterval: 5000 // Real-time updates
  });

  // Fetch all unverified users
  const { data: unverifiedUsers } = useQuery({
    queryKey: ['unverified-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_verified', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
    refetchInterval: 5000
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role, tvanammId, storeLocation, storePhone }: {
      userId: string;
      role: string;
      tvanammId?: string;
      storeLocation?: string;
      storePhone?: string;
    }) => {
      const { data, error } = await supabase.rpc('assign_user_details', {
        p_user_id: userId,
        p_role: role,
        p_tvanamm_id: role === 'owner' ? null : tvanammId,
        p_store_location: storeLocation,
        p_store_phone: storePhone
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unverified-users'] });
      queryClient.invalidateQueries({ queryKey: ['new-user-notifications'] });
      toast.success('User role assigned successfully');
      setAssignModalOpen(false);
      setSelectedUser(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign role: ${error.message}`);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // First delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (profileError) throw profileError;

      // Then delete the auth user (requires admin permissions)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unverified-users'] });
      queryClient.invalidateQueries({ queryKey: ['new-user-notifications'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    }
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-user-notifications'] });
    }
  });

  const resetForm = () => {
    setAssignRole('franchise');
    setTvanammId('');
    setStoreLocation('');
    setStorePhone('');
  };

  const handleAssignRole = (user: UserProfile) => {
    setSelectedUser(user);
    setAssignModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleNotificationAction = (notification: NewUserNotification, action: 'assign' | 'delete') => {
    const user = unverifiedUsers?.find(u => u.user_id === notification.data.new_user_id);
    if (user) {
      if (action === 'assign') {
        handleAssignRole(user);
      } else {
        handleDeleteUser(user.user_id);
      }
      markAsReadMutation.mutate(notification.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* New User Notifications */}
      {newUserNotifications && newUserNotifications.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <UserPlus className="h-5 w-5" />
              New User Signups ({newUserNotifications.length})
            </CardTitle>
            <CardDescription>
              New users are waiting for role assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {newUserNotifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">
                      {notification.data.new_user_name || notification.data.new_user_email}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(notification.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Email: {notification.data.new_user_email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleNotificationAction(notification, 'assign')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Assign Role
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleNotificationAction(notification, 'delete')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Unverified Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Unverified Users ({unverifiedUsers?.length || 0})
          </CardTitle>
          <CardDescription>
            Complete list of users pending verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unverifiedUsers && unverifiedUsers.length > 0 ? (
            <div className="space-y-3">
              {unverifiedUsers.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">
                        {user.full_name || user.email}
                      </h4>
                      <Badge variant="secondary">
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.email} • Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssignRole(user)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Assign Role
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.user_id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No unverified users</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign User Role</DialogTitle>
            <DialogDescription>
              Assign a role to {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={assignRole} onValueChange={setAssignRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="franchise">Franchise</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {assignRole !== 'owner' && (
              <div className="space-y-2">
                <Label htmlFor="tvanammId">TVANAMM ID</Label>
                <Input
                  id="tvanammId"
                  value={tvanammId}
                  onChange={(e) => setTvanammId(e.target.value)}
                  placeholder="Enter TVANAMM ID"
                  required={assignRole !== 'owner'}
                />
              </div>
            )}

            {assignRole === 'franchise' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="storeLocation">Store Location</Label>
                  <Input
                    id="storeLocation"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    placeholder="Enter store location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storePhone">Store Phone</Label>
                  <Input
                    id="storePhone"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="Enter store phone"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setAssignModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedUser) return;
                  assignRoleMutation.mutate({
                    userId: selectedUser.user_id,
                    role: assignRole,
                    tvanammId: assignRole === 'owner' ? undefined : tvanammId,
                    storeLocation,
                    storePhone
                  });
                }}
                disabled={assignRoleMutation.isPending}
              >
                {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}