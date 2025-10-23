import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { set, z } from 'zod';
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
  DollarSign,
  Trash2,
  Shield,
  Clock
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUploader } from '@/components/ImageUploader';

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
  const [inventory, setInventory] = useState<any[]>([]);
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
  const [addFarmStallModalOpen, setAddFarmStallModalOpen] = useState(false);
  const [isStallLoading, setIsStallLoading] = useState(false);
  type Stall = {
    id: string;
    name: string;
    location: string;
    is_pickup: boolean;
    operating_hours: {
      [key: string]: {
        isOpen: boolean;
        intervals: Array<{ start: string; end: string }>;
      };
    };
    stall_images?: string[];
    pickup_from?: string;
    pickup_to?: string;
    capacityPerSlot?: number;
    prep_buffer?: string;
    fence_radius_m?: number;
    longitude?: number;
    latitude?: number;
    created_at: string;
  };

  const [stalls, setStalls] = useState<Stall[]>([]);
  const [stallToDelete, setStallToDelete] = useState<Stall | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [farmType, setFarmType] = useState<any>(null);

  const handleDeleteStall = async () => {
    if (!stallToDelete) return;

    try {
      const { data, error } = await (supabase as any)
        .from('farm_stalls')
        .delete()
        .eq('id', stallToDelete.id)
        .select();

      console.log('Delete stall response data:', data);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stall deleted successfully."
      });

      // Refresh the stalls list
      await fetchStalls();
    } catch (error) {
      console.error('Error deleting stall:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete stall."
      });
    } finally {
      setStallToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Stall validation schema
  const stallSchema = z.object({
    name: z.string().optional(),
    location: z.string().optional(),
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
    id?: string;
    name: string;
    location: string;
    photos: File[];
    isPickup: boolean;
    selectedDay: string;
    fenceRadius?: number;
    pickupFrom?: string;
    prep_buffer?: string;
    pickupTo?: string;
    capacityPerSlot?: number;
    operatingHours: {
      [key: string]: DayOperatingHours;
    };
  };
  console.log('Selected farm for stall form default name:', selectedFarm);
  const [stallFormData, setStallFormData] = useState<StallForm>({
    id: '',
    name: "",
    location: '',
    photos: [],
    isPickup: false,
    fenceRadius: 75,
    selectedDay: 'monday',
    pickupFrom: '09:00',
    pickupTo: '17:00',
    capacityPerSlot: 0,
    prep_buffer: '',
    operatingHours: {
      monday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      tuesday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      wednesday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      thursday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      friday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      saturday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      sunday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
    }
  });

  const [configureStallFormData, setConfigureStallFormData] = useState<StallForm>({
    id: '',
    name: "",
    location: '',
    photos: [],
    isPickup: false,
    fenceRadius: 75,
    selectedDay: 'monday',
    pickupFrom: '09:00',
    pickupTo: '17:00',
    capacityPerSlot: 0,
    prep_buffer: '',
    operatingHours: {
      monday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      tuesday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      wednesday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      thursday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      friday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      saturday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
      sunday: { isOpen: false, intervals: [{ start: '09:00', end: '17:00' }] },
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

  const [stallStep, setStallStep] = useState<number>(1);

  // Zod schema for step1 (basic info only)
  const stallStep1Schema = z.object({
    name: z.string().min(1, "Stall name is required"),
    location: z.string().min(1, "Location is required"),
    isPickup: z.boolean(),
    capacityPerSlot: z.number().optional(),
    prep_buffer: z.string().optional()
  });

  const handleStallSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stallStep === 1) {
      // validate locally and proceed to step 2
      try {
        const validated = stallStep1Schema.parse({
          name: stallFormData.name,
          location: stallFormData.location,
          isPickup: stallFormData.isPickup,
          capacityPerSlot: stallFormData.capacityPerSlot,
          prep_buffer: stallFormData.prep_buffer
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

  const handleConfigureStallFinalSubmit = async () => {
    setIsStallLoading(true);
    try {
      if (!selectedFarm?.id) throw new Error('No farm selected');

      // Upload photos to storage and collect filenames to store in DB
      const photoNames: string[] = [];
      for (const photo of configureStallFormData.photos || []) {
        // derive a safe extension, fallback to png
        let fileExt = (photo.name || '').split('.').pop() || '';
        fileExt = fileExt.match(/^[a-zA-Z0-9]+$/) ? fileExt : 'png';

        let uniqueId: string;
        try {
          uniqueId = (globalThis.crypto && (globalThis.crypto as any).randomUUID) ? (globalThis.crypto as any).randomUUID() : '';
        } catch (e) {
          uniqueId = '';
        }

        if (!uniqueId) {
          uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
        }

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

        photoNames.push(fileName);
      }

      // Update the stall row with operating hours and photo paths
      const payload: any = {
        name: configureStallFormData.name,
        location: configureStallFormData.location,
        operating_hours: configureStallFormData.operatingHours,
        farm_id: selectedFarm.id
      };

      if (configureStallFormData.fenceRadius !== undefined) {
        payload.fence_radius_m = configureStallFormData.fenceRadius;
      }

      if (selectedInventoryIds && selectedInventoryIds.length > 0) {
        payload.inventory_item_ids = selectedInventoryIds;
      }

      if (stallCoordinates) {
        payload.longitude = stallCoordinates[0];
        payload.latitude = stallCoordinates[1];
      }

      if (configureStallFormData.isPickup) {
        payload.is_pickup = true;
        payload.pickup_from = configureStallFormData.pickupFrom;
        payload.pickup_to = configureStallFormData.pickupTo;
        payload.capacityPerSlot = configureStallFormData.capacityPerSlot;
        payload.prep_buffer = configureStallFormData.prep_buffer;
      }

      if (!configureStallFormData.isPickup) {
        payload.is_pickup = false;
      }

      if (photoNames.length > 0) payload.stall_images = photoNames;

      console.log('Stall update payload:', payload);

      const { error } = await (supabase as any)
        .from('farm_stalls')
        .insert(payload)

      // if (error) throw error;

      toast({ title: 'Success', description: 'Stall Uploaded successfully!' });
      setAddFarmStallModalOpen(false);
      await fetchStalls(); // Refresh the stalls list
      // reset
      setConfigureStallFormData({
        name: '',
        location: '',
        photos: [],
        isPickup: true,
        selectedDay: 'monday',
        fenceRadius: 75,
        pickupFrom: '09:00',
        pickupTo: '17:00',
        capacityPerSlot: 0,
        prep_buffer: '',
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
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update stall.' });
      }
    } finally {
      setIsStallLoading(false);
    }
  };

  const handleConfigureStallSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleConfigureStallFinalSubmit();
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

      if (stallFormData.isPickup) {
        payload.is_pickup = true;
        payload.pickup_from = stallFormData.pickupFrom;
        payload.pickup_to = stallFormData.pickupTo;
        payload.capacityPerSlot = stallFormData.capacityPerSlot;
        payload.prep_buffer = stallFormData.prep_buffer;
      }

      if (!stallFormData.isPickup) {
        payload.is_pickup = false;
      }

      if (photoNames.length > 0) payload.stall_images = photoNames;

      console.log('Stall insert payload:', payload);

      const { error } = await (supabase as any)
        .from('farm_stalls')
        .insert(payload);

      console.log('Stall insert response error:', error);

      if (error) throw error;

      toast({ title: 'Success', description: 'Stall created successfully!' });
      setAddStallModalOpen(false);
      await fetchStalls(); // Refresh the stalls list
      // reset
      setStallFormData({
        name: '',
        location: '',
        photos: [],
        isPickup: true,
        selectedDay: 'monday',
        fenceRadius: 75,
        pickupFrom: '09:00',
        pickupTo: '17:00',
        capacityPerSlot: 0,
        prep_buffer: '',
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
        await Promise.all([fetchProducts(), fetchInventory(), fetchStalls()]);
      } catch (err) {
        console.error('Error loading farm data:', err);
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
      console.log('Fetched farm data:', data);
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

  const fetchStalls = async () => {
    if (!user || !selectedFarm) return;

    try {
      const { data, error } = await (supabase as any)
        .from('farm_stalls')
        .select('*')
        .eq('farm_id', selectedFarm.id);

      console.log('Fetched stalls data:', data);

      if (error) throw error;
      setStalls(data || []);
    } catch (error) {
      console.error('Error fetching stalls:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load stalls."
      });
    }
  };

  const fetchInventory = async () => {
    if (!user || !selectedFarm) return;

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
        .eq('farm_id', selectedFarm.id);

      console.log('Inventory fetch response:', data, selectedFarm.id);

      if (error) throw error;

      setInventory(data || []);

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

  const handleConfigureStall = (stall: Stall) => {
    setConfigureStallFormData({
      id: stall.id,
      name: stall.name,
      location: stall.location,
      photos: [],
      isPickup: stall.is_pickup,
      selectedDay: 'monday',
      fenceRadius: stall.fence_radius_m,
      pickupFrom: stall.pickup_from,
      pickupTo: stall.pickup_to,
      capacityPerSlot: stall.capacityPerSlot,
      prep_buffer: stall.prep_buffer,
      operatingHours: stall.operating_hours
    });
    setStallStep(1);
    setAddFarmStallModalOpen(true);
  };

  const canAddMultipleFarms = () => {
    return currentPlan?.can_create_multiple_stand || currentPlan?.allowed_to_business_in_multiple_location;
  };


  // Update stall form data when selected farm changes
  useEffect(() => {
    if (selectedFarm) {
      setConfigureStallFormData(prev => ({
        ...prev,
        name: selectedFarm.name || "",
        location: selectedFarm.address || ""
      }));
    }
  }, [selectedFarm]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        // Fetch user profile if logged in
        if (session?.user && event !== 'SIGNED_OUT') {
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('type')
                .eq('id', session.user.id)
                .single();
              console.log('Fetched user profile for farm type:', profile);
              setFarmType((profile as any).type);
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }, 0);
        } else {
          setFarmType(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);


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
          <TabsList className={`grid w-full grid-cols-${farmType === "farm" ? '4' : '3'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="farm">My Farm</TabsTrigger>
            {farmType === "farm" && <TabsTrigger value="stalls">My Stalls</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {farmType === "farm" &&
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
                        <TableHead>Pickup Status</TableHead>
                        <TableHead>Operating Hours</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stalls.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No stalls found. Add your first stall to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        stalls.map((stall) => (
                          <TableRow key={stall.id}>
                            <TableCell>{stall.name}</TableCell>
                            <TableCell>
                              <Badge variant={stall.is_pickup ? "default" : "secondary"}>
                                {stall.is_pickup ? "Pickup Available" : "No Pickup"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {stall.operating_hours && Object.entries(stall.operating_hours).some(([_, day]) => day.isOpen) ? (
                                <div className="text-sm">
                                  {Object.entries(stall.operating_hours)
                                    .filter(([_, day]) => day.isOpen)
                                    .map(([dayName, day]) => (
                                      <div key={dayName} className="capitalize">
                                        {dayName}: {day.intervals?.[0]?.start} - {day.intervals?.[0]?.end}
                                      </div>
                                    ))
                                    .slice(0, 2)}
                                  {Object.entries(stall.operating_hours).filter(([_, day]) => day.isOpen).length > 2 && (
                                    <span className="text-muted-foreground">...</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No operating hours set</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleConfigureStall(stall)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setStallToDelete(stall);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>}

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Farm Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{farmType === "stall" ? "Stall" : "Farm"} Information</CardTitle>
                    <CardDescription>Your {farmType === "stall" ? "stall" : "farm"} details and contact information</CardDescription>
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
                    <CardTitle>My {farmType === "stall" ? "Stall" : "farm"}</CardTitle>
                    <CardDescription>Manage your {farmType === "stall" ? "Stall" : "farm"} locations and information</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {farmType === "stall" &&
                      <Button onClick={() => setAddFarmStallModalOpen(true)} disabled={!selectedFarm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Configure Stall
                      </Button>}
                    {canAddMultipleFarms() && (
                      <Button onClick={() => setAddFarmModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add {farmType === "stall" ? "Stall" : "farm"}
                      </Button>
                    )}
                    <Button onClick={() => navigate(`/farm/${selectedFarm?.id}`)} disabled={!selectedFarm}>
                      <Eye className="h-4 w-4 mr-2" />
                      View {farmType === "stall" ? "Stall" : "farm"}
                    </Button>
                    <Button onClick={handleEditFarm} disabled={!selectedFarm} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Basic Info
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
                              <p className="text-sm font-medium text-muted-foreground">{farmType === "stall" ? "Stall" : "farm"} Name</p>
                              <p className="text-lg">{selectedFarm.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">{farmType === "stall" ? "Stall" : "farm"} Person</p>
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
                              <p className="text-sm font-medium text-muted-foreground">{farmType === "stall" ? "Stall" : "farm"} Bio</p>
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
                      <h3 className="text-lg font-semibold mb-2">No {farmType === "stall" ? "Stall" : "farm"} Information</h3>
                      <p className="text-muted-foreground mb-4">
                        Your {farmType === "stall" ? "Stall" : "farm"} profile hasn't been set up yet. Contact support to complete your {farmType === "stall" ? "Stall" : "farm"} setup.
                      </p>
                      {canAddMultipleFarms() && (
                        <Button onClick={() => setAddFarmModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First {farmType === "stall" ? "Stall" : "farm"}
                        </Button>
                      )}
                    </div>
                  )}

                  {!canAddMultipleFarms() && farmData.length === 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <p className="text-sm text-blue-800">
                        Your current plan allows only one {farmType === "stall" ? "Stall" : "farm"} location.
                        Upgrade to a Business or higher plan to manage multiple {farmType === "stall" ? "Stall" : "farm"}.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Farm Stalls Information */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Wheat className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Stalls Overview</CardTitle>
                        <CardDescription>Detailed information about all stalls</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {stalls.length === 0 ? (
                    <div className="text-center py-12">
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {stalls.map((stall, index) => (
                        <div key={stall.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div>
                                <h4 className="font-bold text-xl text-gray-900">{stall.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">{stall.location}</p>
                              </div>
                            </div>
                            <Badge
                              variant={stall.is_pickup ? "default" : "secondary"}
                              className={`px-3 py-1 text-sm font-medium ${stall.is_pickup
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                                }`}
                            >
                              {stall.is_pickup ? "🚚 Pickup Available" : "❌ No Pickup"}
                            </Badge>
                          </div>

                          {/* Stall Images */}
                          {stall.stall_images && stall.stall_images.length > 0 && (
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-purple-100 rounded-md">
                                  <Eye className="h-4 w-4 text-purple-600" />
                                </div>
                                <h5 className="font-semibold text-gray-900">Stall Images</h5>
                                <Badge variant="outline" className="ml-2">
                                  {stall.stall_images.length} {stall.stall_images.length === 1 ? 'photo' : 'photos'}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {stall.stall_images.slice(0, 4).map((imageName, idx) => {
                                  // Get public URL for the image
                                  const { data: imageUrl } = supabase.storage
                                    .from('farmers_bucket')
                                    .getPublicUrl(`${selectedFarm?.id}/stalls/${imageName}`);
                                  
                                  return (
                                    <div key={idx} className="relative group cursor-pointer">
                                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors">
                                        <img
                                          src={imageUrl.publicUrl}
                                          alt={`${stall.name} - Image ${idx + 1}`}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                          onError={(e) => {
                                            // Fallback to placeholder if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%236b7280' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                                          }}
                                        />
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Eye className="h-5 w-5" />
                                          </div>
                                        </div>
                                      </div>
                                      {/* Image index indicator */}
                                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                        {idx + 1}
                                      </div>
                                    </div>
                                  );
                                })}
                                {stall.stall_images.length > 4 && (
                                  <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <div className="text-center">
                                      <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                      <span className="text-xs text-gray-500 font-medium">
                                        +{stall.stall_images.length - 4} more
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Pickup Information */}
                            <div className="bg-white rounded-lg p-4 border border-gray-100">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-blue-100 rounded-md">
                                  <Package className="h-4 w-4 text-blue-600" />
                                </div>
                                <h5 className="font-semibold text-gray-900">Pickup Details</h5>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                                  <span className="text-sm font-medium text-gray-600">Status:</span>
                                  <span className={`text-sm font-semibold ${stall.is_pickup ? "text-green-600" : "text-red-600"}`}>
                                    {stall.is_pickup ? "✅ Available" : "❌ Not Available"}
                                  </span>
                                </div>
                                {stall.is_pickup && (
                                  <>
                                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                                      <span className="text-sm font-medium text-gray-600">Hours:</span>
                                      <span className="text-sm font-semibold text-gray-900">
                                        🕐 {stall.pickup_from || 'N/A'} - {stall.pickup_to || 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                                      <span className="text-sm font-medium text-gray-600">Capacity/Slot:</span>
                                      <span className="text-sm font-semibold text-gray-900">
                                        👥 {stall.capacityPerSlot || 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                                      <span className="text-sm font-medium text-gray-600">Prep Buffer:</span>
                                      <span className="text-sm font-semibold text-gray-900">
                                        ⏱️ {stall.prep_buffer || 'N/A'}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Location & Security */}
                            <div className="bg-white rounded-lg p-4 border border-gray-100">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-green-100 rounded-md">
                                  <Shield className="h-4 w-4 text-green-600" />
                                </div>
                                <h5 className="font-semibold text-gray-900">Location & Security</h5>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                                  <span className="text-sm font-medium text-gray-600">Fence Radius:</span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    🛡️ {stall.fence_radius_m || 'N/A'} meters
                                  </span>
                                </div>
                                <div className="py-2 px-3 bg-gray-50 rounded-md">
                                  <span className="text-sm font-medium text-gray-600 block mb-1">Location:</span>
                                  <span className="text-sm text-gray-900 line-clamp-2">
                                    📍 {stall.location}
                                  </span>
                                </div>
                                {stall.longitude && stall.latitude && (
                                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                                    <span className="text-sm font-medium text-gray-600">Coordinates:</span>
                                    <span className="text-xs font-mono text-gray-900 bg-white px-2 py-1 rounded border">
                                      {stall.latitude.toFixed(4)}, {stall.longitude.toFixed(4)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Operating Hours */}
                          <div className="bg-white rounded-lg p-4 border border-gray-100 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="p-1.5 bg-orange-100 rounded-md">
                                <Clock className="h-4 w-4 text-orange-600" />
                              </div>
                              <h5 className="font-semibold text-gray-900">Operating Hours</h5>
                            </div>
                            {stall.operating_hours && Object.keys(stall.operating_hours).length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {Object.entries(stall.operating_hours).map(([day, hours]) => (
                                  <div key={day} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <div className="flex items-center justify-between">
                                      <span className="capitalize font-medium text-sm text-gray-700">{day}</span>
                                      <div className="text-right">
                                        {hours.isOpen ? (
                                          hours.intervals && hours.intervals.length > 0 ? (
                                            <div className="space-y-1">
                                              {hours.intervals.map((interval, idx) => (
                                                <div key={idx} className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                                  {interval.start}-{interval.end}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Open</span>
                                          )
                                        ) : (
                                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">Closed</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground text-sm">No operating hours configured</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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
                        <Label>Pickup Status</Label>
                        <Select
                          value={stallFormData.isPickup ? "available" : "not_available"}
                          onValueChange={(value) => setStallFormData({ ...stallFormData, isPickup: value === "available" })}
                          disabled={isStallLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select attendance status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="not_available">Not Available</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {stallFormData.isPickup &&
                        <>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>From</Label>
                                <Input
                                  type="time"
                                  value={stallFormData.pickupFrom || '09:00'}
                                  onChange={(e) => {
                                    setStallFormData({
                                      ...stallFormData,
                                      pickupFrom: e.target.value
                                    });
                                  }}
                                  className={stallErrors.pickupFrom ? 'border-destructive' : ''}
                                  disabled={isStallLoading}
                                />
                                {stallErrors.pickupFrom && <p className="text-sm text-destructive">{stallErrors.pickupFrom}</p>}
                              </div>
                              <div>
                                <Label>To</Label>
                                <Input
                                  type="time"
                                  value={stallFormData.pickupTo || '17:00'}
                                  onChange={(e) => {
                                    setStallFormData({
                                      ...stallFormData,
                                      pickupTo: e.target.value
                                    });
                                  }}
                                  className={stallErrors.pickupTo ? 'border-destructive' : ''}
                                  disabled={isStallLoading}
                                />
                                {stallErrors.pickupTo && <p className="text-sm text-destructive">{stallErrors.pickupTo}</p>}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="stall-name">Capacity per slot</Label>
                              <Input
                                id="capacity-per-slot"
                                type="number"
                                value={stallFormData.capacityPerSlot}
                                onChange={(e) => setStallFormData({ ...stallFormData, capacityPerSlot: Number(e.target.value) })}
                                placeholder="Enter capacity per slot"
                                className={stallErrors.capacityPerSlot ? "border-destructive" : ""}
                                disabled={isStallLoading}
                              />
                              {stallErrors.capacityPerSlot && <p className="text-sm text-destructive">{stallErrors.capacityPerSlot}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="stall-name">Prep Buffer</Label>
                              <Input
                                id="stall-name"
                                value={stallFormData.prep_buffer}
                                onChange={(e) => setStallFormData({ ...stallFormData, prep_buffer: e.target.value })}
                                placeholder="Enter prep buffer"
                                className={stallErrors.name ? "border-destructive" : ""}
                                disabled={isStallLoading}
                              />
                              {stallErrors.prep_buffer && <p className="text-sm text-destructive">{stallErrors.prep_buffer}</p>}
                            </div>
                          </div>
                        </>}

                      <div className="space-y-2">
                        <Label>Select Products</Label>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-md">
                          {inventory && inventory.length > 0 ? (
                            inventory.map((item, index) => (
                              <label key={index} className="flex items-center gap-2 border rounded-md p-2 hover:bg-accent cursor-pointer">
                                <Checkbox
                                  checked={selectedInventoryIds.includes(item.product.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedInventoryIds((prev) => Array.from(new Set([...prev, item.product.id])));
                                    } else {
                                      setSelectedInventoryIds((prev) => prev.filter((id) => id !== item.product.id));
                                    }
                                  }}
                                />
                                <div className="text-sm">
                                  <div className="font-medium">{item.product.title || item.id}</div>
                                </div>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No inventory items available.</p>
                          )}
                        </div>
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
                        <ImageUploader
                          maxFiles={5}
                          previews={photoPreviews}
                          onFilesChange={(files) => {
                            const total = files.length + (stallFormData.photos?.length || 0);
                            if (total > 5) {
                              toast({
                                variant: "destructive",
                                title: "Too many files",
                                description: "You can upload a maximum of 5 photos"
                              });
                              return;
                            }
                            const newPreviews = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
                            setPhotoPreviews((prev) => [...prev, ...newPreviews]);
                            setStallFormData({ ...stallFormData, photos: [...(stallFormData.photos || []), ...files] });
                          }}
                          onRemovePreview={(url) => {
                            URL.revokeObjectURL(url);
                            const removedPreview = photoPreviews.find(p => p.url === url);
                            if (!removedPreview) return;

                            setPhotoPreviews((prev) => prev.filter((x) => x.url !== url));
                            setStallFormData((prev) => ({
                              ...prev,
                              photos: (prev.photos || []).filter((f) => f.name !== removedPreview.file.name || f.size !== removedPreview.file.size)
                            }));
                          }}
                        />
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
                            isPickup: true,
                            selectedDay: 'monday',
                            pickupFrom: '09:00',
                            pickupTo: '17:00',
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


        {/* ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
        {/* ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
        {/* ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
        {/* ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
        {/* ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}


        {/* Configure Stall Modal */}
        <Dialog open={addFarmStallModalOpen} onOpenChange={setAddFarmStallModalOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">Configure Stall</DialogTitle>
            </DialogHeader>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent>
                <form onSubmit={handleConfigureStallSubmission} className="space-y-4">
                  <>
                    <div className="space-y-2">
                      <Label>Pickup Status</Label>
                      <Select
                        value={configureStallFormData.isPickup ? "available" : "not_available"}
                        onValueChange={(value) => setConfigureStallFormData({ ...stallFormData, isPickup: value === "available" })}
                        disabled={isStallLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select attendance status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="not_available">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {configureStallFormData.isPickup &&
                      <>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>From</Label>
                              <Input
                                type="time"
                                value={stallFormData.pickupFrom || '09:00'}
                                onChange={(e) => {
                                  setConfigureStallFormData({
                                    ...configureStallFormData,
                                    pickupFrom: e.target.value
                                  });
                                }}
                                className={stallErrors.pickupFrom ? 'border-destructive' : ''}
                                disabled={isStallLoading}
                              />
                              {stallErrors.pickupFrom && <p className="text-sm text-destructive">{stallErrors.pickupFrom}</p>}
                            </div>
                            <div>
                              <Label>To</Label>
                              <Input
                                type="time"
                                value={configureStallFormData.pickupTo || '17:00'}
                                onChange={(e) => {
                                  setConfigureStallFormData({
                                    ...configureStallFormData,
                                    pickupTo: e.target.value
                                  });
                                }}
                                className={stallErrors.pickupTo ? 'border-destructive' : ''}
                                disabled={isStallLoading}
                              />
                              {stallErrors.pickupTo && <p className="text-sm text-destructive">{stallErrors.pickupTo}</p>}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stall-name">Capacity per slot</Label>
                            <Input
                              id="capacity-per-slot"
                              type="number"
                              value={configureStallFormData.capacityPerSlot}
                              onChange={(e) => setConfigureStallFormData({ ...configureStallFormData, capacityPerSlot: Number(e.target.value) })}
                              placeholder="Enter capacity per slot"
                              className={stallErrors.capacityPerSlot ? "border-destructive" : ""}
                              disabled={isStallLoading}
                            />
                            {stallErrors.capacityPerSlot && <p className="text-sm text-destructive">{stallErrors.capacityPerSlot}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stall-name">Prep Buffer</Label>
                            <Input
                              id="stall-name"
                              value={configureStallFormData.prep_buffer}
                              onChange={(e) => setConfigureStallFormData({ ...configureStallFormData, prep_buffer: e.target.value })}
                              placeholder="Enter prep buffer"
                              className={stallErrors.name ? "border-destructive" : ""}
                              disabled={isStallLoading}
                            />
                            {stallErrors.prep_buffer && <p className="text-sm text-destructive">{stallErrors.prep_buffer}</p>}
                          </div>
                        </div>
                      </>}

                    <div className="space-y-2">
                      <Label>Geo-fence radius</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-full">
                          <Slider
                            value={[configureStallFormData.fenceRadius || 75]}
                            min={50}
                            max={150}
                            step={1}
                            onValueChange={(val: number[]) => {
                              setConfigureStallFormData({ ...configureStallFormData, fenceRadius: val?.[0] ?? 75 });
                            }}
                          />
                        </div>
                        <div className="w-20 text-right">
                          <span className="text-sm font-medium">{configureStallFormData.fenceRadius ?? 75} m</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Set radius for geo-fencing around the stall (50m - 150m)</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Select Products</Label>
                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-md">
                        {inventory && inventory.length > 0 ? (
                          inventory.map((item, index) => (
                            <label key={index} className="flex items-center gap-2 border rounded-md p-2 hover:bg-accent cursor-pointer">
                              <Checkbox
                                checked={selectedInventoryIds.includes(item.product.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedInventoryIds((prev) => Array.from(new Set([...prev, item.product.id])));
                                  } else {
                                    setSelectedInventoryIds((prev) => prev.filter((id) => id !== item.product.id));
                                  }
                                }}
                              />
                              <div className="text-sm">
                                <div className="font-medium">{item.product.title || item.id}</div>
                              </div>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No inventory items available.</p>
                        )}
                      </div>
                    </div>
                  </>
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Operating Hours</Label>
                        <Select
                          value={configureStallFormData.selectedDay || "monday"}
                          onValueChange={(value) => setConfigureStallFormData({ ...configureStallFormData, selectedDay: value })}
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
                              {configureStallFormData.operatingHours[configureStallFormData.selectedDay || 'monday']?.isOpen ? (
                                <span className="text-green-600">Open</span>
                              ) : (
                                <span className="text-red-600">Closed</span>
                              )}
                            </div>
                            <Switch
                              checked={configureStallFormData.operatingHours[configureStallFormData.selectedDay || 'monday']?.isOpen}
                              onCheckedChange={(checked) => {
                                const currentDay = configureStallFormData.selectedDay || 'monday';
                                const existing = configureStallFormData.operatingHours[currentDay];
                                // When enabling, ensure at least one interval exists
                                const intervals = existing?.intervals && existing.intervals.length > 0 ? existing.intervals : [{ start: '09:00', end: '17:00' }];
                                setConfigureStallFormData({
                                  ...configureStallFormData,
                                  operatingHours: {
                                    ...configureStallFormData.operatingHours,
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
                          {configureStallFormData.operatingHours[configureStallFormData.selectedDay || 'monday']?.intervals?.map((interval, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Input
                                type="time"
                                value={interval.start}
                                onChange={(e) => {
                                  const currentDay = stallFormData.selectedDay || 'monday';
                                  const newIntervals = (stallFormData.operatingHours[currentDay]?.intervals || []).map((it, i) => i === idx ? { ...it, start: e.target.value } : it);
                                  setConfigureStallFormData({
                                    ...stallFormData,
                                    operatingHours: {
                                      ...stallFormData.operatingHours,
                                      [currentDay]: {
                                        ...configureStallFormData.operatingHours[currentDay],
                                        intervals: newIntervals,
                                        isOpen: true
                                      }
                                    }
                                  });
                                }}
                                className={stallErrors[`operatingHours.start.${idx}`] ? 'border-destructive' : ''}
                                disabled={isStallLoading || !configureStallFormData.operatingHours[configureStallFormData.selectedDay || 'monday']?.isOpen}
                              />
                              <span>to</span>
                              <Input
                                type="time"
                                value={interval.end}
                                onChange={(e) => {
                                  const currentDay = configureStallFormData.selectedDay || 'monday';
                                  const newIntervals = (configureStallFormData.operatingHours[currentDay]?.intervals || []).map((it, i) => i === idx ? { ...it, end: e.target.value } : it);
                                  setConfigureStallFormData({
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
                                disabled={isStallLoading || !configureStallFormData.operatingHours[configureStallFormData.selectedDay || 'monday']?.isOpen}
                              />

                              <div className="flex items-center gap-2">
                                {(configureStallFormData.operatingHours[configureStallFormData.selectedDay || 'monday']?.intervals?.length || 0) > 1 && (
                                  <Button type="button" variant="destructive" onClick={() => {
                                    const currentDay = configureStallFormData.selectedDay || 'monday';
                                    const newIntervals = (configureStallFormData.operatingHours[currentDay]?.intervals || []).filter((_, i) => i !== idx);
                                    setConfigureStallFormData({
                                      ...configureStallFormData,
                                      operatingHours: {
                                        ...configureStallFormData.operatingHours,
                                        [currentDay]: {
                                          ...configureStallFormData.operatingHours[currentDay],
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
                              const currentDay = configureStallFormData.selectedDay || 'monday';
                              const newIntervals = [...(configureStallFormData.operatingHours[currentDay]?.intervals || []), { start: '09:00', end: '17:00' }];
                              setConfigureStallFormData({
                                ...stallFormData,
                                operatingHours: {
                                  ...configureStallFormData.operatingHours,
                                  [currentDay]: {
                                    ...configureStallFormData.operatingHours[currentDay],
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
                      <ImageUploader
                        maxFiles={5}
                        previews={photoPreviews}
                        onFilesChange={(files) => {
                          const total = files.length + (configureStallFormData.photos?.length || 0);
                          if (total > 5) {
                            toast({
                              variant: "destructive",
                              title: "Too many files",
                              description: "You can upload a maximum of 5 photos"
                            });
                            return;
                          }
                          const newPreviews = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
                          setPhotoPreviews((prev) => [...prev, ...newPreviews]);
                          setConfigureStallFormData({ ...configureStallFormData, photos: [...(configureStallFormData.photos || []), ...files] });
                        }}
                        onRemovePreview={(url) => {
                          URL.revokeObjectURL(url);
                          const removedPreview = photoPreviews.find(p => p.url === url);
                          if (!removedPreview) return;

                          setPhotoPreviews((prev) => prev.filter((x) => x.url !== url));
                          setConfigureStallFormData((prev) => ({
                            ...prev,
                            photos: (prev.photos || []).filter((f) => f.name !== removedPreview.file.name || f.size !== removedPreview.file.size)
                          }));
                        }}
                      />
                    </div>
                  </>

                  <div className="flex items-center justify-between">
                    <div>
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
                            isPickup: true,
                            selectedDay: 'monday',
                            pickupFrom: '09:00',
                            pickupTo: '17:00',
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
                        }}
                        disabled={isStallLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isStallLoading}>
                        {isStallLoading ? 'Processing...' : 'Finish'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the stall "{stallToDelete?.name}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setStallToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStall} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default FarmerDashboard;