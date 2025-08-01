import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Truck, Phone, MapPin, Calendar, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TrackingDetailsProps {
  order: any;
}

const TrackingDetails: React.FC<TrackingDetailsProps> = ({ order }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'packed':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

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

  const getTrackingSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', date: order.created_at },
      { key: 'confirmed', label: 'Order Confirmed', date: order.confirmed_at },
      { key: 'packed', label: 'Order Packed', date: order.packed_at },
      { key: 'shipped', label: 'Order Shipped', date: order.shipped_at },
      { key: 'delivered', label: 'Order Delivered', date: order.delivered_at }
    ];

    const currentStatusIndex = steps.findIndex(step => step.key === order.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStatusIndex,
      active: index === currentStatusIndex
    }));
  };

  const trackingSteps = getTrackingSteps();
  const hasShippingInfo = order.transport_company || order.driver_name || order.vehicle_number;

  return (
    <div className="space-y-6">
      {/* Order Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Status Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trackingSteps.map((step, index) => (
              <div key={step.key} className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  step.completed 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : step.active 
                    ? 'border-primary text-primary' 
                    : 'border-muted text-muted-foreground'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${step.completed || step.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(step.date), 'PPp')}
                        </p>
                      )}
                    </div>
                    {step.active && (
                      <Badge variant={getStatusColor(order.status)}>
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Information */}
      {hasShippingInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.transport_company && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Transport Company</p>
                  <p className="font-medium">{order.transport_company}</p>
                </div>
              )}
              
              {order.driver_name && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Driver Name</p>
                  <p className="font-medium">{order.driver_name}</p>
                </div>
              )}
              
              {order.driver_contact && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Driver Contact</p>
                  <a 
                    href={`tel:${order.driver_contact}`}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-4 w-4" />
                    {order.driver_contact}
                  </a>
                </div>
              )}
              
              {order.vehicle_number && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Vehicle Number</p>
                  <p className="font-medium font-mono">{order.vehicle_number}</p>
                </div>
              )}
              
              {order.estimated_delivery && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Estimated Delivery</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {order.estimated_delivery}
                  </p>
                </div>
              )}
              
              {order.pickup_location && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Pickup Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {order.pickup_location}
                  </p>
                </div>
              )}
            </div>
            
            {order.special_instructions && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Special Instructions</p>
                  <p className="text-sm bg-muted/50 p-3 rounded">
                    {order.special_instructions}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Order Number:</span>
              <span className="font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Date:</span>
              <span>{format(new Date(order.created_at), 'PPP')}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-medium">₹{order.final_amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Payment Status:</span>
              <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'}>
                {order.payment_status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Order Status:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <Badge variant={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingDetails;