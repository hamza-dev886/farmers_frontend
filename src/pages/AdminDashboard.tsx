import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, Clock, Users, FileText, TrendingUp } from "lucide-react";
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
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<FarmerApplication | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
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
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
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
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/');
    } finally {
      setLoading(false);
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

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    if (!user) return;

    try {
      const updateData = {
        approval_status: action === 'approve' ? 'approved' : 'rejected',
        approved_at: new Date().toISOString(),
        approved_by: user.id
      };

      const { error } = await supabase
        .from('farmer_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      // If approved, create a farm entry
      if (action === 'approve') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          const { error: farmError } = await supabase
            .from('farms')
            .insert({
              farmer_id: application.user_id,
              name: application.farm_name,
              address: application.farm_address,
              bio: application.farm_bio,
              contact_person: application.contact_person,
              email: application.email,
              phone: application.phone,
              location: null // Will be set later if needed
            });

          if (farmError) {
            console.error('Error creating farm:', farmError);
          }

          // Update user role to farmer
          const { error: roleError } = await supabase
            .from('profiles')
            .update({ role: 'farmer' })
            .eq('id', application.user_id);

          if (roleError) {
            console.error('Error updating user role:', roleError);
          }
        }
      }

      // Log admin action
      await supabase.rpc('log_admin_action', {
        action_type: `farmer_application_${action}`,
        target_user_id: applications.find(app => app.id === applicationId)?.user_id,
        action_details: { application_id: applicationId }
      });

      toast({
        title: "Success",
        description: `Application ${action}d successfully.`
      });

      await fetchApplications();
      setSelectedApplication(null);
      setActionType(null);
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} application.`
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

        {/* Applications Table */}
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
                            // You could implement a detailed view modal here
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

        {/* Confirmation Dialog */}
        <AlertDialog open={!!actionType} onOpenChange={() => {
          setActionType(null);
          setSelectedApplication(null);
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === 'approve' ? 'Approve' : 'Reject'} Application
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
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedApplication && actionType) {
                    handleApplicationAction(selectedApplication.id, actionType);
                  }
                }}
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default AdminDashboard;