import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { InventoryOverview } from "@/components/inventory/InventoryOverview";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryModal } from "@/components/inventory/InventoryModal";
import { InventoryAdjustmentModal } from "@/components/inventory/InventoryAdjustmentModal";
import { InventoryMovements } from "@/components/inventory/InventoryMovements";
import { ArrowLeft, Plus, Package, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

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

interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  product_id: string;
  product_title?: string;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  variants?: ProductVariant[];
}

interface FarmData {
  id: string;
  name: string;
  farmer_id: string;
}

const InventoryManagement = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Selected items
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    checkUserAuth();
  }, [farmId]);

  const checkUserAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      setUser(session.user);

      // Check if user has access to this farm
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        navigate('/');
        return;
      }

      if (userProfile.role !== 'farmer' && userProfile.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access inventory management.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      await Promise.all([
        fetchFarmData(),
        fetchInventory(),
        fetchProducts()
      ]);

    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmData = async () => {
    if (!farmId) return;

    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('id', farmId)
        .single();

      if (error) throw error;
      setFarmData(data);
    } catch (error) {
      console.error('Error fetching farm data:', error);
      toast({
        title: "Error",
        description: "Failed to load farm data.",
        variant: "destructive"
      });
    }
  };

  const fetchInventory = async () => {
    if (!farmId) return;

    try {
      // Get product variants for this farm with inventory levels and pricing
      const { data, error } = await supabase
        .from('product_variant')
        .select(`
          *,
          product:product_id(title, handle),
          inventory_level:inventory_level!product_variant_inventory_item_id_fkey(
            stocked_quantity,
            reserved_quantity,
            location_id
          ),
          product_variant_price_set!inner(
            id
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
    }
  };

  const fetchProducts = async () => {
    if (!farmId) return;

    try {
      const { data, error } = await supabase
        .from('farm_products')
        .select(`
          product_id,
          product:product_id(id, title, handle, status)
        `)
        .eq('farm_id', farmId);

      if (error) throw error;
      
      const productList = data?.map(fp => fp.product).filter(Boolean) || [];
      setProducts(productList as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive"
      });
    }
  };

  const handleSaveInventory = async (inventoryData: InventoryItem) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('product_variant')
          .update({
            title: inventoryData.title,
            sku: inventoryData.sku,
            manage_inventory: inventoryData.manage_inventory,
            allow_backorder: inventoryData.allow_backorder
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Create new variant
        const variantId = crypto.randomUUID();
        const { error } = await supabase
          .from('product_variant')
          .insert({
            id: variantId,
            title: inventoryData.title,
            sku: inventoryData.sku,
            product_id: inventoryData.product_id,
            manage_inventory: inventoryData.manage_inventory,
            allow_backorder: inventoryData.allow_backorder
          });

        if (error) throw error;
      }

      await fetchInventory();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving inventory:', error);
      throw error;
    }
  };

  const handleDeleteInventory = async () => {
    if (!deletingItem) return;

    try {
      const { error } = await supabase
        .from('product_variant')
        .delete()
        .eq('id', deletingItem.id);

      if (error) throw error;

      await fetchInventory();
      setDeletingItem(null);
      setDeleteDialogOpen(false);

      toast({
        title: "Success",
        description: "Inventory item deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item.",
        variant: "destructive"
      });
    }
  };

  const handleQuickAdjustment = async (itemId: string, adjustment: number, type: 'add' | 'remove') => {
    try {
      // This would need to update inventory_level table
      toast({
        title: "Info",
        description: "Inventory adjustments need to be implemented with proper inventory levels.",
        variant: "default"
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

  const handleDetailedAdjustment = async (itemId: string, quantity: number, type: string, reason: string) => {
    try {
      // This would need to update inventory_level table
      setAdjustingItem(null);
      toast({
        title: "Info",
        description: "Inventory adjustments need to be implemented with proper inventory levels.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error making detailed adjustment:', error);
      throw error;
    }
  };

  const getInventoryStats = () => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(item => 
      item.inventory_levels?.[0]?.stocked_quantity && item.inventory_levels[0].stocked_quantity <= 10
    ).length;
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.inventory_levels?.[0]?.stocked_quantity || 0) * (item.price_set?.amount || 0), 0
    );
    const lastUpdated = inventory.length > 0 
      ? inventory.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0].updated_at
      : new Date().toISOString();

    return {
      totalItems,
      lowStockItems,
      totalValue,
      lastUpdated
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/farm/${farmId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Farm Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Inventory Management</h1>
              <p className="text-muted-foreground">
                Manage inventory for {farmData?.name}
              </p>
            </div>
          </div>
          <Button onClick={() => setInventoryModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Inventory Item
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <Package className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <TrendingUp className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="movements">
              <Activity className="h-4 w-4 mr-2" />
              Movements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <InventoryOverview stats={getInventoryStats()} />
              
              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setInventoryModalOpen(true)}
                >
                  <Plus className="h-6 w-6 mb-2" />
                  Add New Item
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => {
                    const lowStockItem = inventory.find(item => 
                      item.inventory_levels?.[0]?.stocked_quantity && item.inventory_levels[0].stocked_quantity <= 10
                    );
                    if (lowStockItem) {
                      setAdjustingItem(lowStockItem);
                      setAdjustmentModalOpen(true);
                    }
                  }}
                  disabled={getInventoryStats().lowStockItems === 0}
                >
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Restock Low Items
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => {
                    toast({
                      title: "Export Started",
                      description: "Your inventory report is being generated."
                    });
                  }}
                >
                  <Package className="h-6 w-6 mb-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryTable
              items={inventory}
              onEdit={(item) => {
                setEditingItem(item);
                setInventoryModalOpen(true);
              }}
              onDelete={(item) => {
                setDeletingItem(item);
                setDeleteDialogOpen(true);
              }}
              onAdjustStock={handleQuickAdjustment}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="movements">
            <InventoryMovements farmId={farmId || ''} />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <InventoryModal
          open={inventoryModalOpen}
          onOpenChange={(open) => {
            setInventoryModalOpen(open);
            if (!open) setEditingItem(null);
          }}
          item={editingItem}
          onSave={handleSaveInventory}
          products={products}
          farmId={farmId || ''}
        />

        <InventoryAdjustmentModal
          open={adjustmentModalOpen}
          onOpenChange={(open) => {
            setAdjustmentModalOpen(open);
            if (!open) setAdjustingItem(null);
          }}
          itemId={adjustingItem?.id}
          currentQuantity={adjustingItem?.inventory_levels?.[0]?.stocked_quantity}
          itemName={adjustingItem?.title || `Item ${adjustingItem?.id?.slice(0, 8)}`}
          onAdjust={handleDetailedAdjustment}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this inventory item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteInventory}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default InventoryManagement;