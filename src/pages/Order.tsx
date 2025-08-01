import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ShoppingCart, Plus, Minus, MapPin, CreditCard, Star, AlertCircle, Store, Phone } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useLoyaltyPoints } from '@/hooks/useLoyalty';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useAuth';
import { useCreateOrder } from '@/hooks/useCreateOrder';
import { usePendingOrders } from '@/hooks/usePendingOrders';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { GeneralUserOrderPage } from '@/components/order/GeneralUserOrderPage';
import { calculateOrderTotals, validateLoyaltyPointsUsage } from '@/utils/orderCalculations';
interface CartItem {
  id: string;
  name: string;
  basePrice: number; // GST-exclusive price
  price: number; // GST-inclusive final price (what customer pays)
  quantity: number;
  image?: string;
  gstRate: number;
}
const OrderPage = () => {
  const { data: products, isLoading } = useProducts();
  const { data: loyaltyPoints } = useLoyaltyPoints();
  const { data: hasPendingOrders } = usePendingOrders();
  const { user } = useAuth();
  const userRole = useUserRole();
  const navigate = useNavigate();
  const { 
    cart, 
    addToCart: addToCartContext, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loyaltyReward, setLoyaltyReward] = useState<{ type: 'delivery' | 'tea_cups' | null; pointsUsed: number; description: string; giftId?: string } | null>(null);
  const [customPoints, setCustomPoints] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  // Cart is now managed by context, no need for local state
  const categories = ['all', 'black-tea', 'green-tea', 'herbal-tea', 'specialty-tea'];
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const addToCart = (product: any) => {
    // Check for pending unpaid orders before allowing new items
    if (hasPendingOrders) {
      toast.error('Please complete payment for your pending order before placing a new one.');
      return;
    }
    
    addToCartContext(product);
    toast.success(`${product.name} added to cart`);
  };

  // Calculate GST breakdown for each item
  const calculateItemDetails = (item: CartItem) => {
    const gstAmount = item.basePrice * (item.gstRate / 100);
    return {
      basePrice: item.basePrice,
      gstAmount: Math.round(gstAmount * 100) / 100,
      totalPrice: item.price // Already includes GST
    };
  };
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalGstAmount = cart.reduce((sum, item) => {
    const itemDetails = calculateItemDetails(item);
    return sum + (itemDetails.gstAmount * item.quantity);
  }, 0);
  
  // Calculate order totals with loyalty discount applied
  const orderCalculations = calculateOrderTotals(subtotal, customPoints, 0);
  const total = orderCalculations.totalAfterLoyalty;
  const {
    mutate: createOrder,
    isPending: isCreatingOrder
  } = useCreateOrder();
  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }
    if (hasPendingOrders) {
      toast.error('Please complete payment for your pending order before placing a new one.');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast.error('Please fill in all shipping address fields');
      return;
    }
    // Calculate total loyalty points used (custom points + reward points)
    const totalLoyaltyPointsUsed = customPoints + (loyaltyReward?.pointsUsed || 0);
    
    // Build order notes with reward details
    let orderNotes = `GST Amount: ₹${totalGstAmount.toFixed(2)}`;
    if (customPoints > 0) {
      orderNotes += ` | Discount: ₹${customPoints} (${customPoints} points)`;
    }
    if (loyaltyReward && loyaltyReward.type) {
      orderNotes += ` | Reward: ${loyaltyReward.description} (${loyaltyReward.pointsUsed} points)`;
    }

    createOrder({
      items: cart.map(item => ({
        ...item,
        gstRate: item.gstRate || 18
      })),
      shippingAddress,
      subtotal,
      gstAmount: totalGstAmount,
      deliveryFee: loyaltyReward?.type === 'delivery' ? 0 : undefined, // Free delivery if reward selected
      total,
      selectedRedemption: orderNotes,
      loyaltyPointsUsed: totalLoyaltyPointsUsed,
      giftId: loyaltyReward?.type === 'tea_cups' ? 'tea-cups-gift' : undefined
    }, {
      onSuccess: () => {
        clearCart();
        setIsCheckoutOpen(false);
        setShippingAddress({
          name: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          landmark: ''
        });
        setLoyaltyReward(null);
        setCustomPoints(0);
      }
    });
  };
  if (isLoading) {
    return <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6 w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-muted rounded-lg"></div>)}
                </div>
              </div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>;
  }

  // Show different content based on user role
  if (!user || userRole !== 'franchise') {
    return <GeneralUserOrderPage />;
  }

  // Franchise users see the full ordering interface
  return <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header for Franchise Users */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Franchise Order Portal
            </h1>
            <p className="text-muted-foreground">
              Order stock for your franchise from our premium tea collection
            </p>
            
            {/* Pricing Information Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Pricing Information</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• All base prices shown are exclusive of GST</li>
                    <li>• GST is calculated and added per product automatically</li>
                    <li>• Your cart total includes all applicable GST</li>
                    <li>• Final amount is what you pay (GST-inclusive)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Products Section */}
            <div className="lg:col-span-3">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search teas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="black-tea">Black Tea</SelectItem>
                    <SelectItem value="green-tea">Green Tea</SelectItem>
                    <SelectItem value="herbal-tea">Herbal Tea</SelectItem>
                    <SelectItem value="specialty-tea">Specialty Tea</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts?.map(product => 
                  <Card key={product.id} className="border-border hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-foreground text-sm">
                            {product.name}
                          </h3>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-muted-foreground ml-1">4.5</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex flex-col space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Base Price: ₹{product.price} (Excl. GST)
                            </div>
                            <div className="text-xs text-muted-foreground">
                              + GST ({(product as any).gst_rate || 18}%): ₹{(Number(product.price) * (((product as any).gst_rate || 18) / 100)).toFixed(2)}
                            </div>
                            <div className="text-lg font-bold text-primary">
                              = ₹{(Number(product.price) + (Number(product.price) * (((product as any).gst_rate || 18) / 100))).toFixed(2)} (Total)
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-xs">
                              {(product.stock_quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                            <Button 
                              size="sm" 
                              onClick={() => addToCart(product)} 
                              disabled={(product.stock_quantity || 0) <= 0}
                              className="text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add ₹{(Number(product.price) + (Number(product.price) * (((product as any).gst_rate || 18) / 100))).toFixed(2)}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Cart ({cart.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length === 0 ? <p className="text-muted-foreground text-center py-8">
                      Your cart is empty
                    </p> : <>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {cart.map(item => {
                      const itemDetails = calculateItemDetails(item);
                      return <div key={item.id} className="flex items-center gap-3 p-3 bg-card rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{item.name}</h4>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <p>Base: ₹{itemDetails.basePrice.toFixed(2)} (Excl. GST)</p>
                                  <p>GST ({item.gstRate}%): ₹{itemDetails.gstAmount.toFixed(2)}</p>
                                  <p className="font-medium text-primary">Total: ₹{item.price.toFixed(2)} each</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 p-0">
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-sm font-medium w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 p-0">
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>;
                    })}
                      </div>
                      
                      <Separator />
                      
                       {/* Loyalty Points System */}
                      {user && loyaltyPoints && <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Available Points:</span>
                            <span className="font-medium">{loyaltyPoints.current_balance}</span>
                          </div>
                          
                          {/* Loyalty Rewards */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Loyalty Rewards</Label>
                            <div className="grid grid-cols-1 gap-2">
                              <Button
                                variant={loyaltyReward?.type === 'delivery' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  if (loyaltyReward?.type === 'delivery') {
                                    setLoyaltyReward(null);
                                  } else {
                                    setLoyaltyReward({ 
                                      type: 'delivery', 
                                      pointsUsed: 500, 
                                      description: 'Free Delivery',
                                      giftId: 'free-delivery'
                                    });
                                  }
                                }}
                                className="text-xs h-8"
                                disabled={loyaltyPoints.current_balance < 500}
                              >
                                Free Delivery (500 pts)
                              </Button>
                              <Button
                                variant={loyaltyReward?.type === 'tea_cups' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  if (loyaltyReward?.type === 'tea_cups') {
                                    setLoyaltyReward(null);
                                  } else {
                                    setLoyaltyReward({ 
                                      type: 'tea_cups', 
                                      pointsUsed: 500, 
                                      description: '30 Tea Cups',
                                      giftId: '30-tea-cups'
                                    });
                                  }
                                }}
                                className="text-xs h-8"
                                disabled={loyaltyPoints.current_balance < 500}
                              >
                                30 Tea Cups (500 pts)
                              </Button>
                            </div>
                            {loyaltyReward && (
                              <div className="text-xs bg-green-50 p-2 rounded border">
                                Selected: {loyaltyReward.description} ({loyaltyReward.pointsUsed} points)
                              </div>
                            )}
                          </div>
                          
                          {/* Custom Points Discount */}
                          <div className="space-y-2">
                            <Label>Points Discount (1 point = ₹1)</Label>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="number" 
                                value={customPoints} 
                                 onChange={e => {
                                   const points = parseInt(e.target.value) || 0;
                                   const usedPoints = loyaltyReward?.pointsUsed || 0;
                                   const validation = validateLoyaltyPointsUsage(
                                     points, 
                                     loyaltyPoints.current_balance, 
                                     subtotal, 
                                     usedPoints
                                   );
                                   if (validation.isValid) {
                                     setCustomPoints(points);
                                   } else if (validation.error) {
                                     toast.error(validation.error);
                                   }
                                 }}
                                placeholder="Points to redeem" 
                                min="0" 
                                max={Math.min(
                                  loyaltyPoints.current_balance - (loyaltyReward?.pointsUsed || 0), 
                                  Math.floor(subtotal * 0.3)
                                )} 
                                className="text-center"
                              />
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setCustomPoints(0)} 
                                disabled={customPoints === 0}
                              >
                                Clear
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Max: {Math.min(
                                loyaltyPoints.current_balance - (loyaltyReward?.pointsUsed || 0), 
                                Math.floor(subtotal * 0.3)
                              )} points (30% of order)
                            </p>
                          </div>
                        </div>}
                      
                      <Separator />
                      
                       {/* Order Summary */}
                       <div className="space-y-2">
                         <div className="flex justify-between text-sm text-muted-foreground">
                           <span>Subtotal (Incl. GST):</span>
                           <span>₹{subtotal.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-sm text-muted-foreground">
                           <span>Total GST Collected:</span>
                           <span>₹{totalGstAmount.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                           <span>Delivery Fee:</span>
                           <span className="text-orange-600 text-xs">
                             Will be reviewed by owner
                           </span>
                         </div>
                          {(customPoints > 0 || loyaltyReward) && <div className="flex justify-between text-sm text-green-600">
                              <span>Loyalty Discount:</span>
                              <span>-₹{orderCalculations.loyaltyDiscount}</span>
                            </div>}
                         <Separator />
                         <div className="flex justify-between font-semibold">
                           <span>Final Amount:</span>
                           <span>₹{total.toFixed(2)}</span>
                         </div>
                         <p className="text-xs text-muted-foreground">
                           *Final delivery fee will be added by admin
                         </p>
                       </div>
                      
                      <Button onClick={() => setIsCheckoutOpen(true)} className="w-full" disabled={cart.length === 0}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Checkout
                      </Button>
                    </>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={shippingAddress.name} onChange={e => setShippingAddress(prev => ({
                  ...prev,
                  name: e.target.value
                }))} placeholder="Your full name" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" value={shippingAddress.phone} onChange={e => setShippingAddress(prev => ({
                  ...prev,
                  phone: e.target.value
                }))} placeholder="Your phone number" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input id="address" value={shippingAddress.address} onChange={e => setShippingAddress(prev => ({
                ...prev,
                address: e.target.value
              }))} placeholder="Street address" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={shippingAddress.city} onChange={e => setShippingAddress(prev => ({
                  ...prev,
                  city: e.target.value
                }))} placeholder="City" />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" value={shippingAddress.state} onChange={e => setShippingAddress(prev => ({
                  ...prev,
                  state: e.target.value
                }))} placeholder="State" />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input id="pincode" value={shippingAddress.pincode} onChange={e => setShippingAddress(prev => ({
                  ...prev,
                  pincode: e.target.value
                }))} placeholder="Pincode" />
                </div>
              </div>
              <div>
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input id="landmark" value={shippingAddress.landmark} onChange={e => setShippingAddress(prev => ({
                ...prev,
                landmark: e.target.value
              }))} placeholder="Nearby landmark" />
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold">Order Summary</h3>
              {cart.map(item => <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>)}
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal (incl. GST):</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span className="text-orange-600 text-xs">
                    {loyaltyReward?.type === 'delivery' ? 'FREE (Reward)' : 'Will be reviewed by owner'}
                  </span>
                </div>
                {customPoints > 0 && <div className="flex justify-between text-sm text-green-600">
                    <span>Points Discount:</span>
                    <span>-₹{customPoints}</span>
                  </div>}
                {loyaltyReward && (
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>{loyaltyReward.description}:</span>
                    <span>{loyaltyReward.type === 'delivery' ? 'Applied' : 'Will be included'}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₹{total}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  *Final delivery fee will be added by admin
                </p>
              </div>
            </div>

            <Button onClick={handleCheckout} className="w-full" disabled={isCreatingOrder}>
              {isCreatingOrder ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>;
};
export default OrderPage;