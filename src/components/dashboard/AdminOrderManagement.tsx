import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealTimeOrders, useUpdateOrderStatus } from '@/hooks/useRealTimeOrders';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Filter, RefreshCw, Package, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: orders, isLoading } = useRealTimeOrders(searchTerm, statusFilter);
  const updateOrderStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  // Set up real-time subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Real-time order update:', payload);
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          
          if (payload.eventType === 'UPDATE') {
            toast.success(`Order ${payload.new.order_number} status updated to ${payload.new.status}`);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_transactions'
        },
        (payload) => {
          console.log('Real-time payment update:', payload);
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
            toast.success('Payment completed!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus as any });
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'shipped': return 'secondary';
      case 'packed': return 'outline';
      case 'confirmed': return 'outline';
      default: return 'destructive';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
        <p className="text-muted-foreground mt-2">Real-time order tracking and management</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="packing">Packing</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.order_number}</CardTitle>
                    <CardDescription>
                      {new Date(order.created_at).toLocaleDateString()} • ₹{order.final_amount?.toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge variant={getPaymentStatusColor(order.payment_status)}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Customer</h4>
                    <p className="text-sm text-muted-foreground">
                      {(order as any).profiles?.full_name || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(order as any).profiles?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Shipping Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {typeof order.shipping_address === 'string' ? order.shipping_address : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          disabled={updateOrderStatus.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(order.id, 'packing')}
                          disabled={updateOrderStatus.isPending}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Start Packing
                        </Button>
                      )}
                      {order.status === 'packing' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(order.id, 'packed')}
                          disabled={updateOrderStatus.isPending}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Mark Packed
                        </Button>
                      )}
                      {order.status === 'packed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          disabled={updateOrderStatus.isPending}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Ship Order
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          disabled={updateOrderStatus.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}