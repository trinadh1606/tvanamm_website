import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  useEnhancedLoyaltyGifts, 
  useUpdateLoyaltyGift, 
  useCreateLoyaltyGift, 
  useAdjustGiftStock,
  useRealTimeLoyaltyData 
} from '@/hooks/useEnhancedLoyalty';
import { 
  Gift, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Package, 
  Coins,
  Settings,
  Truck,
  Star
} from 'lucide-react';

interface GiftFormData {
  name: string;
  description: string;
  points_required: number;
  stock_quantity: number;
  image_url: string;
  is_active: boolean;
  can_edit: boolean;
  auto_update_stock: boolean;
}

export default function EnhancedLoyaltyGiftManagement() {
  const { data: gifts, isLoading } = useEnhancedLoyaltyGifts();
  const updateGift = useUpdateLoyaltyGift();
  const createGift = useCreateLoyaltyGift();
  const adjustStock = useAdjustGiftStock();
  const { setupRealtimeSubscriptions } = useRealTimeLoyaltyData();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, reason: '' });
  
  const [formData, setFormData] = useState<GiftFormData>({
    name: '',
    description: '',
    points_required: 0,
    stock_quantity: 0,
    image_url: '',
    is_active: true,
    can_edit: true,
    auto_update_stock: true
  });

  // Setup real-time subscriptions
  useEffect(() => {
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, [setupRealtimeSubscriptions]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      points_required: 0,
      stock_quantity: 0,
      image_url: '',
      is_active: true,
      can_edit: true,
      auto_update_stock: true
    });
  };

  const handleCreateGift = async () => {
    try {
      await createGift.mutateAsync(formData);
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  const handleEditGift = (gift: any) => {
    setSelectedGift(gift);
    setFormData({
      name: gift.name,
      description: gift.description || '',
      points_required: gift.points_required,
      stock_quantity: gift.stock_quantity || 0,
      image_url: gift.image_url || '',
      is_active: gift.is_active,
      can_edit: gift.can_edit,
      auto_update_stock: gift.auto_update_stock
    });
    setEditDialogOpen(true);
  };

  const handleUpdateGift = async () => {
    if (!selectedGift) return;
    
    try {
      await updateGift.mutateAsync({
        giftId: selectedGift.id,
        updates: formData
      });
      setEditDialogOpen(false);
      setSelectedGift(null);
      resetForm();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const toggleGiftStatus = async (giftId: string, currentStatus: boolean) => {
    try {
      await updateGift.mutateAsync({
        giftId,
        updates: { is_active: !currentStatus }
      });
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const handleStockAdjustment = (gift: any) => {
    setSelectedGift(gift);
    setStockAdjustment({ quantity: gift.stock_quantity || 0, reason: '' });
    setStockDialogOpen(true);
  };

  const submitStockAdjustment = async () => {
    if (!selectedGift) return;
    
    try {
      await adjustStock.mutateAsync({
        giftId: selectedGift.id,
        newQuantity: stockAdjustment.quantity,
        reason: stockAdjustment.reason
      });
      setStockDialogOpen(false);
      setSelectedGift(null);
      setStockAdjustment({ quantity: 0, reason: '' });
    } catch (error) {
      console.error('Stock adjustment failed:', error);
    }
  };

  const getGiftTypeIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('delivery') || lowerName.includes('shipping')) return Truck;
    if (lowerName.includes('discount') || lowerName.includes('voucher')) return Coins;
    if (lowerName.includes('premium') || lowerName.includes('special')) return Star;
    return Gift;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Loyalty Gift Management</h1>
          <p className="text-muted-foreground">Manage rewards, stock levels, and redemption options</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Gift
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gifts?.map((gift) => {
          const IconComponent = getGiftTypeIcon(gift.name);
          
          return (
            <Card key={gift.id} className={`relative ${!gift.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{gift.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {gift.points_required} points
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge variant={gift.is_active ? 'default' : 'secondary'}>
                      {gift.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {gift.description || 'No description available'}
                </p>

                {/* Stock Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stock:</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={gift.stock_quantity > 0 ? 'outline' : 'secondary'}
                      className={gift.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}
                    >
                      {gift.stock_quantity || 0} available
                    </Badge>
                    {gift.auto_update_stock && (
                      <Badge variant="outline" className="text-xs">
                        Auto-update
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {gift.can_edit && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditGift(gift)}
                      disabled={updateGift.isPending}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStockAdjustment(gift)}
                    disabled={adjustStock.isPending}
                  >
                    <Package className="h-3 w-3 mr-1" />
                    Stock
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant={gift.is_active ? "destructive" : "default"}
                    onClick={() => toggleGiftStatus(gift.id, gift.is_active)}
                    disabled={updateGift.isPending}
                    className="col-span-2"
                  >
                    {gift.is_active ? (
                      <>
                        <ToggleLeft className="h-3 w-3 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <ToggleRight className="h-3 w-3 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {gifts?.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No gifts available</h3>
          <p className="text-muted-foreground mb-4">
            Create your first loyalty gift to get started.
          </p>
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Gift
          </Button>
        </div>
      )}

      {/* Create/Edit Gift Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          setSelectedGift(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialogOpen ? 'Edit Gift' : 'Create New Gift'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Gift Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Free Delivery Voucher"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the gift benefits..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Points Required *</Label>
                <Input
                  type="number"
                  value={formData.points_required}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    points_required: parseInt(e.target.value) || 0 
                  }))}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Initial Stock</Label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    stock_quantity: parseInt(e.target.value) || 0 
                  }))}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image URL (Optional)</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.webp"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active Status</Label>
                  <p className="text-xs text-muted-foreground">Gift available for redemption</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Editable</Label>
                  <p className="text-xs text-muted-foreground">Allow future modifications</p>
                </div>
                <Switch
                  checked={formData.can_edit}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_edit: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Update Stock</Label>
                  <p className="text-xs text-muted-foreground">Reduce stock on redemption</p>
                </div>
                <Switch
                  checked={formData.auto_update_stock}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_update_stock: checked }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (editDialogOpen) {
                    setEditDialogOpen(false);
                  } else {
                    setCreateDialogOpen(false);
                  }
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={editDialogOpen ? handleUpdateGift : handleCreateGift}
                disabled={!formData.name || formData.points_required <= 0 || createGift.isPending || updateGift.isPending}
                className="flex-1"
              >
                {createGift.isPending || updateGift.isPending ? 
                  'Saving...' : 
                  (editDialogOpen ? 'Update Gift' : 'Create Gift')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
          </DialogHeader>
          
          {selectedGift && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-medium">{selectedGift.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Current stock: {selectedGift.stock_quantity || 0}
                </p>
              </div>

              <div className="space-y-2">
                <Label>New Stock Quantity</Label>
                <Input
                  type="number"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment(prev => ({ 
                    ...prev, 
                    quantity: parseInt(e.target.value) || 0 
                  }))}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Reason for Adjustment</Label>
                <Textarea
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment(prev => ({ 
                    ...prev, 
                    reason: e.target.value 
                  }))}
                  placeholder="Explain the reason for this stock adjustment..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStockDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitStockAdjustment}
                  disabled={adjustStock.isPending || !stockAdjustment.reason.trim()}
                  className="flex-1"
                >
                  {adjustStock.isPending ? 'Updating...' : 'Update Stock'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}