import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CreditCard, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRealTimeOrders } from '@/hooks/useRealTimeOrders';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useAuth';
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';
import PaymentDetailsModal from '@/components/payment/PaymentDetailsModal';

const StickyPaymentReminder: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = useUserRole();
  const { initiatePayment, isProcessing } = useRazorpayPayment();
  
  // Only show for franchise users
  const { data: orders } = useRealTimeOrders('', 'confirmed');
  
  // Filter orders that need payment (confirmed status)
  const pendingPaymentOrders = orders?.filter(order => 
    order.status === 'confirmed' && 
    order.payment_status === 'pending' &&
    order.user_id === user?.id
  ) || [];

  // Only show for franchise users with pending payment orders
  if (!isVisible || !user || userRole !== 'franchise' || pendingPaymentOrders.length === 0) {
    return null;
  }

  const handlePayNow = () => {
    if (pendingPaymentOrders.length > 0) {
      const firstOrder = pendingPaymentOrders[0];
      setSelectedOrder(firstOrder);
      setIsPaymentModalOpen(true);
    }
  };

  const handleConfirmPayment = async () => {
    if (selectedOrder) {
      setIsPaymentModalOpen(false);
      await initiatePayment({
        orderId: selectedOrder.id,
        amount: selectedOrder.final_amount,
        orderNumber: selectedOrder.order_number,
      });
    }
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const totalPendingAmount = pendingPaymentOrders.reduce((sum, order) => sum + (order.final_amount || 0), 0);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 w-80 animate-slide-up">
        <Card className="border-orange-200 bg-orange-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">Payment Pending</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-orange-800">
                You have <span className="font-semibold">{pendingPaymentOrders.length}</span> order(s) awaiting payment
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-700">Total Amount:</span>
                <span className="font-bold text-orange-900">₹{totalPendingAmount.toLocaleString()}</span>
              </div>
              {pendingPaymentOrders[0] && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-orange-600" />
                    <span className="text-xs text-orange-700">
                      Order #{pendingPaymentOrders[0].order_number}
                    </span>
                  </div>
                  <p className="text-xs text-orange-600">
                    Confirmed on {new Date(pendingPaymentOrders[0].confirmed_at || pendingPaymentOrders[0].created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700" 
                size="sm"
                onClick={handlePayNow}
                disabled={isProcessing || pendingPaymentOrders.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    View Payment Details
                  </>
                )}
              </Button>
              {pendingPaymentOrders.length > 1 && (
                <Button 
                  variant="outline"
                  className="w-full" 
                  size="sm"
                  onClick={handleViewOrders}
                >
                  View All {pendingPaymentOrders.length} Orders
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedOrder && (
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
      )}
    </>
  );
};

export default StickyPaymentReminder;