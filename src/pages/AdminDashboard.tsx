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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Eye, Clock, FileText, TrendingUp, Plus, Edit, Trash, Mail, Send, User as UserIcon, MapPin, Info, Calendar, Check, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { User } from "@supabase/supabase-js";

interface FarmerApplication {
  id: string;
  user_id: string;
  contact_person: string;
  email: string;
  phone: string;
  farm_name: string;
  farm_address: string;
  farm_bio: string;
  products: string[];
  approval_status: string;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billing_cycle: string;
  max_number_of_product: number;
  transaction_fee: number;
  is_active: boolean;
  can_see_sales_reports: boolean;
  can_shopper_subscription: boolean;
  can_accept_pre_order: boolean;
  can_access_customer_contact_list: boolean;
  can_create_branded_stall_page: boolean;
  can_create_custom_coupon: boolean;
  can_run_custom_promosion: boolean;
  can_create_multiple_stand: boolean;
  allowed_to_business_in_multiple_location: boolean;
  can_access_to_advanced_analytics: boolean;
  can_eligible_for_priority_map_placement: boolean;
  can_sale_wholesale_and_bulk: boolean;
  can_receive_loyalty_rewards: boolean;
  allowed_to_get_marketing_campaign_credits: boolean;
  allowed_to_run_event_management_and_ticketing: boolean;
  access_to_bulk_promotional_tools: boolean;
  allowed_to_customizable_loyalty_programs: boolean;
  access_to_advanced_branding_options: boolean;
  can_have_dedicated_account_manager: boolean;
  access_to_white_label_option: boolean;
  created_at: string;
  updated_at: string;
}

interface UserEmail {
  id: string;
  email: string;
  full_name: string;
  role: string;
  email_confirmed_at: string | null;
  created_at: string;
}

