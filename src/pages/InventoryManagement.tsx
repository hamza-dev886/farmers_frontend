import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryModal } from '@/components/inventory/InventoryModal';

interface InventoryItem {
  id: string;
  product_id: string;
  title: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  weight?: number;
  inventory_quantity: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  options?: any;
  created_at: string;
  updated_at: string;
  product?: {
    title: string;
    handle: string;
  };
}

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
}

export default function InventoryManagement() {
  const { farmId } = useParams<{ farmId: string }>();
  const { toast } = useToast();
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!farmId) return;
    
    try {
      const { data, error } = await supabase
        .from('product')
        .select(`
          id,
          title,
          handle,
          status,
          farm_products!inner(
            farm_id
          )
        `)
        .eq('farm_products.farm_id', farmId);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [farmId]);

  const fetchInventory = useCallback(async () => {
    if (!farmId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          product!inner(
            title,
            handle,
            farm_products!inner(
              farm_id
            )
          )
        `)
        .eq('product.farm_products.farm_id', farmId);

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [farmId, toast]);

  useEffect(() => {
    if (farmId) {
      fetchProducts();
      fetchInventory();
    }
  }, [farmId, fetchProducts, fetchInventory]);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (itemData: InventoryItem) => {
    try {
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('product_variants')
          .update({
            title: itemData.title,
            sku: itemData.sku,
            price: itemData.price,
            compare_at_price: itemData.compare_at_price,
            weight: itemData.weight,
            inventory_quantity: itemData.inventory_quantity,
            track_inventory: itemData.track_inventory,
            allow_backorders: itemData.allow_backorders,
            options: itemData.options || {}
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Create new item
        const { error } = await supabase
          .from('product_variants')
          .insert({
            product_id: itemData.product_id,
            title: itemData.title,
            sku: itemData.sku,
            price: itemData.price,
            compare_at_price: itemData.compare_at_price,
            weight: itemData.weight,
            inventory_quantity: itemData.inventory_quantity,
            track_inventory: itemData.track_inventory,
            allow_backorders: itemData.allow_backorders,
            options: itemData.options || {}
          });

        if (error) throw error;
      }

      await fetchInventory();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      throw error;
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    try {
      const { error } = await supabase.from('product_variants').delete().eq('id', item.id);
      
      if (error) throw error;
      
      await fetchInventory();
      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item.",
        variant: "destructive"
      });
    }
  };

  const handleAdjustStock = async (itemId: string, adjustmentAmount: number, type: 'add' | 'remove') => {
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;

      const newQuantity = type === 'add' 
        ? item.inventory_quantity + adjustmentAmount
        : Math.max(0, item.inventory_quantity - adjustmentAmount);

      const { error } = await supabase
        .from('product_variants')
        .update({ 
          inventory_quantity: newQuantity
        })
        .eq('id', itemId);

      if (error) throw error;

      await fetchInventory();
      
      toast({
        title: "Stock Updated",
        description: `Inventory adjusted by ${type === 'add' ? '+' : '-'}${adjustmentAmount}`,
      });
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        title: "Error",
        description: "Failed to adjust stock level.",
        variant: "destructive"
      });
    }
  };

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.inventory_quantity < 10).length;
  const outOfStockItems = inventory.filter(item => item.inventory_quantity === 0).length;

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'low' && item.inventory_quantity < 10) ||
                         (filterStatus === 'out' && item.inventory_quantity === 0);
    
    return matchesSearch && matchesFilter;
  });

  if (!farmId) {
    return <div>Farm not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your product variants and track inventory levels
          </p>
        </div>
        <Button onClick={handleAddItem} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product Variant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Product variants in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items with less than 10 units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Items with 0 units</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            View and manage all your product variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, SKU, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: 'all' | 'low' | 'out') => setFilterStatus(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <InventoryTable
            items={filteredInventory}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onAdjustStock={handleAdjustStock}
            loading={loading}
          />
        </CardContent>
      </Card>

      <InventoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={editingItem}
        onSave={handleSaveItem}
        products={products}
        farmId={farmId}
      />
    </div>
  );
}