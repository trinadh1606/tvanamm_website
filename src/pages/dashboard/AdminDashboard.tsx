import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRealTimeOrders } from '@/hooks/useRealTimeOrders';
import { useNotifications } from '@/hooks/useNotifications';
import { useInvoices } from '@/hooks/useInvoices';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, MessageSquare, FileText, Award, Clock, DollarSign, UserPlus, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const userRole = useUserRole();
  const { data: orders, isLoading: ordersLoading } = useRealTimeOrders();
  const { data: notifications } = useNotifications();
  const { data: invoices } = useInvoices();
  const queryClient = useQueryClient();

  // Fetch new user notifications for owners/admins
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
      return data || [];
    },
    refetchInterval: 10000, // Check every 10 seconds for new signups
    enabled: userRole === 'owner' || userRole === 'admin'
  });

  // Real-time notifications for new users
  useEffect(() => {
    if (userRole !== 'owner' && userRole !== 'admin') return;

    const channel = supabase
      .channel('new-user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `data->>action_type=eq.new_user_signup`
        },
        (payload) => {
          toast.success('New user signup!', {
            description: 'A new user has registered and needs role assignment.',
            action: {
              label: 'View',
              onClick: () => window.open('/dashboard/user-management', '_blank')
            }
          });
          queryClient.invalidateQueries({ queryKey: ['new-user-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, queryClient]);
  // Fixed loyalty stats to only count franchise users
  const { data: loyaltyStats } = useQuery({
    queryKey: ['admin-loyalty-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_franchise_loyalty_stats');
      if (error) throw error;
      return data?.[0] || { active_loyalty_users: 0 };
    }
  });

  // Fixed invoice stats 
  const { data: invoiceStats } = useQuery({
    queryKey: ['admin-invoice-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_invoice_stats');
      if (error) throw error;
      return data?.[0] || { total_invoices: 0 };
    }
  });

  // Redirect if not admin or owner
  if (userRole !== 'admin' && userRole !== 'owner') {
    return <Navigate to="/dashboard" replace />;
  }

  const stats = [
    {
      title: 'Total Orders',
      value: orders?.length || 0,
      icon: ShoppingCart,
      description: 'Orders processed',
      color: 'text-blue-600'
    },
    {
      title: 'Pending Messages',
      value: notifications?.filter(n => n.type === 'franchise').length || 0,
      icon: MessageSquare,
      description: 'Awaiting response',
      color: 'text-orange-600'
    },
    {
      title: 'Invoices Generated',
      value: invoiceStats?.total_invoices || 0,
      icon: FileText,
      description: 'Total invoices',
      color: 'text-green-600'
    },
    {
      title: 'Active Loyalty Users',
      value: loyaltyStats?.active_loyalty_users || 0,
      icon: Award,
      description: 'Franchise members only',
      color: 'text-purple-600'
    }
  ];

  const recentOrders = orders?.slice(0, 5) || [];
  const recentMessages = notifications?.filter(n => n.type === 'franchise').slice(0, 3) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Real-time administrative overview</p>
        </div>
        
        {/* New User Notification Bell for Owners */}
        {userRole === 'owner' && newUserNotifications && newUserNotifications.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/dashboard/user-management', '_blank')}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                New Users ({newUserNotifications.length})
              </Button>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* New User Alerts for Owners */}
      {userRole === 'owner' && newUserNotifications && newUserNotifications.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <UserPlus className="h-5 w-5" />
              {newUserNotifications.length} New User{newUserNotifications.length > 1 ? 's' : ''} Awaiting Assignment
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              New users have signed up and need role assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.open('/dashboard/user-management', '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Manage Users
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest order activity</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-4">Loading orders...</div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{order.final_amount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'shipped' ? 'secondary' :
                        order.status === 'confirmed' ? 'outline' : 'destructive'
                      }>
                        {order.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No recent orders</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Messages
            </CardTitle>
            <CardDescription>Customer inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div key={message.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{message.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {message.message}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {message.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(message.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No recent messages</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Manage Orders</span>
            </button>
            <button className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              <MessageSquare className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">View Messages</span>
            </button>
            <button className="p-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors">
              <FileText className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Generate Invoices</span>
            </button>
            <button className="p-4 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
              <Award className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Loyalty Management</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}