interface FarmerPlanAssignment {
  user_id: string;
  user_email: string;
  user_full_name: string;
  current_plan_id: string;
  current_plan_name: string;
  assigned_at: string;
  is_active: boolean;
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [applications, setApplications] = useState<FarmerApplication[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [farmerPlans, setFarmerPlans] = useState<FarmerPlanAssignment[]>([]);
  const [userEmails, setUserEmails] = useState<UserEmail[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<FarmerApplication | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerPlanAssignment | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserEmail | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | 'confirm-email' | 'resend-email' | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planChangeModalOpen, setPlanChangeModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [planFormData, setPlanFormData] = useState<Partial<PricingPlan>>({});
  const [newPlanId, setNewPlanId] = useState<string>('');
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("applications");
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

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles' as any)
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if ((profile as any)?.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard."
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await fetchApplications();
      await fetchPricingPlans();
      await fetchFarmerPlans();
      await fetchUserEmails();
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmerPlans = async () => {
    try {
      // First get all farm pricing plans
      const { data: planData, error: planError } = await supabase
        .from('farm_pricing_plans')
        .select(`
          user_id,
          pricing_plan_id,
          assigned_at,
          is_active,
          pricing_plans (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (planError) throw planError;

      // Then get user profiles for those users
      const userIds = planData?.map(item => item.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get farmer applications as fallback for missing profile data
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('farmer_applications')
        .select('user_id, email, contact_person')
        .in('user_id', userIds);

      if (applicationsError) throw applicationsError;

      // Combine the data with fallbacks
      const formattedData: FarmerPlanAssignment[] = (planData || []).map(item => {
        const profile = profilesData?.find(p => p.id === item.user_id);
        const application = applicationsData?.find(app => app.user_id === item.user_id);
        
        // Use profile data if available, otherwise fall back to application data
        const email = profile?.email || application?.email || 'No email found';
        const fullName = profile?.full_name || application?.contact_person || 'No name found';
        
        return {
          user_id: item.user_id,
          user_email: email,
          user_full_name: fullName,
          current_plan_id: item.pricing_plan_id,
          current_plan_name: item.pricing_plans?.name || 'Unknown',
          assigned_at: item.assigned_at,
          is_active: item.is_active
        };
      });

      setFarmerPlans(formattedData);
    } catch (error) {
      console.error('Error fetching farmer plans:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch farmer plan assignments."
      });
    }
  };

  const fetchUserEmails = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-auth-status');

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch user auth status');
      }

      setUserEmails(data.data || []);
    } catch (error) {
      console.error('Error fetching user emails:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user email data."
      });
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('farmer_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(app => app.approval_status === 'pending').length || 0;
      const approved = data?.filter(app => app.approval_status === 'approved').length || 0;
      const rejected = data?.filter(app => app.approval_status === 'rejected').length || 0;

      setStats({
        totalApplications: total,
        pendingApplications: pending,
        approvedApplications: approved,
        rejectedApplications: rejected
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch farmer applications."
      });
    }
  };

  const fetchPricingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPricingPlans(data || []);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch pricing plans."
      });
    }
  };

  const handleCreatePlan = () => {
    setPlanFormData({
      name: '',
      price: '',
      billing_cycle: 'monthly',
      max_number_of_product: 0,
      transaction_fee: 0,
      is_active: true,
      can_see_sales_reports: false,
      can_shopper_subscription: false,
      can_accept_pre_order: false,
      can_access_customer_contact_list: false,
      can_create_branded_stall_page: false,
      can_create_custom_coupon: false,
      can_run_custom_promosion: false,
      can_create_multiple_stand: false,
      allowed_to_business_in_multiple_location: false,
      can_access_to_advanced_analytics: false,
      can_eligible_for_priority_map_placement: false,
      can_sale_wholesale_and_bulk: false,
      can_receive_loyalty_rewards: false,
      allowed_to_get_marketing_campaign_credits: false,
      allowed_to_run_event_management_and_ticketing: false,
      access_to_bulk_promotional_tools: false,
      allowed_to_customizable_loyalty_programs: false,
      access_to_advanced_branding_options: false,
      can_have_dedicated_account_manager: false,
      access_to_white_label_option: false
    });
    setEditingPlan(null);
    setPlanModalOpen(true);
  };

  const handleEditPlan = (plan: PricingPlan) => {
    setPlanFormData(plan);
    setEditingPlan(plan.id);
    setPlanModalOpen(true);
  };

  const handleSavePlan = async () => {
    try {
      const planData = {
        name: planFormData.name || '',
        price: planFormData.price || '',
        billing_cycle: planFormData.billing_cycle || 'monthly',
        max_number_of_product: planFormData.max_number_of_product || 0,
        transaction_fee: planFormData.transaction_fee || 0,
        is_active: planFormData.is_active ?? true,
        can_see_sales_reports: planFormData.can_see_sales_reports ?? false,
        can_shopper_subscription: planFormData.can_shopper_subscription ?? false,
        can_accept_pre_order: planFormData.can_accept_pre_order ?? false,
        can_access_customer_contact_list: planFormData.can_access_customer_contact_list ?? false,
        can_create_branded_stall_page: planFormData.can_create_branded_stall_page ?? false,
        can_create_custom_coupon: planFormData.can_create_custom_coupon ?? false,
        can_run_custom_promosion: planFormData.can_run_custom_promosion ?? false,
        can_create_multiple_stand: planFormData.can_create_multiple_stand ?? false,
        allowed_to_business_in_multiple_location: planFormData.allowed_to_business_in_multiple_location ?? false,
        can_access_to_advanced_analytics: planFormData.can_access_to_advanced_analytics ?? false,
        can_eligible_for_priority_map_placement: planFormData.can_eligible_for_priority_map_placement ?? false,
        can_sale_wholesale_and_bulk: planFormData.can_sale_wholesale_and_bulk ?? false,
        can_receive_loyalty_rewards: planFormData.can_receive_loyalty_rewards ?? false,
        allowed_to_get_marketing_campaign_credits: planFormData.allowed_to_get_marketing_campaign_credits ?? false,
        allowed_to_run_event_management_and_ticketing: planFormData.allowed_to_run_event_management_and_ticketing ?? false,
        access_to_bulk_promotional_tools: planFormData.access_to_bulk_promotional_tools ?? false,
        allowed_to_customizable_loyalty_programs: planFormData.allowed_to_customizable_loyalty_programs ?? false,
        access_to_advanced_branding_options: planFormData.access_to_advanced_branding_options ?? false,
        can_have_dedicated_account_manager: planFormData.can_have_dedicated_account_manager ?? false,
        access_to_white_label_option: planFormData.access_to_white_label_option ?? false
      };

      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('pricing_plans')
          .update(planData)
          .eq('id', editingPlan);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Pricing plan updated successfully."
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('pricing_plans')
          .insert(planData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Pricing plan created successfully."
        });
      }

      setPlanModalOpen(false);
      await fetchPricingPlans();
    } catch (error) {
      console.error('Error saving pricing plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save pricing plan."
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pricing plan deleted successfully."
      });

      await fetchPricingPlans();
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete pricing plan."
      });
    }
  };

  const handleChangeFarmerPlan = (farmer: FarmerPlanAssignment) => {
    setSelectedFarmer(farmer);
    setNewPlanId(farmer.current_plan_id);
    setPlanChangeModalOpen(true);
  };

  const handleSaveFarmerPlanChange = async () => {
    if (!selectedFarmer || !newPlanId) return;

    try {
      // Deactivate current plan assignment
      const { error: deactivateError } = await supabase
        .from('farm_pricing_plans')
        .update({ is_active: false })
        .eq('user_id', selectedFarmer.user_id)
        .eq('is_active', true);

      if (deactivateError) throw deactivateError;

      // Create new plan assignment
      const { error: createError } = await supabase
        .from('farm_pricing_plans')
        .insert({
          user_id: selectedFarmer.user_id,
          pricing_plan_id: newPlanId,
          assigned_by: user?.id,
          is_active: true
        });

      if (createError) throw createError;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        action_type: 'farmer_plan_change',
        target_user_id: selectedFarmer.user_id,
        action_details: {
          old_plan_id: selectedFarmer.current_plan_id,
          new_plan_id: newPlanId
        }
      });

      toast({
        title: "Success",
        description: "Farmer plan updated successfully."
      });

      setPlanChangeModalOpen(false);
      setSelectedFarmer(null);
      await fetchFarmerPlans();
    } catch (error) {
      console.error('Error updating farmer plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update farmer plan."
      });
    }
  };

  const handleEmailAction = async (userId: string, action: 'confirm-email' | 'resend-email') => {
    if (!user) return;

    try {
      const actionType = action === 'confirm-email' ? 'confirm' : 'resend';
      
      const { data, error } = await supabase.functions.invoke('admin-confirm-email', {
        body: { 
          userId,
          action: actionType
        }
      });

      if (error) {
        console.error('Error in email action:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Email action failed');
      }

      toast({
        title: "Success",
        description: action === 'confirm-email' 
          ? "Email confirmed successfully!" 
          : "Confirmation email resent successfully!",
      });

      // Log admin action
      await supabase.rpc('log_admin_action', {
        action_type: `user_email_${action.replace('-', '_')}`,
        target_user_id: userId,
        action_details: { action }
      });

      await fetchUserEmails();
      setSelectedUser(null);
      setActionType(null);
    } catch (error) {
      console.error(`Error ${action}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action.replace('-', ' ')}.`
      });
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject' | 'delete') => {
    if (!user) return;

    try {
      if (action === 'delete') {
        // Delete the application
        const { error } = await supabase
          .from('farmer_applications')
          .delete()
          .eq('id', applicationId);

        if (error) throw error;

        // Log admin action
        await supabase.rpc('log_admin_action', {
          action_type: 'farmer_application_delete',
          target_user_id: applications.find(app => app.id === applicationId)?.user_id,
          action_details: { application_id: applicationId }
        });

        toast({
          title: "Success",
          description: "Application deleted successfully."
        });

        await fetchApplications();
        setSelectedApplication(null);
        setActionType(null);
        return;
      }

      if (action === 'approve') {
        // Use the new approve_farmer_application function for robust approval handling
        const { data, error } = await supabase.rpc('approve_farmer_application', {
          application_id: applicationId,
          approved_by_admin: user.id
        });

        if (error) {
          console.error('Error approving application:', error);
          throw error;
        }

        toast({
          title: "Success",
          description: "Application approved successfully. Farm and farmer account created!"
        });
      } else if (action === 'reject') {
        // Handle reject action
        const updateData = {
          approval_status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        };

        const { error } = await supabase
          .from('farmer_applications')
          .update(updateData)
          .eq('id', applicationId);

        if (error) throw error;

        // Log admin action
        await supabase.rpc('log_admin_action', {
          action_type: 'farmer_application_reject',
          target_user_id: applications.find(app => app.id === applicationId)?.user_id,
          action_details: { application_id: applicationId }
        });

        toast({
          title: "Success",
          description: "Application rejected successfully."
        });
      }

      await fetchApplications();
      await fetchFarmerPlans(); // Refresh farmer plans to show newly assigned plans
      setSelectedApplication(null);
      setActionType(null);
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} application: ${error.message || 'Unknown error'}`
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage farmer applications and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedApplications}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejectedApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">Farmer Applications</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
            <TabsTrigger value="farmer-plans">Farmer Plan Management</TabsTrigger>
            <TabsTrigger value="email-management">Email Management</TabsTrigger>
          </TabsList>
          
          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Farmer Applications</CardTitle>
                <CardDescription>
                  Review and manage farmer registration applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Farm Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.contact_person}
                        </TableCell>
                        <TableCell>{application.farm_name}</TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>{getStatusBadge(application.approval_status)}</TableCell>
                        <TableCell>
                          {new Date(application.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setViewModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {application.approval_status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setActionType('approve');
                                  }}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setActionType('reject');
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {/* Delete button for all applications */}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setActionType('delete');
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {applications.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No farmer applications found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Plans Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pricing Plans</CardTitle>
                  <CardDescription>
                    Manage subscription plans for farmers
                  </CardDescription>
                </div>
                <Button onClick={handleCreatePlan}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Plan
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Billing Cycle</TableHead>
                      <TableHead>Max Products</TableHead>
                      <TableHead>Transaction Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{plan.price}</TableCell>
                        <TableCell className="capitalize">{plan.billing_cycle}</TableCell>
                        <TableCell>{plan.max_number_of_product}</TableCell>
                        <TableCell>{plan.transaction_fee}%</TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPlan(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedPlan(plan);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {pricingPlans.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pricing plans found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Farmer Plan Management Tab */}
          <TabsContent value="farmer-plans">
            <Card>
              <CardHeader>
                <CardTitle>Farmer Plan Management</CardTitle>
                <CardDescription>
                  View and manage pricing plan assignments for farmers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Farmer Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Plan</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {farmerPlans.map((farmer) => (
                      <TableRow key={farmer.user_id}>
                        <TableCell className="font-medium">
                          {farmer.user_full_name}
                        </TableCell>
                        <TableCell>{farmer.user_email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{farmer.current_plan_name}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(farmer.assigned_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={farmer.is_active ? "default" : "secondary"}>
                            {farmer.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeFarmerPlan(farmer)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Change Plan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {farmerPlans.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No farmers with plan assignments found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Management Tab */}
          <TabsContent value="email-management">
            <Card>
              <CardHeader>
                <CardTitle>Email Management</CardTitle>
                <CardDescription>
                  Manage user email confirmations and send confirmation emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userEmails.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.email_confirmed_at ? "default" : "destructive"}>
                            {user.email_confirmed_at ? "Confirmed" : "Unconfirmed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {!user.email_confirmed_at && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setActionType('confirm-email');
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setActionType('resend-email');
                                  }}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Resend
                                </Button>
                              </>
                            )}
                            {user.email_confirmed_at && (
                              <span className="text-sm text-muted-foreground">
                                Confirmed on {new Date(user.email_confirmed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {userEmails.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Application Action Confirmation Dialog */}
        <AlertDialog open={!!actionType} onOpenChange={() => {
          setActionType(null);
          setSelectedApplication(null);
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Delete'} Application
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {actionType} the application from{' '}
                <strong>{selectedApplication?.contact_person}</strong> for{' '}
                <strong>{selectedApplication?.farm_name}</strong>?
                {actionType === 'approve' && (
                  <span className="block mt-2 text-sm">
                    This will create a farm entry and grant farmer permissions to the user.
                  </span>
                )}
                {actionType === 'delete' && (
                  <span className="block mt-2 text-sm text-red-600">
                    This action cannot be undone. The application will be permanently deleted.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedApplication && actionType && (actionType === 'approve' || actionType === 'reject' || actionType === 'delete')) {
                    handleApplicationAction(selectedApplication.id, actionType);
                  }
                }}
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Email Action Confirmation Dialog */}
        <AlertDialog open={!!(actionType && (actionType === 'confirm-email' || actionType === 'resend-email'))} onOpenChange={() => {
          setActionType(null);
          setSelectedUser(null);
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === 'confirm-email' ? 'Confirm Email' : 'Resend Confirmation Email'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {actionType === 'confirm-email' ? 'manually confirm the email for' : 'resend confirmation email to'}{' '}
                <strong>{selectedUser?.full_name || selectedUser?.email}</strong>?
                {actionType === 'confirm-email' && (
                  <span className="block mt-2 text-sm">
                    This will mark the email as confirmed without requiring user action.
                  </span>
                )}
                {actionType === 'resend-email' && (
                  <span className="block mt-2 text-sm">
                    This will send a new confirmation email to the user.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedUser && actionType && (actionType === 'confirm-email' || actionType === 'resend-email')) {
                    handleEmailAction(selectedUser.id, actionType);
                  }
                }}
                className={actionType === 'confirm-email' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {actionType === 'confirm-email' ? 'Confirm Email' : 'Resend Email'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Plan Confirmation Dialog */}
        <AlertDialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Pricing Plan</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the pricing plan "{selectedPlan?.name}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedPlan) {
                    handleDeletePlan(selectedPlan.id);
                    setSelectedPlan(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Pricing Plan Form Modal */}
        <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
              </DialogTitle>
              <DialogDescription>
                Configure the features and pricing for this plan.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={planFormData.name || ''}
                    onChange={(e) => setPlanFormData({...planFormData, name: e.target.value})}
                    placeholder="e.g., Basic, Premium, Enterprise"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={planFormData.price || ''}
                    onChange={(e) => setPlanFormData({...planFormData, price: e.target.value})}
                    placeholder="e.g., $9.99, Free"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billing_cycle">Billing Cycle</Label>
                  <Select
                    value={planFormData.billing_cycle || 'monthly'}
                    onValueChange={(value) => setPlanFormData({...planFormData, billing_cycle: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_products">Max Number of Products</Label>
                  <Input
                    id="max_products"
                    type="number"
                    value={planFormData.max_number_of_product || 0}
                    onChange={(e) => setPlanFormData({...planFormData, max_number_of_product: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transaction_fee">Transaction Fee (%)</Label>
                  <Input
                    id="transaction_fee"
                    type="number"
                    step="0.01"
                    value={planFormData.transaction_fee || 0}
                    onChange={(e) => setPlanFormData({...planFormData, transaction_fee: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={planFormData.is_active ?? true}
                    onCheckedChange={(checked) => setPlanFormData({...planFormData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active Plan</Label>
                </div>
              </div>
              
              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Features</h3>
                
                <div className="space-y-3">
                  {[
                    { key: 'can_see_sales_reports', label: 'View Sales Reports' },
                    { key: 'can_shopper_subscription', label: 'Shopper Subscriptions' },
                    { key: 'can_accept_pre_order', label: 'Accept Pre-orders' },
                    { key: 'can_access_customer_contact_list', label: 'Customer Contact List' },
                    { key: 'can_create_branded_stall_page', label: 'Branded Stall Page' },
                    { key: 'can_create_custom_coupon', label: 'Custom Coupons' },
                    { key: 'can_run_custom_promosion', label: 'Custom Promotions' },
                    { key: 'can_create_multiple_stand', label: 'Multiple Stands' },
                    { key: 'allowed_to_business_in_multiple_location', label: 'Multiple Locations' },
                    { key: 'can_access_to_advanced_analytics', label: 'Advanced Analytics' },
                    { key: 'can_eligible_for_priority_map_placement', label: 'Priority Map Placement' },
                    { key: 'can_sale_wholesale_and_bulk', label: 'Wholesale & Bulk Sales' },
                    { key: 'can_receive_loyalty_rewards', label: 'Loyalty Rewards' },
                    { key: 'allowed_to_get_marketing_campaign_credits', label: 'Marketing Campaign Credits' },
                    { key: 'allowed_to_run_event_management_and_ticketing', label: 'Event Management' },
                    { key: 'access_to_bulk_promotional_tools', label: 'Bulk Promotional Tools' },
                    { key: 'allowed_to_customizable_loyalty_programs', label: 'Customizable Loyalty Programs' },
                    { key: 'access_to_advanced_branding_options', label: 'Advanced Branding Options' },
                    { key: 'can_have_dedicated_account_manager', label: 'Dedicated Account Manager' },
                    { key: 'access_to_white_label_option', label: 'White Label Option' }
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center space-x-2">
                      <Switch
                        id={feature.key}
                        checked={planFormData[feature.key as keyof PricingPlan] as boolean ?? false}
                        onCheckedChange={(checked) => setPlanFormData({...planFormData, [feature.key]: checked})}
                      />
                      <Label htmlFor={feature.key} className="text-sm">{feature.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setPlanModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePlan}>
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Farmer Plan Change Modal */}
        <Dialog open={planChangeModalOpen} onOpenChange={setPlanChangeModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Farmer Plan</DialogTitle>
              <DialogDescription>
                Update the pricing plan for {selectedFarmer?.user_full_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Plan</Label>
                <div className="p-2 bg-muted rounded-md">
                  {selectedFarmer?.current_plan_name}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-plan">New Plan</Label>
                <Select value={newPlanId} onValueChange={setNewPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a new plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingPlans
                      .filter(plan => plan.is_active)
                      .map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - {plan.price}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setPlanChangeModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveFarmerPlanChange}
                disabled={newPlanId === selectedFarmer?.current_plan_id}
              >
                Update Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Application Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl truncate">Application Details</DialogTitle>
                  <DialogDescription className="text-muted-foreground break-words">
                    Complete information about the farmer application
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-4">
                {/* Basic Information Card */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <CardTitle className="text-lg truncate">Basic Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                            <p className="text-sm font-semibold text-foreground mt-1 break-words">{selectedApplication.contact_person}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                            <p className="text-sm font-semibold text-foreground mt-1 break-all">{selectedApplication.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                            <p className="text-sm font-semibold text-foreground mt-1 break-words">{selectedApplication.phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <Label className="text-sm font-medium text-muted-foreground">Farm Name</Label>
                            <p className="text-sm font-semibold text-foreground mt-1 break-words">{selectedApplication.farm_name}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Farm Details Card */}
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <CardTitle className="text-lg truncate">Farm Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm font-medium text-muted-foreground">Farm Address</Label>
                        <p className="text-sm font-semibold text-foreground mt-1 break-words">{selectedApplication.farm_address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm font-medium text-muted-foreground">Farm Bio</Label>
                        <div className="mt-1 p-4 bg-muted/30 rounded-lg border min-h-[60px]">
                          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words break-all">
                            {selectedApplication.farm_bio || 'No bio provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm font-medium text-muted-foreground">Products Offered</Label>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedApplication.products.map((product, index) => (
                            <Badge key={index} variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 text-xs break-words max-w-full flex-shrink-0">
                              <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate inline-block max-w-[120px]">{product}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Application Status Card */}
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      <CardTitle className="text-lg truncate">Application Status</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <Label className="text-sm font-medium text-orange-800 truncate">Status</Label>
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(selectedApplication.approval_status)}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <Label className="text-sm font-medium text-blue-800 truncate">Applied Date</Label>
                        </div>
                        <p className="text-sm font-semibold text-blue-900 mt-1 break-words">
                          {new Date(selectedApplication.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      {selectedApplication.approved_at && (
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200 w-full">
                          <div className="flex items-center gap-2 mb-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <Label className="text-sm font-medium text-green-800 truncate">Approved Date</Label>
                          </div>
                          <p className="text-sm font-semibold text-green-900 mt-1 break-words">
                            {new Date(selectedApplication.approved_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                      
                      {selectedApplication.approved_by && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200 w-full">
                          <div className="flex items-center gap-2 mb-2">
                            <UserIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
                            <Label className="text-sm font-medium text-purple-800 truncate">Approved By</Label>
                          </div>
                          <p className="text-sm font-semibold text-purple-900 mt-1 break-words">
                            {(() => {
                              const approver = userEmails.find(user => user.id === selectedApplication.approved_by);
                              return approver ? (approver.full_name || approver.email) : selectedApplication.approved_by;
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <DialogFooter className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setViewModalOpen(false)} className="px-6">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDashboard;