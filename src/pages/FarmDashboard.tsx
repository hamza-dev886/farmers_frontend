import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash, 
  Eye,
  ArrowLeft,
  Wheat,
  ShoppingCart
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { User } from "@supabase/supabase-js";

interface FarmData {
  id: string;
  name: string;
  address: string;
  bio: string;
  contact_person: string;
  email: string;
  phone: string;
  location: any;
  created_at: string;
  farmer_id: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  handle: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Inventory {
  id: string;
  variant_id: string;
  farm_id: string;
  quantity_available: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  location: string;
  notes: string;
  last_updated_by: string;
  created_at: string;
  updated_at: string;
}

interface CurrentPlan {
  plan_name: string;
  price: string;
  billing_cycle: string;
  assigned_at: string;
  max_products: number;
  transaction_fee: number;
  can_create_multiple_stand: boolean;
  allowed_to_business_in_multiple_location: boolean;
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockItems: number;
  totalInventoryValue: number;
}

const FarmDashboard = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    lowStockItems: 0,
    totalInventoryValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({});
  const [inventoryFormData, setInventoryFormData] = useState<Partial<Inventory>>({});
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAuth();
  }, [farmId]);

  const checkUserAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/');
        return;
      }

      setUser(session.user);

      // Check if user is farmer and owns this farm
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'farmer') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access this farm dashboard."
        });
        navigate('/');
        return;
      }

      await fetchFarmData();
      await fetchCurrentPlan();
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
      
      await fetchProducts();
      await fetchInventory();
    } catch (error) {
      console.error('Error fetching farm data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load farm data."
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
          product (
            id,
            title,
            handle,
            description,
            status,
            created_at,
            updated_at
          )
        `)
        .eq('farm_id', farmId);

      if (error) throw error;

      const formattedProducts = (data || []).map(item => ({
        id: item.product?.id || '',
        title: item.product?.title || item.product?.handle || 'Untitled Product', 
        description: item.product?.description || '',
        handle: item.product?.handle || '',
        status: item.product?.status || 'draft',
        created_at: item.product?.created_at || '',
        updated_at: item.product?.updated_at || ''
      }));

      setProducts(formattedProducts);
      
      // Update stats
      const total = formattedProducts.length;
      const active = formattedProducts.filter(p => p.status === 'published').length;
      
      setStats(prev => ({
        ...prev,
        totalProducts: total,
        activeProducts: active
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchInventory = async () => {
    if (!farmId) return;

    try {
      const { data, error } = await supabase
        .from('inventory_tracking')
        .select('*')
        .eq('farm_id', farmId);

      if (error) throw error;

      setInventory(data || []);
      
      // Update stats for low stock items
      const lowStock = (data || []).filter(item => 
        item.quantity_available <= item.low_stock_threshold
      ).length;
      
      setStats(prev => ({
        ...prev,
        lowStockItems: lowStock
      }));
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchCurrentPlan = async () => {
    console.log('fetchCurrentPlan called, user:', user);
    if (!user) {
      console.log('No user found, skipping pricing plan fetch');
      return;
    }

    try {
      console.log('Fetching pricing plan for user ID:', user.id);
      const { data, error } = await supabase
        .from('farm_pricing_plans')
        .select(`
          assigned_at,
          pricing_plans (
            name,
            price,
            billing_cycle,
            max_number_of_product,
            transaction_fee,
            can_create_multiple_stand,
            allowed_to_business_in_multiple_location
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      console.log('Pricing plan query result:', { data, error });

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        console.log('Setting pricing plan data:', data);
        setCurrentPlan({
          plan_name: data.pricing_plans?.name || 'Unknown',
          price: data.pricing_plans?.price || 'N/A',
          billing_cycle: data.pricing_plans?.billing_cycle || 'N/A',
          assigned_at: data.assigned_at,
          max_products: data.pricing_plans?.max_number_of_product || 0,
          transaction_fee: data.pricing_plans?.transaction_fee || 0,
          can_create_multiple_stand: data.pricing_plans?.can_create_multiple_stand || false,
          allowed_to_business_in_multiple_location: data.pricing_plans?.allowed_to_business_in_multiple_location || false
        });
      } else {
        console.log('No pricing plan data found, setting default values');
        setCurrentPlan({
          plan_name: 'No Plan',
          price: 'N/A',
          billing_cycle: 'N/A',
          assigned_at: null,
          max_products: 0,
          transaction_fee: 0,
          can_create_multiple_stand: false,
          allowed_to_business_in_multiple_location: false
        });
      }
    } catch (error) {
      console.error('Error fetching current plan:', error);
      setCurrentPlan({
        plan_name: 'Error',
        price: 'N/A',
        billing_cycle: 'N/A',
        assigned_at: null,
        max_products: 0,
        transaction_fee: 0,
        can_create_multiple_stand: false,
        allowed_to_business_in_multiple_location: false
      });
    }
  };

  const handleAddProduct = async () => {
    if (!farmId || !productFormData.title || !productFormData.description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields."
      });
      return;
    }

    try {
      // Create a unique handle from title if not provided
      const productHandle = productFormData.handle || productFormData.title?.toLowerCase().replace(/\s+/g, '-') || '';
      
      // Create product first - the product table requires an ID to be provided
      const productId = crypto.randomUUID();
      const { data: productData, error: productError } = await supabase
        .from('product')
        .insert({
          id: productId,
          handle: productHandle,
          title: productFormData.title || 'Untitled Product'
        })
        .select()
        .single();

      if (productError) throw productError;

      // Link product to farm
      const { error: linkError } = await supabase
        .from('farm_products')
        .insert({
          farm_id: farmId,
          product_id: productData.id
        });

      if (linkError) throw linkError;

      toast({
        title: "Success",
        description: "Product added successfully."
      });

      setProductModalOpen(false);
      setProductFormData({});
      await fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product."
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingItem || !productFormData.title || !productFormData.description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('product')
        .update({
          title: productFormData.title,
          handle: productFormData.handle || productFormData.title?.toLowerCase().replace(/\s+/g, '-') || '',
          description: productFormData.description,
          status: productFormData.status
        })
        .eq('id', editingItem);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully."
      });

      setProductModalOpen(false);
      setEditingItem(null);
      setProductFormData({});
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product."
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedItem) return;

    try {
      // Delete from farm_products first (foreign key constraint)
      const { error: linkError } = await supabase
        .from('farm_products')
        .delete()
        .eq('product_id', selectedItem.id)
        .eq('farm_id', farmId);

      if (linkError) throw linkError;

      // Delete from product table
      const { error: productError } = await supabase
        .from('product')
        .delete()
        .eq('id', selectedItem.id);

      if (productError) throw productError;

      toast({
        title: "Success",
        description: "Product deleted successfully."
      });

      setDeleteDialogOpen(false);
      setSelectedItem(null);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product."
      });
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingItem(product.id);
    setProductFormData(product);
    setProductModalOpen(true);
  };

  const openDeleteDialog = (item: any) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading farm dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/farmer-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Farmer Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {farmData?.name || 'Farm Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Manage products and inventory for {farmData?.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Wheat className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <ShoppingCart className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Limit</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-600">
                {stats.totalProducts} / {currentPlan?.max_products === 0 ? '∞' : currentPlan?.max_products || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Farm Information</CardTitle>
                <CardDescription>Overview of {farmData?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {farmData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Farm Name</p>
                            <p className="text-lg">{farmData.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                            <p>{farmData.contact_person}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p>{farmData.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                            <p>{farmData.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Location & Description</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                            <p>{farmData.address}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Farm Bio</p>
                            <p className="text-sm">{farmData.bio || 'No description available'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Created</p>
                            <p>{new Date(farmData.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Farm information not available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your farm products and listings</CardDescription>
                </div>
                <Button 
                  onClick={() => setProductModalOpen(true)}
                  disabled={currentPlan?.max_products !== 0 && stats.totalProducts >= (currentPlan?.max_products || 0)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Handle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>{product.handle}</TableCell>
                        <TableCell>
                          <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(product.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(product)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {products.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No products found. Add your first product!</p>
                    {currentPlan?.max_products !== 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Your current plan allows up to {currentPlan?.max_products || 0} products.
                      </p>
                    )}
                  </div>
                )}
                {currentPlan?.max_products !== 0 && stats.totalProducts >= (currentPlan?.max_products || 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-yellow-800">
                      You've reached your plan limit of {currentPlan?.max_products} products. 
                      Upgrade your plan to add more products.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>Track your product inventory and stock levels</CardDescription>
                </div>
                <Button onClick={() => setInventoryModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inventory
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Low Stock Alert</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.location || 'Main Storage'}</TableCell>
                        <TableCell>{item.quantity_available}</TableCell>
                        <TableCell>{item.quantity_reserved}</TableCell>
                        <TableCell>{item.low_stock_threshold}</TableCell>
                        <TableCell>
                          <Badge variant={item.quantity_available <= item.low_stock_threshold ? 'destructive' : 'default'}>
                            {item.quantity_available <= item.low_stock_threshold ? 'Low Stock' : 'In Stock'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {inventory.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No inventory items found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product Modal */}
        <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update product information' : 'Add a new product to your farm'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-title">Product Title *</Label>
                <Input
                  id="product-title"
                  value={productFormData.title || ''}
                  onChange={(e) => setProductFormData({...productFormData, title: e.target.value})}
                  placeholder="Enter product title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product-description">Description *</Label>
                <Textarea
                  id="product-description"
                  value={productFormData.description || ''}
                  onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                  placeholder="Describe your product"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product-handle">Handle</Label>
                <Input
                  id="product-handle"
                  value={productFormData.handle || ''}
                  onChange={(e) => setProductFormData({...productFormData, handle: e.target.value})}
                  placeholder="product-handle (auto-generated if empty)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product-status">Status</Label>
                <Select
                  value={productFormData.status || 'draft'}
                  onValueChange={(value) => setProductFormData({...productFormData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setProductModalOpen(false);
                setEditingItem(null);
                setProductFormData({});
              }}>
                Cancel
              </Button>
              <Button onClick={editingItem ? handleUpdateProduct : handleAddProduct}>
                {editingItem ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product
                "{selectedItem?.title}" and remove it from your farm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default FarmDashboard;