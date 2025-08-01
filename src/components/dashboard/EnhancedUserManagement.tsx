import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useEnhancedUsers, useAssignUserDetails, useToggleDashboardAccess } from '@/hooks/useEnhancedUsers';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Settings, 
  Shield, 
  ShieldCheck, 
  Building2,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

interface AssignmentFormData {
  role: 'admin' | 'franchise' | 'owner' | '';
  tvanammId: string;
  storeLocation: string;
  storePhone: string;
}

export default function EnhancedUserManagement() {
  const { data: users, isLoading } = useEnhancedUsers();
  const assignUserDetails = useAssignUserDetails();
  const toggleDashboardAccess = useToggleDashboardAccess();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormData>({
    role: '',
    tvanammId: '',
    storeLocation: '',
    storePhone: ''
  });

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('user-management-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          // Invalidate and refetch users data
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.tvanamm_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'unassigned' && !user.role) ||
                       user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  const handleAssignUser = (user: any) => {
    setSelectedUser(user);
    setAssignmentForm({
      role: '',
      tvanammId: '',
      storeLocation: '',
      storePhone: ''
    });
    setAssignDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const submitAssignment = async () => {
    // Input validation
    if (!selectedUser || !assignmentForm.role) {
      return;
    }

    // For non-owner roles, TVANAMM ID is required and must be valid
    if (assignmentForm.role !== 'owner') {
      if (!assignmentForm.tvanammId || assignmentForm.tvanammId.trim().length < 10) {
        console.error('Invalid TVANAMM ID');
        return;
      }
      
      // Validate TVANAMM ID format (should start with TVN and be followed by year and numbers)
      const tvanammRegex = /^TVN\d{4}\d{6,}$/;
      if (!tvanammRegex.test(assignmentForm.tvanammId.trim())) {
        console.error('Invalid TVANAMM ID format');
        return;
      }
    }

    // Validate phone number if provided
    if (assignmentForm.storePhone && assignmentForm.storePhone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,15}$/;
      if (!phoneRegex.test(assignmentForm.storePhone.trim())) {
        console.error('Invalid phone number format');
        return;
      }
    }

    // Validate role is one of allowed values
    const allowedRoles = ['admin', 'franchise', 'owner'];
    if (!allowedRoles.includes(assignmentForm.role)) {
      console.error('Invalid role selected');
      return;
    }

    try {
      await assignUserDetails.mutateAsync({
        userId: selectedUser.user_id,
        role: assignmentForm.role,
        tvanammId: assignmentForm.role === 'owner' ? undefined : assignmentForm.tvanammId.trim(),
        storeLocation: assignmentForm.storeLocation?.trim() || undefined,
        storePhone: assignmentForm.storePhone?.trim() || undefined
      });
      
      setAssignDialogOpen(false);
      setSelectedUser(null);
      setAssignmentForm({
        role: '',
        tvanammId: '',
        storeLocation: '',
        storePhone: ''
      });
    } catch (error) {
      console.error('Assignment failed:', error);
    }
  };

  const toggleUserDashboard = async (userId: string, currentAccess: boolean) => {
    try {
      await toggleDashboardAccess.mutateAsync({
        userId,
        enabled: !currentAccess
      });
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'franchise': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getInitials = (name?: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enhanced User Management</h1>
          <p className="text-muted-foreground">Assign roles, manage access, and verify users</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users by name, email, or TVANAMM ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="franchise">Franchise</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.user_id} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{user.full_name || 'No Name'}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {user.is_verified && (
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                  )}
                  {user.dashboard_access_enabled && (
                    <Settings className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Role Badge */}
              <div className="flex items-center justify-between">
                <Badge className={getRoleColor(user.role)}>
                  {user.role || 'Unassigned'}
                </Badge>
                {user.tvanamm_id && (
                  <Badge variant="outline" className="text-xs">
                    {user.tvanamm_id}
                  </Badge>
                )}
              </div>

              {/* User Info */}
              <div className="space-y-2 text-sm">
                {user.store_location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{user.store_location}</span>
                  </div>
                )}
                {user.store_phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{user.store_phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {formatDate(user.created_at)}</span>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                {!user.is_verified ? (
                  <Button 
                    size="sm" 
                    onClick={() => handleAssignUser(user)}
                    className="w-full"
                    disabled={assignUserDetails.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign ID & Role
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`dashboard-${user.user_id}`} className="text-sm">
                        Dashboard Access
                      </Label>
                      <Switch
                        id={`dashboard-${user.user_id}`}
                        checked={user.dashboard_access_enabled || false}
                        onCheckedChange={() => toggleUserDashboard(user.user_id, user.dashboard_access_enabled)}
                        disabled={toggleDashboardAccess.isPending}
                      />
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms.' : 'No users match the selected filters.'}
          </p>
        </div>
      )}

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign User Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedUser && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(selectedUser.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Role *</Label>
              <Select
                value={assignmentForm.role}
                onValueChange={(value: 'admin' | 'franchise' | 'owner') => 
                  setAssignmentForm(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="franchise">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Franchise
                    </div>
                  </SelectItem>
                  <SelectItem value="owner">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      Owner
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {assignmentForm.role !== 'owner' && (
              <div className="space-y-2">
                <Label>TVANAMM ID *</Label>
                <Input
                  value={assignmentForm.tvanammId}
                  onChange={(e) => setAssignmentForm(prev => ({ 
                    ...prev, 
                    tvanammId: e.target.value.toUpperCase() 
                  }))}
                  placeholder="e.g., TVN2024001234"
                />
              </div>
            )}

            {assignmentForm.role === 'owner' && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Owner role doesn't require a TVANAMM ID. This role has full system access.
                </p>
              </div>
            )}

            {assignmentForm.role === 'franchise' && (
              <>
                <div className="space-y-2">
                  <Label>Store Location</Label>
                  <Input
                    value={assignmentForm.storeLocation}
                    onChange={(e) => setAssignmentForm(prev => ({ 
                      ...prev, 
                      storeLocation: e.target.value 
                    }))}
                    placeholder="Enter store address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Store Phone</Label>
                  <Input
                    value={assignmentForm.storePhone}
                    onChange={(e) => setAssignmentForm(prev => ({ 
                      ...prev, 
                      storePhone: e.target.value 
                    }))}
                    placeholder="Enter store phone number"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setAssignDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={submitAssignment}
                disabled={
                  !assignmentForm.role || 
                  (assignmentForm.role !== 'owner' && !assignmentForm.tvanammId) || 
                  assignUserDetails.isPending
                }
                className="flex-1"
              >
                {assignUserDetails.isPending ? 'Assigning...' : 'Assign Details'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Access</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(selectedUser.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Dashboard Access</p>
                    <p className="text-sm text-muted-foreground">
                      Allow user to access dashboard features
                    </p>
                  </div>
                  <Switch
                    checked={selectedUser.dashboard_access_enabled || false}
                    onCheckedChange={() => toggleUserDashboard(selectedUser.user_id, selectedUser.dashboard_access_enabled)}
                    disabled={toggleDashboardAccess.isPending}
                  />
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}