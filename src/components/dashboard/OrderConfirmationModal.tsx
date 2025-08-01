import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, DollarSign, Truck } from 'lucide-react';
import { useConfirmOrder } from '@/hooks/useCreateOrder';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  const [deliveryFee, setDeliveryFee] = useState(order?.delivery_fee || 0);
  
  const confirmOrder = useConfirmOrder();

  const handleConfirm = async () => {
    try {
      await confirmOrder.mutateAsync({
        orderId: order.id,
        deliveryFee: deliveryFee
      });
      onClose();
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  if (!order) return null;

  const newTotal = (order.total_amount || 0) + deliveryFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Confirm Order #{order.order_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Fee:</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                    className="w-24 h-8 text-right"
                    min={0}
                  />
                </div>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Final Total:</span>
                <span>₹{newTotal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Customer:</h4>
              <p className="text-sm">{order.profiles?.full_name}</p>
              <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-medium">Next Steps</span>
              </div>
              <p className="text-sm text-blue-700">
                After confirmation, the franchise will receive a payment notification and can proceed with payment.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
              disabled={confirmOrder.isPending}
              className="flex-1"
            >
              {confirmOrder.isPending ? 'Confirming...' : 'Confirm Order'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmationModal;