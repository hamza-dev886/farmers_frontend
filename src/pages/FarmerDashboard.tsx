import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Settings, 
  Plus, 
  Edit, 
  Trash, 
  Eye,
  TrendingUp,
  ShoppingCart,
  Wheat,
  DollarSign
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

const FarmerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isFarmer, setIsFarmer] = useState(false);
  const [farmData, setFarmData] = useState<FarmData[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null);
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
  const [farmModalOpen, setFarmModalOpen] = useState(false);
  const [addFarmModalOpen, setAddFarmModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [farmFormData, setFarmFormData] = useState<Partial<FarmData>>({});
  const [newFarmFormData, setNewFarmFormData] = useState<Partial<FarmData>>({});
  const [productFormData, setProductFormData] = useState<Partial<Product>>({});
  const [inventoryFormData, setInventoryFormData] = useState<Partial<Inventory>>({});
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/');
        return;
      }

      setUser(session.user);

      // Check if user is farmer
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'farmer') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access the farmer dashboard."
        });
        navigate('/');
        return;
      }

      setIsFarmer(true);
      await fetchCurrentPlan(session.user);
      await fetchFarmData(session.user);
      await fetchProducts();
      await fetchInventory();
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmData = async (currentUser?: any) => {
    const userId = currentUser?.id || user?.id;
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('farmer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFarmData(data || []);
      if (data && data.length > 0 && !selectedFarm) {
        setSelectedFarm(data[0]);
      }
    } catch (error) {
      console.error('Error fetching farm data:', error);
    }
  };

  const fetchProducts = async () => {
    if (!user || !selectedFarm) return;

    try {
      const { data, error } = await supabase
        .from('farm_products')
        .select(`
          product_id,
          product (
            id,
            title,
            description,
            handle,
            status,
            created_at,
            updated_at
          )
        `)
        .eq('farm_id', selectedFarm.id);

      if (error) throw error;

      const formattedProducts = (data || []).map(item => ({
        id: item.product?.id || '',
        title: item.product?.title || '',
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
    if (!user || !selectedFarm) return;

    try {
      const { data, error } = await supabase
        .from('inventory_tracking')
        .select('*')
        .eq('farm_id', selectedFarm.id);

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

  const fetchCurrentPlan = async (currentUser?: any) => {
    const userId = currentUser?.id || user?.id;
    if (!userId) return;

    try {
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
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
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
      }
    } catch (error) {
      console.error('Error fetching current plan:', error);
    }
  };

  const handleUpdateFarm = async () => {
    if (!user || !selectedFarm) return;

    try {
      const { error } = await supabase
        .from('farms')
        .update(farmFormData)
        .eq('id', selectedFarm.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Farm information updated successfully."
      });

      setFarmModalOpen(false);
      await fetchFarmData();
    } catch (error) {
      console.error('Error updating farm:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update farm information."
      });
    }
  };

  const handleAddNewFarm = async () => {
    if (!user || !newFarmFormData.name || !newFarmFormData.address || !newFarmFormData.contact_person || !newFarmFormData.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('farms')
        .insert({
          name: newFarmFormData.name,
          address: newFarmFormData.address,
          contact_person: newFarmFormData.contact_person,
          email: newFarmFormData.email,
          phone: newFarmFormData.phone || null,
          bio: newFarmFormData.bio || null,
          farmer_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New farm added successfully."
      });

      setAddFarmModalOpen(false);
      setNewFarmFormData({});
      await fetchFarmData();
    } catch (error) {
      console.error('Error adding farm:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new farm."
      });
    }
  };

  const handleEditFarm = () => {
    if (selectedFarm) {
      setFarmFormData(selectedFarm);
      setFarmModalOpen(true);
    }
  };

  const canAddMultipleFarms = () => {
    return currentPlan?.can_create_multiple_stand || currentPlan?.allowed_to_business_in_multiple_location;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isFarmer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Farmer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {selectedFarm?.contact_person || 'Farmer'}! Manage your farm and products.
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
              <TrendingUp className="h-4 w-4 text-green-600" />
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
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-600">
                {currentPlan?.plan_name || 'No Plan'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="farm">My Farm</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Farm Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Farm Information</CardTitle>
                    <CardDescription>Your farm details and contact information</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleEditFarm}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  {selectedFarm ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Farm Name</p>
                        <p className="text-lg">{selectedFarm.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p>{selectedFarm.address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                        <p>{selectedFarm.contact_person}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{selectedFarm.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p>{selectedFarm.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No farm information available.</p>
                  )}
                </CardContent>
              </Card>

              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription Plan</CardTitle>
                  <CardDescription>Your active pricing plan and features</CardDescription>
                </CardHeader>
                <CardContent>
                      {selectedFarm ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Plan Name</p>
                            <p className="text-lg font-semibold">{currentPlan.plan_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Price</p>
                            <p>{currentPlan.price} / {currentPlan.billing_cycle}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Max Products</p>
                            <p>{currentPlan.max_products} products</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Transaction Fee</p>
                            <p>{currentPlan.transaction_fee}%</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Assigned On</p>
                            <p>{new Date(currentPlan.assigned_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Multiple Farms</p>
                            <p>{canAddMultipleFarms() ? 'Allowed' : 'Not Available'}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No active subscription plan.</p>
                      )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Farm Tab */}
          <TabsContent value="farm">
            <div className="space-y-6">
              {/* Farm Selector & Add Farm */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Farms</CardTitle>
                    <CardDescription>Manage your farm locations and information</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {canAddMultipleFarms() && (
                      <Button onClick={() => setAddFarmModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Farm
                      </Button>
                    )}
                    <Button onClick={handleEditFarm} disabled={!selectedFarm} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Farm
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {farmData.length > 1 && (
                    <div className="mb-6">
                      <Label htmlFor="farm-selector">Select Farm</Label>
                      <Select 
                        value={selectedFarm?.id || ''} 
                        onValueChange={(value) => {
                          const farm = farmData.find(f => f.id === value);
                          setSelectedFarm(farm || null);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a farm" />
                        </SelectTrigger>
                        <SelectContent>
                          {farmData.map((farm) => (
                            <SelectItem key={farm.id} value={farm.id}>
                              {farm.name} - {farm.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {selectedFarm ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Farm Name</p>
                              <p className="text-lg">{selectedFarm.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                              <p>{selectedFarm.contact_person}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Email</p>
                              <p>{selectedFarm.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Phone</p>
                              <p>{selectedFarm.phone || 'Not provided'}</p>
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
                              <p>{selectedFarm.address}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Farm Bio</p>
                              <p className="text-sm">{selectedFarm.bio || 'No description available'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Created</p>
                              <p>{new Date(selectedFarm.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Plan Limits</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Products Used:</span>
                              <span className="text-sm font-medium">
                                {stats.totalProducts} / {currentPlan?.max_products === 0 ? '∞' : currentPlan?.max_products || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Transaction Fee:</span>
                              <span className="text-sm font-medium">{currentPlan?.transaction_fee || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Multiple Farms:</span>
                              <span className="text-sm font-medium">
                                {canAddMultipleFarms() ? 'Allowed' : 'Not Available'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wheat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Farm Information</h3>
                      <p className="text-muted-foreground mb-4">
                        Your farm profile hasn't been set up yet. Contact support to complete your farm setup.
                      </p>
                      {canAddMultipleFarms() && (
                        <Button onClick={() => setAddFarmModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Farm
                        </Button>
                      )}
                    </div>
                  )}

                  {!canAddMultipleFarms() && farmData.length === 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <p className="text-sm text-blue-800">
                        Your current plan allows only one farm location. 
                        Upgrade to a Business or higher plan to manage multiple farms.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
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

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                    <p className="text-muted-foreground">Update your personal and farm information in the Overview tab.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Subscription Plan</h3>
                    <p className="text-muted-foreground">
                      You are currently on the <strong>{currentPlan?.plan_name || 'No Plan'}</strong> plan.
                      Contact support to upgrade or downgrade your plan.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Farm Edit Modal */}
        <Dialog open={farmModalOpen} onOpenChange={setFarmModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Farm Information</DialogTitle>
              <DialogDescription>
                Update your farm details and contact information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farm-name">Farm Name</Label>
                <Input
                  id="farm-name"
                  value={farmFormData.name || ''}
                  onChange={(e) => setFarmFormData({...farmFormData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-person">Contact Person</Label>
                <Input
                  id="contact-person"
                  value={farmFormData.contact_person || ''}
                  onChange={(e) => setFarmFormData({...farmFormData, contact_person: e.target.value})}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={farmFormData.address || ''}
                  onChange={(e) => setFarmFormData({...farmFormData, address: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={farmFormData.email || ''}
                  onChange={(e) => setFarmFormData({...farmFormData, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={farmFormData.phone || ''}
                  onChange={(e) => setFarmFormData({...farmFormData, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Farm Bio</Label>
                <Textarea
                  id="bio"
                  value={farmFormData.bio || ''}
                  onChange={(e) => setFarmFormData({...farmFormData, bio: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setFarmModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateFarm}>
                Update Farm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add New Farm Modal */}
        <Dialog open={addFarmModalOpen} onOpenChange={setAddFarmModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Farm</DialogTitle>
              <DialogDescription>
                Add a new farm location to your account. Multiple farms are available with your current plan.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-farm-name">Farm Name</Label>
                <Input
                  id="new-farm-name"
                  value={newFarmFormData.name || ''}
                  onChange={(e) => setNewFarmFormData({...newFarmFormData, name: e.target.value})}
                  placeholder="Enter farm name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-contact-person">Contact Person</Label>
                <Input
                  id="new-contact-person"
                  value={newFarmFormData.contact_person || ''}
                  onChange={(e) => setNewFarmFormData({...newFarmFormData, contact_person: e.target.value})}
                  placeholder="Enter contact person name"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-address">Address</Label>
                <Textarea
                  id="new-address"
                  value={newFarmFormData.address || ''}
                  onChange={(e) => setNewFarmFormData({...newFarmFormData, address: e.target.value})}
                  placeholder="Enter complete farm address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newFarmFormData.email || ''}
                  onChange={(e) => setNewFarmFormData({...newFarmFormData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-phone">Phone</Label>
                <Input
                  id="new-phone"
                  value={newFarmFormData.phone || ''}
                  onChange={(e) => setNewFarmFormData({...newFarmFormData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-bio">Farm Bio</Label>
                <Textarea
                  id="new-bio"
                  value={newFarmFormData.bio || ''}
                  onChange={(e) => setNewFarmFormData({...newFarmFormData, bio: e.target.value})}
                  rows={3}
                  placeholder="Describe your farm and what you grow"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setAddFarmModalOpen(false);
                setNewFarmFormData({});
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddNewFarm}>
                Add Farm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default FarmerDashboard;