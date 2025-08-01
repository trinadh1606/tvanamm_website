import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Package } from 'lucide-react';
import { useShipOrder } from '@/hooks/usePackingManagement';

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
}

const ShippingModal: React.FC<ShippingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber
}) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [transportCompany, setTransportCompany] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverContact, setDriverContact] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  
  const shipOrder = useShipOrder();

  const courierOptions = [
    'Blue Dart',
    'FedEx',
    'DHL',
    'India Post',
    'DTDC',
    'Ecom Express',
    'Delhivery',
    'Local Transport',
    'Bus Service',
    'Other'
  ];

  const handleShip = async () => {
    if (!trackingNumber.trim() || !courierPartner) {
      return;
    }

    const trackingInfo = {
      trackingNumber: trackingNumber.trim(),
      courierPartner,
      transportCompany: transportCompany.trim() || courierPartner,
      driverName: driverName.trim(),
      driverContact: driverContact.trim(),
      vehicleNumber: vehicleNumber.trim(),
      estimatedDelivery: estimatedDelivery.trim(),
      specialInstructions: specialInstructions.trim(),
      pickupLocation: pickupLocation.trim(),
      shippedAt: new Date().toISOString()
    };

    try {
      await shipOrder.mutateAsync({
        orderId,
        trackingNumber: trackingNumber.trim(),
        courierPartner,
        additionalInfo: trackingInfo
      });
      onClose();
      // Reset all fields
      setTrackingNumber('');
      setCourierPartner('');
      setTransportCompany('');
      setDriverName('');
      setDriverContact('');
      setVehicleNumber('');
      setEstimatedDelivery('');
      setSpecialInstructions('');
      setPickupLocation('');
    } catch (error) {
      console.error('Error shipping order:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Ship Order #{orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">Order is packed and ready to ship</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courier">Courier/Transport Partner *</Label>
                <Select value={courierPartner} onValueChange={setCourierPartner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select courier partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {courierOptions.map((courier) => (
                      <SelectItem key={courier} value={courier}>
                        {courier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transportCompany">Transport Company Name</Label>
                <Input
                  id="transportCompany"
                  value={transportCompany}
                  onChange={(e) => setTransportCompany(e.target.value)}
                  placeholder="e.g., TSRTC, VRL Logistics"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tracking">Tracking/AWB Number *</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <Label htmlFor="vehicleNumber">Vehicle/Bus Number</Label>
                <Input
                  id="vehicleNumber"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g., AP 09 AA 1234"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driverName">Driver/Contact Person Name</Label>
                <Input
                  id="driverName"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Enter driver name"
                />
              </div>

              <div>
                <Label htmlFor="driverContact">Driver Contact Number</Label>
                <Input
                  id="driverContact"
                  value={driverContact}
                  onChange={(e) => setDriverContact(e.target.value)}
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedDelivery">Estimated Delivery Time</Label>
                <Input
                  id="estimatedDelivery"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  placeholder="e.g., 2-3 days, Tomorrow 5 PM"
                />
              </div>

              <div>
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Warehouse/Office address"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="specialInstructions">Special Handling Instructions</Label>
              <Input
                id="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., Handle with care, Fragile items, Call before delivery"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleShip}
              disabled={!trackingNumber.trim() || !courierPartner || shipOrder.isPending}
              className="flex-1"
            >
              {shipOrder.isPending ? 'Shipping...' : 'Ship Order'}
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

export default ShippingModal;