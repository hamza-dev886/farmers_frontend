import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
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
import { MapboxAutocomplete } from "@/components/ui/mapbox-autocomplete";
import { MapboxMapPreview } from "@/components/ui/mapbox-map-preview";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Package,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  ShoppingCart,
  Wheat,
  DollarSign
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  // Supabase query aliases variant details into `product` (see fetchInventory select)
  product?: any;
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
  const [user, setUser] = useState<any>(null);
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
  const [addStallModalOpen, setAddStallModalOpen] = useState(false);
  const [isStallLoading, setIsStallLoading] = useState(false);

  // Stall validation schema
  const stallSchema = z.object({
    name: z.string().min(1, "Stall name is required"),
    location: z.string().min(1, "Location is required"),
    photos: z.array(z.instanceof(File)).optional(),
    isAttended: z.boolean(),
    operatingHours: z.record(
      z.object({
        isOpen: z.boolean(),
        intervals: z.array(z.object({
          start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
          end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
        }))
      })
    )
    ,
    fenceRadius: z.number().min(50, "Fence radius must be at least 50m").max(150, "Fence radius must be at most 150m").optional()
  });

  type DayOperatingHours = {
    isOpen: boolean;
    intervals: Array<{ start: string; end: string }>;
  };

  type StallForm = {
    name: string;
    location: string;
    photos: File[];
    isAttended: boolean;
    selectedDay: string;
    fenceRadius?: number;
    operatingHours: {
      [key: string]: DayOperatingHours;
    };
  };

  const [stallFormData, setStallFormData] = useState<StallForm>({
    name: '',
    location: '',
    photos: [],
    isAttended: true,
    fenceRadius: 75,
    selectedDay: 'monday',
    operatingHours: {
      monday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
      tuesday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
      wednesday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
      thursday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
      friday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
      saturday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
      sunday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
    }
  });
  const [stallErrors, setStallErrors] = useState<Record<string, string>>({});
  const [stallCoordinates, setStallCoordinates] = useState<[number, number] | null>(null); // [lng, lat]
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<Array<{ file: File; url: string }>>([]);
  // Cleanup object URLs when previews change or component unmounts
  useEffect(() => {
    return () => {
      photoPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [photoPreviews]);

  const [stallStep, setStallStep] = useState<number>(1); // 1 = basic info, 2 = images & hours

  // Zod schema for step1 (basic info only)
  const stallStep1Schema = z.object({
    name: z.string().min(1, "Stall name is required"),
    location: z.string().min(1, "Location is required"),
    isAttended: z.boolean()
  });

  const handleStallSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stallStep === 1) {
      // validate locally and proceed to step 2
      try {
        const validated = stallStep1Schema.parse({
          name: stallFormData.name,
          location: stallFormData.location,
          isAttended: stallFormData.isAttended
        });
        setStallErrors({});
        setStallStep(2);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldErrors: Record<string, string> = {};
          err.errors.forEach((e) => {
            if (e.path[0]) fieldErrors[e.path[0].toString()] = e.message;
          });
          setStallErrors(fieldErrors);
        }
      }
    } else {
      await handleStallFinalSubmit();
    }
  };

  // Step 2: upload images and update operating hours for the created stall
  const handleStallFinalSubmit = async () => {
    setIsStallLoading(true);
    try {
      if (!selectedFarm?.id) throw new Error('No farm selected');

  // Upload photos to storage and collect filenames to store in DB
  const photoNames: string[] = [];
  for (const photo of stallFormData.photos || []) {
        // derive a safe extension, fallback to png
        let fileExt = (photo.name || '').split('.').pop() || '';
        fileExt = fileExt.match(/^[a-zA-Z0-9]+$/) ? fileExt : 'png';

        // use crypto.randomUUID when available for uniqueness, else fallback to timestamp+random
        let uniqueId: string;
        try {
          // @ts-ignore - some environments provide crypto
          uniqueId = (globalThis.crypto && (globalThis.crypto as any).randomUUID) ? (globalThis.crypto as any).randomUUID() : '';
        } catch (e) {
          uniqueId = '';
        }

        if (!uniqueId) {
          uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
        }

        // include farm id, timestamp and unique id in filename
        const fileName = `${selectedFarm.id}-${Date.now()}-${uniqueId}.${fileExt}`;
        const filePath = `${selectedFarm.id}/stalls/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('farmers_bucket')
          .upload(filePath, photo, {
            cacheControl: '3600',
            upsert: false,
            contentType: photo.type || 'image/png'
          });

        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          continue;
        }

        // store only the filename in DB column `stall_images`
        photoNames.push(fileName);
      }

      // Insert the stall row with operating hours and photo paths
      const payload: any = {
        name: stallFormData.name,
        location: stallFormData.location,
        // is_attended: stallFormData.isAttended,
        operating_hours: stallFormData.operatingHours,
        farm_id: selectedFarm.id
      };
      // include geo-fence radius in meters
      if (stallFormData.fenceRadius !== undefined) {
        payload.fence_radius_m = stallFormData.fenceRadius;
      }
      // include selected inventory item ids
      if (selectedInventoryIds && selectedInventoryIds.length > 0) {
        payload.inventory_item_ids = selectedInventoryIds;
      }
      // Include coordinates if selected (lng, lat)
      if (stallCoordinates) {
        payload.longitude = stallCoordinates[0];
        payload.latitude = stallCoordinates[1];
      }
  if (photoNames.length > 0) payload.stall_images = photoNames;

      console.log('Stall payload:', payload);

      const { error } = await (supabase as any)
        .from('farm_stalls')
        .insert(payload);

        console.log('Stall insert response error:', error );

      if (error) throw error;

      toast({ title: 'Success', description: 'Stall created successfully!' });
      setAddStallModalOpen(false);
      // reset
      setStallFormData({
        name: '',
        location: '',
        photos: [],
        isAttended: true,
        selectedDay: 'monday',
        operatingHours: {
          monday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
          tuesday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
          wednesday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
          thursday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
          friday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
          saturday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
          sunday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] }
        }
      });
      setPhotoPreviews([]);
      setStallStep(1);
    } catch (err) {
      if (err instanceof Error) {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to finalize stall.' });
      }
    } finally {
      setIsStallLoading(false);
    }
  };
  const [farmFormData, setFarmFormData] = useState<Partial<FarmData>>({});
  const [newFarmFormData, setNewFarmFormData] = useState<Partial<FarmData>>({});
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
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Ensure products and inventory are fetched whenever a farm is selected (or user becomes available)
  useEffect(() => {
    if (!user || !selectedFarm) return;

    // fetch both lists in parallel
    const load = async () => {
      try {
        await Promise.all([fetchProducts(), fetchInventory()]);
      } catch (err) {
        console.error('Error loading products/inventory after selecting farm:', err);
      }
    };

    load();
  }, [user, selectedFarm]);

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
        .select(`
          *,
          product:variant_id (
          *
          )`)
        .eq('farm_id', selectedFarm.id);

        console.log('Inventory fetch response:', data );

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
            <TabsTrigger value="farm">My Farm</TabsTrigger>
            <TabsTrigger value="stalls">My Stalls</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="stalls">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Stalls</CardTitle>
                  <CardDescription>
                    Review and manage your stalls
                  </CardDescription>
                </div>
                <Button onClick={() => setAddStallModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stall
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Attended Status</TableHead>
                      <TableHead>Operating Hours</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

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
                    <Button onClick={() => navigate(`/farm/${selectedFarm?.id}`)} disabled={!selectedFarm}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Farm
                    </Button>
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
                  onChange={(e) => setFarmFormData({ ...farmFormData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-person">Contact Person</Label>
                <Input
                  id="contact-person"
                  value={farmFormData.contact_person || ''}
                  onChange={(e) => setFarmFormData({ ...farmFormData, contact_person: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={farmFormData.address || ''}
                  onChange={(e) => setFarmFormData({ ...farmFormData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={farmFormData.email || ''}
                  onChange={(e) => setFarmFormData({ ...farmFormData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={farmFormData.phone || ''}
                  onChange={(e) => setFarmFormData({ ...farmFormData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Farm Bio</Label>
                <Textarea
                  id="bio"
                  value={farmFormData.bio || ''}
                  onChange={(e) => setFarmFormData({ ...farmFormData, bio: e.target.value })}
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
                  onChange={(e) => setNewFarmFormData({ ...newFarmFormData, name: e.target.value })}
                  placeholder="Enter farm name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-contact-person">Contact Person</Label>
                <Input
                  id="new-contact-person"
                  value={newFarmFormData.contact_person || ''}
                  onChange={(e) => setNewFarmFormData({ ...newFarmFormData, contact_person: e.target.value })}
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-address">Address</Label>
                <Textarea
                  id="new-address"
                  value={newFarmFormData.address || ''}
                  onChange={(e) => setNewFarmFormData({ ...newFarmFormData, address: e.target.value })}
                  placeholder="Enter complete farm address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newFarmFormData.email || ''}
                  onChange={(e) => setNewFarmFormData({ ...newFarmFormData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-phone">Phone</Label>
                <Input
                  id="new-phone"
                  value={newFarmFormData.phone || ''}
                  onChange={(e) => setNewFarmFormData({ ...newFarmFormData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-bio">Farm Bio</Label>
                <Textarea
                  id="new-bio"
                  value={newFarmFormData.bio || ''}
                  onChange={(e) => setNewFarmFormData({ ...newFarmFormData, bio: e.target.value })}
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

        {/* Add Stall Modal */}
        <Dialog open={addStallModalOpen} onOpenChange={setAddStallModalOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">Add New Stall</DialogTitle>
            </DialogHeader>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent>
                <form onSubmit={handleStallSubmission} className="space-y-4">
                  {/* Step 1: basic info */}
                  {stallStep === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="stall-name">Stall Name</Label>
                        <Input
                          id="stall-name"
                          value={stallFormData.name}
                          onChange={(e) => setStallFormData({ ...stallFormData, name: e.target.value })}
                          placeholder="Enter stall name"
                          className={stallErrors.name ? "border-destructive" : ""}
                          disabled={isStallLoading}
                        />
                        {stallErrors.name && <p className="text-sm text-destructive">{stallErrors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stall-location">Location</Label>
                        <div className="space-y-2">
                          <MapboxAutocomplete
                            value={stallFormData.location}
                            onChange={(address, coordinates) => {
                              setStallFormData({ ...stallFormData, location: address || '' });
                              setStallCoordinates(coordinates || null);
                              // clear validation error when user picks location
                              if (address) setStallErrors((prev) => ({ ...prev, location: '' }));
                            }}
                            placeholder="Search for stall location or pin on map"
                          />
                          <MapboxMapPreview
                            coordinates={stallCoordinates}
                            onSelect={(coords, placeName) => {
                              // coords is [lng, lat]
                              setStallCoordinates(coords);
                              if (placeName) {
                                setStallFormData({ ...stallFormData, location: placeName });
                                setStallErrors((prev) => ({ ...prev, location: '' }));
                              }
                            }}
                          />
                          {stallErrors.location && <p className="text-sm text-destructive">{stallErrors.location}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Geo-fence radius</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-full">
                            <Slider
                              value={[stallFormData.fenceRadius || 75]}
                              min={50}
                              max={150}
                              step={1}
                              onValueChange={(val: number[]) => {
                                setStallFormData({ ...stallFormData, fenceRadius: val?.[0] ?? 75 });
                              }}
                            />
                          </div>
                          <div className="w-20 text-right">
                            <span className="text-sm font-medium">{stallFormData.fenceRadius ?? 75} m</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Set radius for geo-fencing around the stall (50m - 150m)</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Attendance Status</Label>
                        <Select
                          value={stallFormData.isAttended ? "attended" : "unattended"}
                          onValueChange={(value) => setStallFormData({ ...stallFormData, isAttended: value === "attended" })}
                          disabled={isStallLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select attendance status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attended">Attended</SelectItem>
                            <SelectItem value="unattended">Unattended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Select Inventory Items</Label>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                          {inventory && inventory.length > 0 ? (
                            inventory.map((item) => (
                              <label key={item.id} className="flex items-center gap-2">
                                <Checkbox
                                  checked={selectedInventoryIds.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedInventoryIds((prev) => Array.from(new Set([...prev, item.id])));
                                    } else {
                                      setSelectedInventoryIds((prev) => prev.filter((id) => id !== item.id));
                                    }
                                  }}
                                />
                                <div className="text-sm">
                                  <div className="font-medium">{item.product.title || item.id}</div>
                                  <div className="text-muted-foreground text-xs">Qty: {item.quantity_available}</div>
                                </div>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No inventory items available.</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Select inventory items to associate with this stall.</p>
                      </div>
                    </>
                  )}

                  {/* Step 2: operating hours & photos */}
                  {stallStep === 2 && (
                    <>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Operating Hours</Label>
                          <Select
                            value={stallFormData.selectedDay || "monday"}
                            onValueChange={(value) => setStallFormData({ ...stallFormData, selectedDay: value })}
                            disabled={isStallLoading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Monday</SelectItem>
                              <SelectItem value="tuesday">Tuesday</SelectItem>
                              <SelectItem value="wednesday">Wednesday</SelectItem>
                              <SelectItem value="thursday">Thursday</SelectItem>
                              <SelectItem value="friday">Friday</SelectItem>
                              <SelectItem value="saturday">Saturday</SelectItem>
                              <SelectItem value="sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Hours</Label>
                            <div className="flex items-center gap-3">
                              <div className="text-sm text-muted-foreground">
                                {stallFormData.operatingHours[stallFormData.selectedDay || 'monday']?.isOpen ? (
                                  <span className="text-green-600">Open</span>
                                ) : (
                                  <span className="text-red-600">Closed</span>
                                )}
                              </div>
                              <Switch
                                checked={stallFormData.operatingHours[stallFormData.selectedDay || 'monday']?.isOpen}
                                onCheckedChange={(checked) => {
                                  const currentDay = stallFormData.selectedDay || 'monday';
                                  const existing = stallFormData.operatingHours[currentDay];
                                  // When enabling, ensure at least one interval exists
                                  const intervals = existing?.intervals && existing.intervals.length > 0 ? existing.intervals : [{ start: '09:00', end: '17:00' }];
                                  setStallFormData({
                                    ...stallFormData,
                                    operatingHours: {
                                      ...stallFormData.operatingHours,
                                      [currentDay]: {
                                        ...existing,
                                        intervals,
                                        isOpen: !!checked
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            {stallFormData.operatingHours[stallFormData.selectedDay || 'monday']?.intervals?.map((interval, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <Input
                                  type="time"
                                  value={interval.start}
                                  onChange={(e) => {
                                    const currentDay = stallFormData.selectedDay || 'monday';
                                    const newIntervals = (stallFormData.operatingHours[currentDay]?.intervals || []).map((it, i) => i === idx ? { ...it, start: e.target.value } : it);
                                    setStallFormData({
                                      ...stallFormData,
                                      operatingHours: {
                                        ...stallFormData.operatingHours,
                                        [currentDay]: {
                                          ...stallFormData.operatingHours[currentDay],
                                          intervals: newIntervals,
                                          isOpen: true
                                        }
                                      }
                                    });
                                  }}
                                  className={stallErrors[`operatingHours.start.${idx}`] ? 'border-destructive' : ''}
                                  disabled={isStallLoading || !stallFormData.operatingHours[stallFormData.selectedDay || 'monday']?.isOpen}
                                />
                                <span>to</span>
                                <Input
                                  type="time"
                                  value={interval.end}
                                  onChange={(e) => {
                                    const currentDay = stallFormData.selectedDay || 'monday';
                                    const newIntervals = (stallFormData.operatingHours[currentDay]?.intervals || []).map((it, i) => i === idx ? { ...it, end: e.target.value } : it);
                                    setStallFormData({
                                      ...stallFormData,
                                      operatingHours: {
                                        ...stallFormData.operatingHours,
                                        [currentDay]: {
                                          ...stallFormData.operatingHours[currentDay],
                                          intervals: newIntervals,
                                          isOpen: true
                                        }
                                      }
                                    });
                                  }}
                                  className={stallErrors[`operatingHours.end.${idx}`] ? 'border-destructive' : ''}
                                  disabled={isStallLoading || !stallFormData.operatingHours[stallFormData.selectedDay || 'monday']?.isOpen}
                                />

                                <div className="flex items-center gap-2">
                                  {(stallFormData.operatingHours[stallFormData.selectedDay || 'monday']?.intervals?.length || 0) > 1 && (
                                    <Button type="button" variant="destructive" onClick={() => {
                                      const currentDay = stallFormData.selectedDay || 'monday';
                                      const newIntervals = (stallFormData.operatingHours[currentDay]?.intervals || []).filter((_, i) => i !== idx);
                                      setStallFormData({
                                        ...stallFormData,
                                        operatingHours: {
                                          ...stallFormData.operatingHours,
                                          [currentDay]: {
                                            ...stallFormData.operatingHours[currentDay],
                                            intervals: newIntervals
                                          }
                                        }
                                      });
                                    }}>Remove</Button>
                                  )}
                                </div>
                              </div>
                            ))}

                            <div>
                              <Button type="button" onClick={() => {
                                const currentDay = stallFormData.selectedDay || 'monday';
                                const newIntervals = [...(stallFormData.operatingHours[currentDay]?.intervals || []), { start: '09:00', end: '17:00' }];
                                setStallFormData({
                                  ...stallFormData,
                                  operatingHours: {
                                    ...stallFormData.operatingHours,
                                    [currentDay]: {
                                      ...stallFormData.operatingHours[currentDay],
                                      intervals: newIntervals,
                                      isOpen: true
                                    }
                                  }
                                });
                              }}>Add Interval</Button>
                            </div>
                          </div>
                          {(stallErrors['operatingHours.start'] || stallErrors['operatingHours.end']) && (
                            <p className="text-sm text-destructive">Please enter valid operating hours</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stall-photos">Photos</Label>
                        <Input
                          id="stall-photos"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const total = files.length + (stallFormData.photos?.length || 0);
                            if (total > 5) {
                              toast({
                                variant: "destructive",
                                title: "Too many files",
                                description: "You can upload a maximum of 5 photos"
                              });
                              return;
                            }

                            // Create preview URLs for the new files
                            const newPreviews = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));

                            setPhotoPreviews((prev) => [...prev, ...newPreviews]);
                            setStallFormData({ ...stallFormData, photos: [...(stallFormData.photos || []), ...files] });
                          }}
                          className="cursor-pointer"
                          disabled={isStallLoading}
                        />
                        <p className="text-sm text-muted-foreground">Upload photos of your stall (maximum 5 photos)</p>
                        {photoPreviews.length > 0 && (
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {photoPreviews.map((p, idx) => (
                              <div key={p.url} className="relative border rounded overflow-hidden">
                                <img src={p.url} alt={`preview-${idx}`} className="w-full h-24 object-cover" />
                                <button
                                  type="button"
                                  aria-label="Remove photo"
                                  className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-sm"
                                  onClick={() => {
                                    // revoke url
                                    URL.revokeObjectURL(p.url);
                                    // remove from previews
                                    setPhotoPreviews((prev) => prev.filter((x) => x.url !== p.url));
                                    // remove from stallFormData.photos
                                    setStallFormData((prev) => ({
                                      ...prev,
                                      photos: (prev.photos || []).filter((f) => f.name !== p.file.name || f.size !== p.file.size)
                                    }));
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      {stallStep === 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStallStep(1)}
                          disabled={isStallLoading}
                        >
                          Back
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAddStallModalOpen(false);
                          setStallFormData({
                            name: '',
                            location: '',
                            photos: [],
                            isAttended: true,
                            selectedDay: 'monday',
                            operatingHours: {
                              monday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
                              tuesday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
                              wednesday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
                              thursday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
                              friday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
                              saturday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] },
                              sunday: { isOpen: true, intervals: [{ start: '09:00', end: '17:00' }] }
                            }
                          });
                          setPhotoPreviews([]);
                          setStallStep(1);
                        }}
                        disabled={isStallLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isStallLoading}>
                        {isStallLoading ? (stallStep === 1 ? 'Processing...' : 'Finalizing...') : (stallStep === 1 ? 'Next' : 'Finish')}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default FarmerDashboard;