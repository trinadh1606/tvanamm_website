import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedUsers, useToggleDashboardAccess } from '@/hooks/useEnhancedUsers';
import { Mail, Phone, MapPin, Calendar, Users, Store, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const FranchiseManagement = () => {
  const { data: users, isLoading } = useEnhancedUsers();
  const toggleDashboardAccess = useToggleDashboardAccess();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const franchiseMembers = users?.filter(user => user.role === 'franchise') || [];

  const handleToggleAccess = async (user: any) => {
    const newAccess = !user.dashboard_access_enabled;
    const action = newAccess ? 'enable' : 'disable';
    
    try {
      await toggleDashboardAccess.mutateAsync({
        userId: user.user_id,
        enabled: newAccess
      });
      
      toast.success(`Successfully ${action}d dashboard access for ${user.full_name || user.email}`);
    } catch (error) {
      toast.error(`Failed to ${action} dashboard access`);
      console.error('Toggle access error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Franchise Management</h1>
          <p className="text-muted-foreground">Loading franchise partners...</p>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Franchise Management</h1>
        <p className="text-muted-foreground">Manage and monitor franchise partners</p>
      </div>

      <div className="grid gap-6">
        {franchiseMembers.length > 0 ? (
          franchiseMembers.map((franchise) => (
            <Card key={franchise.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    {franchise.full_name}
                  </CardTitle>
                  <Badge variant={franchise.is_verified ? "default" : "secondary"}>
                    {franchise.is_verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{franchise.email}</span>
                    </div>
                    {franchise.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{franchise.phone}</span>
                      </div>
                    )}
                    {franchise.store_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{franchise.store_location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Joined: {new Date(franchise.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {franchise.tvanamm_id && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">TVANAMM ID:</span>
                        <Badge variant="outline">{franchise.tvanamm_id}</Badge>
                      </div>
                    )}
                    {franchise.store_phone && (
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Store: {franchise.store_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Dashboard Access: {franchise.dashboard_access_enabled ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant={franchise.dashboard_access_enabled ? "destructive" : "default"} 
                        size="sm"
                        onClick={() => setSelectedUser(franchise)}
                      >
                        {franchise.dashboard_access_enabled ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            Disable Access
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-2" />
                            Enable Access
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {franchise.dashboard_access_enabled ? "Disable" : "Enable"} Dashboard Access
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {franchise.dashboard_access_enabled ? (
                            <>
                              Are you sure you want to disable dashboard access for <strong>{franchise.full_name || franchise.email}</strong>?
                              <br /><br />
                              This will prevent them from:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Accessing the dashboard</li>
                                <li>Placing new orders</li>
                                <li>Using franchise features</li>
                              </ul>
                            </>
                          ) : (
                            <>
                              Are you sure you want to enable dashboard access for <strong>{franchise.full_name || franchise.email}</strong>?
                              <br /><br />
                              This will allow them to access the dashboard and place orders.
                            </>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleToggleAccess(franchise)}
                          className={franchise.dashboard_access_enabled ? "bg-destructive hover:bg-destructive/90" : ""}
                        >
                          {franchise.dashboard_access_enabled ? "Disable Access" : "Enable Access"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  {!franchise.is_verified && (
                    <Button size="sm">
                      Verify Partner
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Franchise Partners Found</h3>
              <p className="text-muted-foreground">
                No franchise partners have been registered yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FranchiseManagement;