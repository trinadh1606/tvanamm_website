import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useDeleteProduct } from '@/hooks/useProductManagement';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    if (!product) return;
    
    try {
      await deleteProduct.mutateAsync(product.id);
      onClose();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Product
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the product.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are about to delete "{product.name}" (SKU: {product.sku}).
              This will remove all product information permanently.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm font-medium">Product Details:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Name: {product.name}</p>
              <p>SKU: {product.sku}</p>
              <p>Current Stock: {product.stock_quantity}</p>
              <p>Price: ₹{product.price}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="flex-1"
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete Product'}
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

export default DeleteProductModal;