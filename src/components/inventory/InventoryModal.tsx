import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id?: string;
  variant_id: string;
  farm_id: string;
  quantity_available: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  location: string;
  notes: string;
}

interface Product {
  id: string;
  title: string;
  variants?: Array<{ id: string; title?: string; sku?: string; }>;
}

interface InventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSave: (item: InventoryItem) => Promise<void>;
  products: Product[];
  farmId: string;
}

export function InventoryModal({ open, onOpenChange, item, onSave, products, farmId }: InventoryModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InventoryItem>({
    variant_id: '',
    farm_id: farmId,
    quantity_available: 0,
    quantity_reserved: 0,
    low_stock_threshold: 10,
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        variant_id: '',
        farm_id: farmId,
        quantity_available: 0,
        quantity_reserved: 0,
        low_stock_threshold: 10,
        location: '',
        notes: ''
      });
    }
  }, [item, farmId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.variant_id) {
      toast({
        title: "Validation Error",
        description: "Please select a product variant.",
        variant: "destructive"
      });
      return;
    }

    if (formData.quantity_available < 0) {
      toast({
        title: "Validation Error", 
        description: "Available quantity cannot be negative.",
        variant: "destructive"
      });
      return;
    }

    if (formData.low_stock_threshold < 0) {
      toast({
        title: "Validation Error",
        description: "Low stock threshold cannot be negative.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
      toast({
        title: "Success",
        description: item ? "Inventory item updated successfully." : "Inventory item created successfully."
      });
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to save inventory item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const commonLocations = [
    "Main Storage",
    "Greenhouse 1", 
    "Greenhouse 2",
    "Cold Storage",
    "Processing Area",
    "Packaging Area",
    "Field Storage",
    "Barn",
    "Warehouse"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update inventory details and stock levels.' : 'Add a new inventory item to track stock levels.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="variant_id">Product *</Label>
            <Select 
              value={formData.variant_id} 
              onValueChange={(value) => setFormData({...formData, variant_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select 
              value={formData.location || ''} 
              onValueChange={(value) => setFormData({...formData, location: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select or type location" />
              </SelectTrigger>
              <SelectContent>
                {commonLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Or enter custom location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_available">Available Quantity *</Label>
              <Input
                id="quantity_available"
                type="number"
                min="0"
                value={formData.quantity_available}
                onChange={(e) => setFormData({...formData, quantity_available: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity_reserved">Reserved Quantity</Label>
              <Input
                id="quantity_reserved"
                type="number"
                min="0"
                value={formData.quantity_reserved}
                onChange={(e) => setFormData({...formData, quantity_reserved: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
              <Input
                id="low_stock_threshold"
                type="number"
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({...formData, low_stock_threshold: parseInt(e.target.value) || 0})}
                placeholder="10"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add any notes about this inventory item..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}