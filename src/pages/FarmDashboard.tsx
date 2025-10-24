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
import { fetchCategories, Category } from "@/services/categoryService";
import { sub } from "date-fns";

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
  category_id?: string;
  sub_category_id?: string;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [availableSubCategories, setAvailableSubCategories] = useState<any[]>([]);
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);
  const [customSubCategoryName, setCustomSubCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to load categories
  const loadCategories = async () => {
    const data = await fetchCategories();
    if (data) {
      setCategories(data);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Update available subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
      setAvailableSubCategories(selectedCategory?.sub_categories || []);
    } else {
      setAvailableSubCategories([]);
    }
  }, [selectedCategoryId, categories]);

  // Load subcategories when editing a product
  useEffect(() => {
    if (editingItem && productFormData.category_id && categories.length > 0) {
      const selectedCategory = categories.find(cat => cat.id === productFormData.category_id);
      console.log('Setting available subcategories for editing item:', selectedCategory);
      if (selectedCategory) {
        setAvailableSubCategories(selectedCategory.sub_categories || []);
        setSelectedCategoryId(productFormData.category_id);
      }
    }
  }, [editingItem, productFormData.category_id, categories]);

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
      await fetchCurrentPlan(session.user);
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
      const { data, error } = await (supabase as any)
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
          updated_at,
          category:category_id (
            id,
            name
         ),
          sub_category:sub_category_id (
            id,
            name
        )
       )
  `)
        .eq('farm_id', farmId);

      console.log('Fetched products data:', data);

      if (error) throw error;

      const formattedProducts = (data || []).map((item: any) => ({
        id: item.product?.id || '',
        title: item.product?.title || item.product?.handle || 'Untitled Product',
        description: item.product?.description || '',
        handle: item.product?.handle || '',
        status: item.product?.status || 'draft',
        category_id: item.product?.category?.id || '',
        sub_category_id: item.product?.sub_category?.id || '',
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

  const fetchCurrentPlan = async (currentUser?: any) => {
    console.log('fetchCurrentPlan called, user:', currentUser || user);
    const userToUse = currentUser || user;
    if (!userToUse) {
      console.log('No user found, skipping pricing plan fetch');
      return;
    }

    try {
      console.log('Fetching pricing plan for user ID:', userToUse.id);
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
        .eq('user_id', userToUse.id)
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

  const isFormValid = (): boolean => {
    // Check all required fields
    const hasTitle = productFormData.title?.trim() && productFormData.title.trim().length >= 2;
    const hasDescription = productFormData.description?.trim() && productFormData.description.trim().length >= 10;
    const hasCategory = !!productFormData.category_id;

    // Check subcategory: either regular subcategory selected OR custom subcategory name provided
    const hasSubCategory = isCustomSubCategory
      ? customSubCategoryName.trim().length > 0
      : !!productFormData.sub_category_id;

    return hasTitle && hasDescription && hasCategory && hasSubCategory;
  };

  const validateProductForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!productFormData.title?.trim()) {
      errors.title = "Product title is required";
    } else if (productFormData.title.trim().length < 2) {
      errors.title = "Product title must be at least 2 characters";
    }

    if (!productFormData.description?.trim()) {
      errors.description = "Product description is required";
    } else if (productFormData.description.trim().length < 10) {
      errors.description = "Product description must be at least 10 characters";
    }

    if (!productFormData.category_id) {
      errors.category = "Please select a category";
    }

    if (!isCustomSubCategory && !productFormData.sub_category_id) {
      errors.subCategory = "Please select a subcategory or add a custom one";
    }

    if (isCustomSubCategory && !customSubCategoryName.trim()) {
      errors.customSubCategory = "Please enter a subcategory name or cancel";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Validate form
    if (!validateProductForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form."
      });
      return;
    }

    if (!farmId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Farm ID is missing."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCustomSubCategory && customSubCategoryName.trim()) {
        // Check if custom subcategory already exists
        const { data: existingSubCategories, error: checkError } = await (supabase as any)
          .from('sub_categories')
          .select('id, name')
          .eq('category_id', productFormData.category_id)
          .ilike('name', customSubCategoryName.trim());

        if (checkError) {
          console.error('Error checking subcategory:', checkError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to verify subcategory. Please try again."
          });
          return;
        }

        if (existingSubCategories && existingSubCategories.length > 0) {
          toast({
            variant: "destructive",
            title: "Subcategory Already Exists",
            description: `"${customSubCategoryName}" already exists. Please use the dropdown to select it or choose a different name.`
          });
          return;
        }

        // Create new custom subcategory
        const { data: newSubCategory, error: createError } = await (supabase as any)
          .from('sub_categories')
          .insert({
            category_id: productFormData.category_id,
            name: customSubCategoryName.trim()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating subcategory:', createError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create custom subcategory. Please try again."
          });
          return;
        }

        productFormData.sub_category_id = newSubCategory.id;

        // Reload categories to include the new subcategory
        await loadCategories();

        toast({
          title: "Custom Subcategory Created",
          description: `"${customSubCategoryName}" has been created successfully.`
        });
      }

      const productId = crypto.randomUUID();
      // Create a unique handle from title if not provided
      const productHandle = productFormData.handle || productFormData.title?.toLowerCase().replace(/\s+/g, '-') || '';
      // Create product first - the product table requires an ID to be provided
      const { data: productData, error: productError } = await supabase
        .from('product')
        .insert({
          id: productId,
          handle: productHandle,
          title: productFormData.title || 'Untitled Product',
          description: productFormData.description,
          status: productFormData.status || 'draft',
          category_id: productFormData.category_id || null,
          sub_category_id: productFormData.sub_category_id || null
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
      setSelectedCategoryId("");
      setIsCustomSubCategory(false);
      setCustomSubCategoryName("");
      await fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Validate form
    if (!validateProductForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form."
      });
      return;
    }

    if (!editingItem) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No product selected for editing."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCustomSubCategory && customSubCategoryName.trim()) {
        // Check if custom subcategory already exists
        const { data: existingSubCategories, error: checkError } = await (supabase as any)
          .from('sub_categories')
          .select('id, name')
          .eq('category_id', productFormData.category_id)
          .ilike('name', customSubCategoryName.trim());

        if (checkError) {
          console.error('Error checking subcategory:', checkError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to verify subcategory. Please try again."
          });
          return;
        }

        if (existingSubCategories && existingSubCategories.length > 0) {
          toast({
            variant: "destructive",
            title: "Subcategory Already Exists",
            description: `"${customSubCategoryName}" already exists. Please use the dropdown to select it or choose a different name.`
          });
          return;
        }

        // Create new custom subcategory
        const { data: newSubCategory, error: createError } = await (supabase as any)
          .from('sub_categories')
          .insert({
            category_id: productFormData.category_id,
            name: customSubCategoryName.trim()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating subcategory:', createError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create custom subcategory. Please try again."
          });
          return;
        }

        productFormData.sub_category_id = newSubCategory.id;

        // Reload categories to include the new subcategory
        await loadCategories();

        toast({
          title: "Custom Subcategory Created",
          description: `"${customSubCategoryName}" has been created successfully.`
        });
      }

      const { error } = await supabase
        .from('product')
        .update({
          title: productFormData.title,
          handle: productFormData.handle || productFormData.title?.toLowerCase().replace(/\s+/g, '-') || '',
          description: productFormData.description,
          status: productFormData.status,
          category_id: productFormData.category_id || null,
          sub_category_id: productFormData.sub_category_id || null
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
      setSelectedCategoryId("");
      setIsCustomSubCategory(false);
      setCustomSubCategoryName("");
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product."
      });
    } finally {
      setIsSubmitting(false);
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
    setProductFormData({
      ...product,
      category_id: product.category_id || "",
      sub_category_id: product.sub_category_id || ""
    });
    console.log('Editing product, form data set to:', product)
    // Set selected category to trigger subcategories loading
    if (product.category_id) {
      setSelectedCategoryId(product.category_id);
    } else {
      setSelectedCategoryId("");
    }
    setIsCustomSubCategory(false);
    setCustomSubCategoryName("");
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
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
                <div className="flex gap-2">
                  <Button onClick={() => navigate(`/farm/${farmId}/inventory`)}>
                    <Package className="h-4 w-4 mr-2" />
                    Full Inventory
                  </Button>
                  <Button
                    onClick={() => setProductModalOpen(true)}
                    disabled={currentPlan?.max_products !== 0 && stats.totalProducts >= (currentPlan?.max_products || 0)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
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

        </Tabs>

        {/* Product Modal */}
        <Dialog open={productModalOpen} onOpenChange={(open) => {
          setProductModalOpen(open);
          if (!open) {
            setEditingItem(null);
            setProductFormData({});
            setSelectedCategoryId("");
            setIsCustomSubCategory(false);
            setCustomSubCategoryName("");
            setValidationErrors({});
          }
        }}>
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
                  onChange={(e) => {
                    setProductFormData({ ...productFormData, title: e.target.value });
                    if (validationErrors.title) {
                      setValidationErrors({ ...validationErrors, title: '' });
                    }
                  }}
                  placeholder="Enter product title"
                  disabled={isSubmitting}
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500">{validationErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Description *</Label>
                <Textarea
                  id="product-description"
                  value={productFormData.description || ''}
                  onChange={(e) => {
                    setProductFormData({ ...productFormData, description: e.target.value });
                    if (validationErrors.description) {
                      setValidationErrors({ ...validationErrors, description: '' });
                    }
                  }}
                  placeholder="Describe your product"
                  rows={3}
                  disabled={isSubmitting}
                  className={validationErrors.description ? 'border-red-500' : ''}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500">{validationErrors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-handle">Handle</Label>
                <Input
                  id="product-handle"
                  value={productFormData.handle || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, handle: e.target.value })}
                  placeholder="product-handle (auto-generated if empty)"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-status">Status</Label>
                <Select
                  value={productFormData.status || 'draft'}
                  onValueChange={(value) => setProductFormData({ ...productFormData, status: value })}
                  disabled={isSubmitting}
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

              <div className="grid grid-row-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-category">Category *</Label>
                  <Select
                    value={productFormData.category_id || ""}
                    onValueChange={(value) => {
                      setProductFormData({ ...productFormData, category_id: value, sub_category_id: "" });
                      setSelectedCategoryId(value);
                      if (validationErrors.category) {
                        setValidationErrors({ ...validationErrors, category: '' });
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.category && (
                    <p className="text-sm text-red-500">{validationErrors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-sub-category">Sub Category *</Label>
                  <Select
                    value={productFormData.sub_category_id || ""}
                    onValueChange={(value) => {
                      setProductFormData({ ...productFormData, sub_category_id: value });
                      if (validationErrors.subCategory) {
                        setValidationErrors({ ...validationErrors, subCategory: '' });
                      }
                    }}
                    disabled={isSubmitting || isCustomSubCategory || !productFormData.category_id || availableSubCategories.length === 0}
                  >
                    <SelectTrigger className={validationErrors.subCategory ? 'border-red-500' : ''}>
                      <SelectValue placeholder={!productFormData.category_id ? "Select category first" : "Select a sub-category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubCategories.map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.subCategory && (
                    <p className="text-sm text-red-500">{validationErrors.subCategory}</p>
                  )}

                  {!isCustomSubCategory ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => {
                        setIsCustomSubCategory(true);
                        setProductFormData({ ...productFormData, sub_category_id: "" });
                        if (validationErrors.subCategory) {
                          setValidationErrors({ ...validationErrors, subCategory: '' });
                        }
                      }}
                      disabled={isSubmitting || !productFormData.category_id}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Subcategory
                    </Button>
                  ) : (
                    <div className="space-y-2 mt-2">
                      <Input
                        id="custom-subcategory"
                        value={customSubCategoryName}
                        onChange={(e) => {
                          setCustomSubCategoryName(e.target.value);
                          if (validationErrors.customSubCategory) {
                            setValidationErrors({ ...validationErrors, customSubCategory: '' });
                          }
                        }}
                        placeholder="Enter custom subcategory name"
                        disabled={isSubmitting}
                        className={validationErrors.customSubCategory ? 'border-red-500' : ''}
                      />
                      {validationErrors.customSubCategory && (
                        <p className="text-sm text-red-500">{validationErrors.customSubCategory}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className=" w-32"
                          onClick={() => {
                            setIsCustomSubCategory(false);
                            setCustomSubCategoryName("");
                            setEditingItem(null);
                            if (validationErrors.customSubCategoryName) {
                              setValidationErrors({ ...validationErrors, customSubCategoryName: '' });
                            }
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        {/* <Button
                          type="button"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (customSubCategoryName.trim()) {
                              // Store the custom name in a special way (you might want to save this differently)
                              setProductFormData({ 
                                ...productFormData, 
                                sub_category_id: `custom_${customSubCategoryName}` 
                              });
                              toast({
                                title: "Custom Subcategory Added",
                                description: `"${customSubCategoryName}" will be created.`
                              });
                              setIsCustomSubCategory(false);
                            } else {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Please enter a subcategory name."
                              });
                            }
                          }}
                        >
                          Save
                        </Button> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setProductModalOpen(false);
                  setEditingItem(null);
                  setProductFormData({});
                  setSelectedCategoryId("");
                  setIsCustomSubCategory(false);
                  setCustomSubCategoryName("");
                  setValidationErrors({});
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={editingItem ? handleUpdateProduct : handleAddProduct}
                disabled={isSubmitting || !isFormValid()}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingItem ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingItem ? 'Update Product' : 'Add Product'
                )}
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