import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Check, X, AlertCircle } from 'lucide-react';
import { usePackingItems, useUpdatePackingItem, useCompletePacking } from '@/hooks/usePackingManagement';
import { toast } from 'sonner';

interface PackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
}

const PackingModal: React.FC<PackingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber
}) => {
  const [packingNotes, setPackingNotes] = useState('');
  
  const { data: packingItems, isLoading } = usePackingItems(orderId);
  const updatePackingItem = useUpdatePackingItem();
  const completePacking = useCompletePacking();

  const totalItems = packingItems?.length || 0;
  const packedItems = packingItems?.filter(item => item.is_packed)?.length || 0;
  const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  const handleItemCheck = async (itemId: string, isPacked: boolean) => {
    try {
      await updatePackingItem.mutateAsync({
        itemId,
        isPacked,
        packedQuantity: isPacked ? packingItems?.find(item => item.id === itemId)?.quantity : 0
      });
    } catch (error) {
      console.error('Error updating packing item:', error);
    }
  };

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    const item = packingItems?.find(item => item.id === itemId);
    if (!item) return;

    try {
      await updatePackingItem.mutateAsync({
        itemId,
        packedQuantity: quantity,
        isPacked: quantity === item.quantity
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleCompletePacking = async () => {
    if (packedItems < totalItems) {
      toast.error('Please pack all items before completing');
      return;
    }

    try {
      await completePacking.mutateAsync({
        orderId,
        notes: packingNotes
      });
      onClose();
    } catch (error) {
      console.error('Error completing packing:', error);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Packing Checklist - Order #{orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Packing Progress</span>
                <span className="text-sm text-muted-foreground">
                  {packedItems}/{totalItems} items packed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Packing Items */}
          <div className="space-y-3">
            <h3 className="font-medium">Items to Pack</h3>
            {packingItems?.map((item) => (
              <Card key={item.id} className={`transition-all ${item.is_packed ? 'bg-green-50 border-green-200' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={item.is_packed}
                      onCheckedChange={(checked) => handleItemCheck(item.id, !!checked)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{item.products?.name}</h4>
                          {item.products?.sku && (
                            <p className="text-sm text-muted-foreground">SKU: {item.products.sku}</p>
                          )}
                        </div>
                        {item.is_packed && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`quantity-${item.id}`} className="text-sm">
                            Packed:
                          </Label>
                          <Input
                            id={`quantity-${item.id}`}
                            type="number"
                            value={item.packed_quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                            min={0}
                            max={item.quantity}
                            className="w-20 h-8"
                            disabled={updatePackingItem.isPending}
                          />
                          <span className="text-sm text-muted-foreground">
                            / {item.quantity}
                          </span>
                        </div>
                        
                        {item.packed_quantity < item.quantity && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">
                              {item.quantity - item.packed_quantity} remaining
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Packing Notes */}
          <div className="space-y-2">
            <Label htmlFor="packing-notes">Packing Notes (Optional)</Label>
            <Textarea
              id="packing-notes"
              value={packingNotes}
              onChange={(e) => setPackingNotes(e.target.value)}
              placeholder="Add any notes about the packing process..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleCompletePacking}
              disabled={packedItems < totalItems || completePacking.isPending}
              className="flex-1"
            >
              {completePacking.isPending ? 'Completing...' : 'Complete Packing'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackingModal;