import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface InventoryAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId?: string;
  currentQuantity?: number;
  itemName?: string;
  onAdjust: (itemId: string, quantity: number, type: string, reason: string) => Promise<void>;
}

export function InventoryAdjustmentModal({ 
  open, 
  onOpenChange, 
  itemId, 
  currentQuantity = 0, 
  itemName = '',
  onAdjust 
}: InventoryAdjustmentModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease' | 'set'>('increase');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  const adjustmentReasons = {
    increase: [
      "Received shipment",
      "Production completed",
      "Returned from customer",
      "Found additional stock",
      "Correction - counting error",
      "Other"
    ],
    decrease: [
      "Sale/Customer order",
      "Damaged/spoiled",
      "Expired/waste",
      "Quality control rejection",
      "Internal use",
      "Theft/loss",
      "Correction - counting error",
      "Other"
    ],
    set: [
      "Physical inventory count",
      "System reset",
      "Initial stock entry",
      "Correction",
      "Other"
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemId) {
      toast({
        title: "Error",
        description: "No item selected for adjustment.",
        variant: "destructive"
      });
      return;
    }

    if (quantity <= 0 && adjustmentType !== 'set') {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    if (adjustmentType === 'set' && quantity < 0) {
      toast({
        title: "Validation Error",
        description: "Quantity cannot be negative when setting stock level.",
        variant: "destructive"
      });
      return;
    }

    if (adjustmentType === 'decrease' && quantity > currentQuantity) {
      toast({
        title: "Validation Error",
        description: `Cannot decrease by ${quantity}. Current quantity is only ${currentQuantity}.`,
        variant: "destructive"
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for the adjustment.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onAdjust(itemId, quantity, adjustmentType, reason);
      onOpenChange(false);
      setQuantity(1);
      setReason('');
      toast({
        title: "Success",
        description: "Inventory adjustment completed successfully."
      });
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      toast({
        title: "Error",
        description: "Failed to adjust inventory. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getNewQuantity = () => {
    switch (adjustmentType) {
      case 'increase':
        return currentQuantity + quantity;
      case 'decrease':
        return Math.max(0, currentQuantity - quantity);
      case 'set':
        return quantity;
      default:
        return currentQuantity;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Inventory</DialogTitle>
          <DialogDescription>
            Make adjustments to inventory levels for: <strong>{itemName}</strong>
            <br />
            Current quantity: <strong>{currentQuantity}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={(value: 'increase' | 'decrease' | 'set') => setAdjustmentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Increase Stock</SelectItem>
                <SelectItem value="decrease">Decrease Stock</SelectItem>
                <SelectItem value="set">Set Stock Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              {adjustmentType === 'set' ? 'New Quantity' : 'Adjustment Quantity'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min={adjustmentType === 'set' ? "0" : "1"}
              max={adjustmentType === 'decrease' ? currentQuantity : undefined}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="Enter quantity"
            />
            <div className="text-sm text-muted-foreground">
              New quantity will be: <strong>{getNewQuantity()}</strong>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {adjustmentReasons[adjustmentType].map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reason === 'Other' && (
              <Textarea
                placeholder="Please specify the reason..."
                value={reason === 'Other' ? '' : reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Apply Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}