import { Grid, List, Map, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PropertyCard } from "@/components/PropertyCard";
import { FarmCard } from "@/components/FarmCard";
import { MapView } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import { mockProperties } from "@/data/mockProperties";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useViewMode } from "@/hooks/useViewMode";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Farm {
  id: string;
  name: string;
  address: string;
  bio?: string;
  contact_person: string;
  email: string;
  phone?: string;
  location?: any;
  created_at: string;
  farmer_id: string;
}

const Index = () => {
  const { viewMode, setViewMode } = useViewMode();
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Check if user is admin and redirect
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role === 'admin') {
          navigate('/admin');
        }
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  // Fetch farms from Supabase
  const { data: farms = [], isLoading } = useQuery({
    queryKey: ['farms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Farm[];
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar - Always visible */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>
          
          {/* Mobile Filters Sheet */}
          <Sheet open={showFilters && isMobile} onOpenChange={(open) => !open && setShowFilters(false)}>
            <SheetContent side="left" className="w-80 p-0">
              <div className="p-4">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="bg-card rounded-lg border p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                   <h2 className="text-2xl font-bold text-foreground">
                     {isLoading ? 'Loading...' : `${farms.length + mockProperties.length} Farm Listings`}
                   </h2>
                   <p className="text-muted-foreground">
                     {farms.length} Farms and {mockProperties.length} Farm stalls in your area
                   </p>
                </div>
                
                 <div className="flex items-center gap-2">
                   {/* Only show filter button on mobile */}
                   {isMobile && (
                     <Button
                       variant={showFilters ? "default" : "outline"}
                       size="sm"
                       onClick={() => setShowFilters(!showFilters)}
                       className="flex items-center gap-2"
                     >
                       <Filter className="w-4 h-4" />
                       Filters
                     </Button>
                   )}
                   
                   <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                     <button
                       className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                         viewMode === "grid" 
                           ? "bg-farm-green text-white shadow-sm" 
                           : "text-muted-foreground hover:text-foreground hover:bg-background"
                       }`}
                       onClick={() => {
                         console.log("Grid button clicked - switching to grid view");
                         setViewMode("grid");
                       }}
                     >
                       <Grid className="w-4 h-4 mr-1" />
                       Grid
                     </button>
                     <button
                       className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                         viewMode === "list" 
                           ? "bg-farm-green text-white shadow-sm" 
                           : "text-muted-foreground hover:text-foreground hover:bg-background"
                       }`}
                       onClick={() => {
                         console.log("List button clicked - switching to list view");
                         setViewMode("list");
                       }}
                     >
                       <List className="w-4 h-4 mr-1" />
                       List
                     </button>
                     <button
                       className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                         viewMode === "map" 
                           ? "bg-farm-green text-white shadow-sm" 
                           : "text-muted-foreground hover:text-foreground hover:bg-background"
                       }`}
                       onClick={() => {
                         console.log("Map button clicked - switching to map view");
                         setViewMode("map");
                       }}
                     >
                       <Map className="w-4 h-4 mr-1" />
                       Map
                     </button>
                   </div>
                 </div>
               </div>
             </div>
            
            {/* Content based on view mode */}
            {viewMode === "map" ? (
              <div className="relative">
                <MapView />
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading farms...</p>
                </div>
              </div>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {/* Real Farms from Supabase */}
                {farms.map((farm) => (
                  <FarmCard
                    key={farm.id}
                    id={farm.id}
                    name={farm.name}
                    address={farm.address}
                    bio={farm.bio}
                    contact_person={farm.contact_person}
                    email={farm.email}
                    phone={farm.phone}
                  />
                ))}
                
                {/* Mock Properties (Farm stalls) */}
                {mockProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
