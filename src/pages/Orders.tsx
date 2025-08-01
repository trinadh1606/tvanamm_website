import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Search, Filter, Eye, CreditCard, Loader2, Receipt, Truck, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';
import ShippingAddress from '@/components/ui/shipping-address';
import PaymentDetailsModal from '@/components/payment/PaymentDetailsModal';
import TrackingModal from '@/components/tracking/TrackingModal';

const Orders = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const { initiatePayment, isProcessing } = useRazorpayPayment();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              images
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'packed': return 'default';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handlePayment = (order: any) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;
    
    try {
      await initiatePayment({
        orderId: selectedOrder.id,
        amount: selectedOrder.final_amount,
        orderNumber: selectedOrder.order_number,
      });
      setIsPaymentModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleTrackOrder = (order: any) => {
    setTrackingOrder(order);
    setIsTrackingModalOpen(true);
  };

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl font-bold text-foreground">
                My Orders
              </h1>
              <Link to="/invoices">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  View Invoices
                </Button>
              </Link>
            </div>
            <p className="text-xl text-muted-foreground">
              Track and manage your tea orders
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by order number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="packed">Packed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {filteredOrders && filteredOrders.length > 0 ? (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Order {order.order_number}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Placed on {format(new Date(order.created_at), 'PPP')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <Badge variant={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold">₹{order.final_amount}</div>
                          <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {order.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium mb-2">Items ({order.order_items?.length || 0})</h4>
                        <div className="space-y-2">
                          {order.order_items?.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                              <div className="w-12 h-12 bg-background rounded border flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.products?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {item.quantity} × ₹{item.unit_price}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{item.total_price}</p>
                              </div>
                            </div>
                          ))}
                          {order.order_items && order.order_items.length > 3 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              +{order.order_items.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                          <ShippingAddress address={order.shipping_address} />
                        </div>
                      </div>

                      {/* Tracking Information (if available) */}
                      {(order.status === 'shipped' || order.status === 'delivered') && (
                        <div>
                          <h4 className="font-medium mb-2">Tracking Information</h4>
                          <div className="text-sm bg-muted/50 p-3 rounded space-y-2">
                            {order.transport_company && (
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Transport:</span>
                                <span>{order.transport_company}</span>
                              </div>
                            )}
                            {order.driver_name && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Driver:</span>
                                <span>{order.driver_name}</span>
                                {order.driver_contact && (
                                  <a 
                                    href={`tel:${order.driver_contact}`}
                                    className="text-primary hover:underline flex items-center gap-1 ml-2"
                                  >
                                    <Phone className="h-3 w-3" />
                                    {order.driver_contact}
                                  </a>
                                )}
                              </div>
                            )}
                            {order.vehicle_number && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Vehicle:</span>
                                <span className="font-mono">{order.vehicle_number}</span>
                              </div>
                            )}
                            {order.estimated_delivery && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Estimated Delivery:</span>
                                <span>{order.estimated_delivery}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {(order.status === 'shipped' || order.status === 'delivered') && (
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              <span>Tracking available</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {order.status === 'confirmed' && order.payment_status === 'pending' && (
                            <Button 
                              onClick={() => handlePayment(order)}
                              disabled={isProcessing}
                              className="bg-emerald-600 hover:bg-emerald-700"
                              size="sm"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Pay Now
                                </>
                              )}
                            </Button>
                          )}
                          {(order.status === 'shipped' || order.status === 'delivered') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTrackOrder(order)}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Track Order
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTrackOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : "You haven't placed any orders yet"}
                </p>
                <Button>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <PaymentDetailsModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConfirmPayment={handleConfirmPayment}
        isProcessing={isProcessing}
      />

      <TrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setTrackingOrder(null);
        }}
        order={trackingOrder}
      />
    </div>
  );
};

export default Orders;