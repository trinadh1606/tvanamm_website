import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLoyaltyPoints, useLoyaltyRedemptionOptions } from '@/hooks/useLoyalty';
import { useDeliveryVoucher } from '@/hooks/useEnhancedUsers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Coins, 
  Gift, 
  Truck, 
  Minus, 
  Plus, 
  Check, 
  X,
  Ticket,
  Clock,
  ShoppingCart
} from 'lucide-react';

interface LoyaltyCheckoutProps {
  orderTotal: number;
  onDiscountApplied: (discount: number, pointsUsed: number) => void;
  onGiftClaimed: (giftId: string, giftName: string, pointsUsed: number) => void;
  onDeliveryVoucherUsed?: (voucherId: string, pointsUsed: number) => void;
}

export default function LoyaltyCheckout({ 
  orderTotal, 
  onDiscountApplied, 
  onGiftClaimed,
  onDeliveryVoucherUsed 
}: LoyaltyCheckoutProps) {
  const { user } = useAuth();
  const { data: loyaltyPoints, isLoading: pointsLoading } = useLoyaltyPoints();
  const { data: gifts, isLoading: giftsLoading } = useLoyaltyRedemptionOptions();
  const deliveryVoucherMutation = useDeliveryVoucher();

  const [pointsToUse, setPointsToUse] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'discount' | 'gifts' | 'vouchers'>('discount');

  const currentBalance = loyaltyPoints?.current_balance || 0;
  const maxDiscountPoints = Math.min(currentBalance, Math.floor(orderTotal * 0.3)); // Max 30% discount

  const applyDiscount = async (points: number) => {
    if (points > currentBalance) {
      toast.error('Insufficient points');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('handle_loyalty_redemption', {
        p_user_id: user?.id,
        p_points_to_redeem: points,
        p_order_id: null // Will be set when order is created
      });

      if (error) throw error;
      
      const result = data as any;
      if (result?.success) {
        const discount = points; // 1 point = ₹1 discount
        setAppliedDiscount(discount);
        setPointsToUse(points);
        onDiscountApplied(discount, points);
        toast.success(`₹${discount} discount applied!`);
      } else {
        throw new Error(result?.error || 'Failed to apply discount');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const clearDiscount = () => {
    setAppliedDiscount(0);
    setPointsToUse(0);
    onDiscountApplied(0, 0);
  };

  const claimGift = async (gift: any) => {
    if (gift.points_required > currentBalance) {
      toast.error('Insufficient points for this gift');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('handle_loyalty_redemption', {
        p_user_id: user?.id,
        p_points_to_redeem: gift.points_required,
        p_order_id: null, // Will be set when order is created
        p_gift_id: gift.id
      });

      if (error) throw error;
      
      const result = data as any;
      if (result?.success) {
        setSelectedGift(gift);
        onGiftClaimed(gift.id, gift.name, gift.points_required);
        toast.success(`${gift.name} claimed successfully!`);
      } else {
        throw new Error(result?.error || 'Failed to claim gift');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const clearGift = () => {
    setSelectedGift(null);
    onGiftClaimed('', '', 0);
  };

  const claimDeliveryVoucher = async () => {
    const deliveryVoucherPoints = 50; // Fixed points for delivery voucher
    
    if (deliveryVoucherPoints > currentBalance) {
      toast.error('Insufficient points for delivery voucher');
      return;
    }

    try {
      await deliveryVoucherMutation.mutateAsync({
        orderId: 'temp-order-id', // Will be replaced with actual order ID
        pointsUsed: deliveryVoucherPoints
      });
      
      if (onDeliveryVoucherUsed) {
        onDeliveryVoucherUsed('new-voucher', deliveryVoucherPoints);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (pointsLoading || giftsLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Loading Loyalty Options...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableVouchers: any[] = [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Loyalty Rewards
          </div>
          <Badge variant="outline" className="text-primary">
            {currentBalance} points available
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('discount')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'discount' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="h-4 w-4 inline mr-2" />
            Discount
          </button>
          <button
            onClick={() => setActiveTab('gifts')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'gifts' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Gift className="h-4 w-4 inline mr-2" />
            Gifts
          </button>
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'vouchers' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Truck className="h-4 w-4 inline mr-2" />
            Free Delivery
          </button>
        </div>

        {/* Discount Tab */}
        {activeTab === 'discount' && (
          <div className="space-y-4">
            {appliedDiscount > 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      ₹{appliedDiscount} discount applied!
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearDiscount}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {pointsToUse} points redeemed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => applyDiscount(Math.min(100, maxDiscountPoints))}
                    disabled={currentBalance < 100}
                  >
                    ₹100 off (100 pts)
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => applyDiscount(Math.min(250, maxDiscountPoints))}
                    disabled={currentBalance < 250}
                  >
                    ₹250 off (250 pts)
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => applyDiscount(Math.min(500, maxDiscountPoints))}
                    disabled={currentBalance < 500}
                  >
                    ₹500 off (500 pts)
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Custom Amount</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPointsToUse(Math.max(0, pointsToUse - 10))}
                      disabled={pointsToUse <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(Math.min(maxDiscountPoints, parseInt(e.target.value) || 0))}
                      placeholder="Points to use"
                      min="0"
                      max={maxDiscountPoints}
                      className="text-center"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPointsToUse(Math.min(maxDiscountPoints, pointsToUse + 10))}
                      disabled={pointsToUse >= maxDiscountPoints}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max discount: ₹{maxDiscountPoints} (30% of order total)
                  </p>
                </div>
                
                <Button 
                  onClick={() => applyDiscount(pointsToUse)}
                  disabled={pointsToUse <= 0 || pointsToUse > currentBalance}
                  className="w-full"
                >
                  Apply ₹{pointsToUse} Discount
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Gifts Tab */}
        {activeTab === 'gifts' && (
          <div className="space-y-4">
            {selectedGift ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      {selectedGift.name} claimed!
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearGift}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {selectedGift.points_required} points redeemed
                </p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {gifts && gifts.length > 0 ? (
                    gifts.map((gift) => {
                      const canAfford = gift.points_required <= currentBalance;
                      const inStock = gift.stock_quantity > 0;
                      
                      return (
                        <div
                          key={gift.id}
                          className={`p-4 border rounded-lg transition-all ${
                            canAfford && inStock
                              ? 'border-primary/20 hover:border-primary/40 hover:bg-primary/5' 
                              : 'border-muted opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{gift.name}</h4>
                              <p className="text-sm text-muted-foreground">{gift.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-primary">
                                  {gift.points_required} points
                                </Badge>
                                {inStock ? (
                                  <Badge variant="outline" className="text-green-600">
                                    {gift.stock_quantity} in stock
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Out of stock</Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => claimGift(gift)}
                              disabled={!canAfford || !inStock}
                              className="ml-4"
                            >
                              {!canAfford ? 'Need more points' : !inStock ? 'Out of stock' : 'Claim'}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Gift className="h-8 w-8 mx-auto mb-2" />
                      <p>No gifts available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Free Delivery Vouchers Tab */}
        {activeTab === 'vouchers' && (
          <div className="space-y-4">
            {/* Active Vouchers */}
            {availableVouchers.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Your Active Vouchers</h4>
                {availableVouchers.map((voucher) => (
                  <div key={voucher.id} className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-primary" />
                        <span className="font-medium">Free Delivery Voucher</span>
                      </div>
                      <Badge variant="outline" className="text-primary">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires: {new Date(voucher.expires_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        Worth: {voucher.points_used} points
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Use on This Order
                    </Button>
                  </div>
                ))}
                <Separator />
              </div>
            )}

            {/* Claim New Voucher */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Get Free Delivery</h4>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Free Delivery Voucher</h5>
                    <p className="text-sm text-muted-foreground">
                      Get free delivery on your next order
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-primary">
                        50 points
                      </Badge>
                      <Badge variant="outline" className="text-muted-foreground">
                        Valid for 30 days
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={claimDeliveryVoucher}
                    disabled={currentBalance < 50 || deliveryVoucherMutation.isPending}
                    className="ml-4"
                  >
                    {deliveryVoucherMutation.isPending ? 'Claiming...' : 'Claim Voucher'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How Points Work */}
        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-2">How Loyalty Points Work</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Coins className="h-4 w-4 text-primary" />
              <span>1 point = ₹1 discount</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" />
              <span>Earn 20 pts per ₹5000+ order</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gift className="h-4 w-4 text-primary" />
              <span>Redeem for exclusive gifts</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}