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
  barcode?: string;
  ean?: string;
  upc?: string;
  product_id: string;
  manage_inventory: boolean;
  allow_backorder: boolean;
  hs_code?: string;
  origin_country?: string;
  mid_code?: string;
  material?: string;
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  variant_rank?: number;
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
        barcode: '',
        ean: '',
        upc: '',
        product_id: '',
        manage_inventory: true,
        allow_backorder: false,
        hs_code: '',
        origin_country: '',
        mid_code: '',
        material: '',
        weight: undefined,
        length: undefined,
        height: undefined,
        width: undefined,
        variant_rank: 0
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

          <div className="grid grid-cols-3 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                placeholder="123456789"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ean">EAN</Label>
              <Input
                id="ean"
                value={formData.ean || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ean: e.target.value }))}
                placeholder="EAN code"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="upc">UPC</Label>
              <Input
                id="upc"
                value={formData.upc || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, upc: e.target.value }))}
                placeholder="UPC code"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                placeholder="e.g., Cotton, Wood"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="origin_country">Origin Country</Label>
              <Input
                id="origin_country"
                value={formData.origin_country || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, origin_country: e.target.value }))}
                placeholder="e.g., USA, China"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="weight">Weight (g)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="length">Length (cm)</Label>
              <Input
                id="length"
                type="number"
                value={formData.length || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="width">Width (cm)</Label>
              <Input
                id="width"
                type="number"
                value={formData.width || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="15"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="hs_code">HS Code</Label>
              <Input
                id="hs_code"
                value={formData.hs_code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, hs_code: e.target.value }))}
                placeholder="e.g., 1234.56.78"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mid_code">MID Code</Label>
              <Input
                id="mid_code"
                value={formData.mid_code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mid_code: e.target.value }))}
                placeholder="MID code"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="variant_rank">Variant Rank</Label>
            <Input
              id="variant_rank"
              type="number"
              value={formData.variant_rank || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, variant_rank: parseInt(e.target.value) || 0 }))}
              placeholder="0"
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