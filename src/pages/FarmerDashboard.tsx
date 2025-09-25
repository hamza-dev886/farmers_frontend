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
  DollarSign,
  FileText
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { OrdersTab } from "@/components/OrdersTab";
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

  // Fetch products and inventory when selectedFarm changes
  useEffect(() => {
    if (selectedFarm) {
      fetchProducts();
      fetchInventory();
    }
  }, [selectedFarm, user]);

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
      // Products and inventory will be fetched via useEffect when selectedFarm is set
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
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

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products Management
                </CardTitle>
                <CardDescription>Manage your farm products and inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => selectedFarm && navigate(`/inventory/${selectedFarm.id}`)}
                      disabled={!selectedFarm}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Manage Inventory
                    </Button>
                  </div>
                  {products.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                            <TableCell>
                              <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by adding your first product to begin selling.
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <OrdersTab farmId={selectedFarm?.id} />
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