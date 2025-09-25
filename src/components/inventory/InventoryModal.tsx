import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  title: string;
  sku?: string;
  product_id: string;
  manage_inventory: boolean;
  allow_backorder: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    title: string;
    handle: string;
  };
  inventory_levels?: {
    stocked_quantity: number;
    reserved_quantity: number;
    location_id: string;
  }[];
  price_set?: {
    amount: number;
    currency_code: string;
  };
}

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
}

interface InventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onSave: (item: InventoryItem) => Promise<void>;
  products: Product[];
  farmId: string;
}

export const InventoryModal = ({ open, onOpenChange, item, onSave, products, farmId }: InventoryModalProps) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        title: '',
        sku: '',
        product_id: '',
        manage_inventory: true,
        allow_backorder: false
      });
    }
  }, [item]);

  const handleSave = async () => {
    if (!formData.title || !formData.product_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSave(formData as InventoryItem);
      toast({
        title: "Success",
        description: item ? "Inventory item updated successfully." : "Inventory item created successfully."
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save inventory item.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the inventory item details.' : 'Create a new inventory item for your farm.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="product_id">Product *</Label>
            <Select
              value={formData.product_id || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
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

          <div className="grid gap-2">
            <Label htmlFor="title">Variant Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Red - Large"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="e.g., RED-LG-001"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="manage_inventory"
              checked={formData.manage_inventory || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, manage_inventory: checked }))}
            />
            <Label htmlFor="manage_inventory">Manage inventory</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allow_backorder"
              checked={formData.allow_backorder || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_backorder: checked }))}
            />
            <Label htmlFor="allow_backorder">Allow backorders</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};