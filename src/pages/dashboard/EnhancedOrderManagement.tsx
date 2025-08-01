import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Search, 
  Filter, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Truck,
  CheckCircle,
  Circle,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  RefreshCw
} from 'lucide-react';
import { useRealTimeOrders, useUpdateOrderStatus } from '@/hooks/useRealTimeOrders';
import { useConfirmOrder } from '@/hooks/useCreateOrder';
import { useStartPacking } from '@/hooks/usePackingManagement';
import PackingModal from '@/components/dashboard/PackingModal';
import ShippingModal from '@/components/dashboard/ShippingModal';
import OrderConfirmationModal from '@/components/dashboard/OrderConfirmationModal';
import { toast } from 'sonner';

const EnhancedOrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPackingModalOpen, setIsPackingModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const { data: orders, isLoading, refetch } = useRealTimeOrders(searchTerm, statusFilter);
  const updateOrderStatus = useUpdateOrderStatus();
  const confirmOrder = useConfirmOrder();
  const startPacking = useStartPacking();

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Circle },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    { value: 'payment_completed', label: 'Payment Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'packing', label: 'Packing', color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
    { value: 'packed', label: 'Packed', color: 'bg-indigo-100 text-indigo-800', icon: Package },
    { value: 'shipped', label: 'Shipped', color: 'bg-orange-100 text-orange-800', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
  ];

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateOrderStatus.mutateAsync({
        orderId: selectedOrder.id,
        status: newStatus as any,
        notes: statusNotes
      });
      
      setIsStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderValue = (order: any) => {
    return order.order_items?.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Real-time order tracking and management</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-6">
        {orders && orders.length > 0 ? (
          orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusInfo.color} border-0`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <div className="flex gap-2">
                        {/* Action buttons based on order status */}
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsConfirmModalOpen(true);
                            }}
                          >
                            Confirm Order
                          </Button>
                        )}
                        
                        {order.status === ('payment_completed' as any) && (
                          <Button
                            size="sm"
                            onClick={() => startPacking.mutate(order.id)}
                            disabled={startPacking.isPending}
                          >
                            Start Packing
                          </Button>
                        )}
                        
                        {order.status === ('packing' as any) && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsPackingModalOpen(true);
                            }}
                          >
                            Packing Checklist
                          </Button>
                        )}
                        
                        {order.status === 'packed' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsShippingModalOpen(true);
                            }}
                          >
                            Ship Order
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setIsStatusDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Customer Details
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {(order as any).profiles?.full_name || 'N/A'}</p>
                        <p><strong>Email:</strong> {(order as any).profiles?.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> {(order as any).profiles?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Shipping Address
                      </h4>
                      <div className="text-sm">
                        {order.shipping_address ? (
                          <div>
                            <p>{(order.shipping_address as any)?.street}</p>
                            <p>{(order.shipping_address as any)?.city}, {(order.shipping_address as any)?.state}</p>
                            <p>{(order.shipping_address as any)?.pincode}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No address provided</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Order Items</h4>
                    <div className="bg-muted/30 rounded-lg p-3">
                      {order.order_items && order.order_items.length > 0 ? (
                        <div className="space-y-2">
                          {order.order_items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div>
                                <span className="font-medium">{item.products?.name || 'Product'}</span>
                                <span className="text-muted-foreground ml-2">×{item.quantity}</span>
                              </div>
                              <span>₹{item.total_price?.toLocaleString()}</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between items-center font-medium">
                            <span>Total Amount:</span>
                            <span>₹{order.final_amount?.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No items found</p>
                      )}
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Order Timeline
                    </h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Created:</strong> {formatDate(order.created_at)}</p>
                      {order.packed_at && <p><strong>Packed:</strong> {formatDate(order.packed_at)}</p>}
                      {order.shipped_at && <p><strong>Shipped:</strong> {formatDate(order.shipped_at)}</p>}
                      {order.delivered_at && <p><strong>Delivered:</strong> {formatDate(order.delivered_at)}</p>}
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Notes</h4>
                      <p className="text-sm bg-muted/30 rounded-lg p-3">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No orders have been placed yet'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Order #{selectedOrder.order_number}
                </p>
                <p className="text-sm">
                  Current Status: <Badge className={getStatusInfo(selectedOrder.status).color}>
                    {getStatusInfo(selectedOrder.status).label}
                  </Badge>
                </p>
              </div>
              
              <div>
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes about this status update..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={updateOrderStatus.isPending || !newStatus}
                  className="flex-1"
                >
                  {updateOrderStatus.isPending ? 'Updating...' : 'Update Status'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsStatusDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Packing Modal */}
      {selectedOrder && (
        <PackingModal
          isOpen={isPackingModalOpen}
          onClose={() => {
            setIsPackingModalOpen(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          orderNumber={selectedOrder.order_number}
        />
      )}

      {/* Shipping Modal */}
      {selectedOrder && (
        <ShippingModal
          isOpen={isShippingModalOpen}
          onClose={() => {
            setIsShippingModalOpen(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          orderNumber={selectedOrder.order_number}
        />
      )}

      {/* Order Confirmation Modal */}
      {selectedOrder && (
        <OrderConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default EnhancedOrderManagement;