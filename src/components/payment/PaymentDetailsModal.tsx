import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Package, MapPin, Loader2 } from 'lucide-react';
import ShippingAddress from '@/components/ui/shipping-address';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onConfirmPayment: () => void;
  isProcessing: boolean;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmPayment,
  isProcessing
}) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details - Order #{order.order_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order Number:</span>
                <Badge variant="outline">{order.order_number}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order Date:</span>
                <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="default">{order.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.order_items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.products?.name || 'Product'}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ₹{item.unit_price}
                      </p>
                    </div>
                    <p className="font-medium">₹{item.total_price}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShippingAddress address={order.shipping_address} />
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.order_items?.map((item: any, index: number) => {
                const gstRate = item.products?.gst_rate || 18;
                const basePrice = item.unit_price / (1 + gstRate / 100);
                const gstAmount = basePrice * (gstRate / 100);
                const totalBasePrice = basePrice * item.quantity;
                const totalGstAmount = gstAmount * item.quantity;
                
                return (
                  <div key={index} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium text-sm">{item.products?.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Base Price ({item.quantity}x):</span>
                        <span>₹{totalBasePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST ({gstRate}%):</span>
                        <span>₹{totalGstAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal (incl. GST):</span>
                  <span>₹{order.total_amount}</span>
                </div>
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>₹{order.delivery_fee}</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span>₹{order.final_amount}</span>
              </div>
              
              <div className="text-sm text-muted-foreground mt-2">
                Payment will be processed through Razorpay secure gateway
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirmPayment}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsModal;