import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import TrackingDetails from './TrackingDetails';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const TrackingModal: React.FC<TrackingModalProps> = ({ isOpen, onClose, order }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Track Order {order?.order_number}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {order && <TrackingDetails order={order} />}
      </DialogContent>
    </Dialog>
  );
};

export default TrackingModal;