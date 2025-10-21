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
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "@/store/store";
import { searchFarmsWithPostGIS } from "@/services/getFarmfromDB";

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
  const [farms, setFarms] = useState<any[]>([]);
  const { locationCordinates } = useStore(state => state);
  const [searchParams] = useSearchParams();

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const query = searchParams.get('q');

  const { setLocationCordinates } = useStore(state => state)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCordinates({
          lat:latitude,
          lng: longitude
        })
      });
    }
  }, []);

  // Check if user is admin or farmer and redirect
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles' as any)
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if ((profile as any)?.role === 'admin') {
          navigate('/admin');
        } else if ((profile as any)?.role === 'farmer') {
          navigate('/farmer-dashboard');
        }
      }
    };
    
    checkUserRole();
  }, [navigate]);

  async function fetchFarms() {
    const farms = await searchFarmsWithPostGIS({
      userLat: lat || locationCordinates.lat,
      userLon: lng || locationCordinates.lng,
      filters: {
        withinDistance: 50,
        farmTypes: '{farm,stall}',
        include_stalls: true
      }
    });
    console.log("Farms fetched from PostGIS:", farms.data);
    const grouped = groupResultsByFarm(farms.data);
    console.log("Final grouped farms:", grouped);
    return grouped;
  }

  function groupResultsByFarm(results) {
    const grouped = {};

    results.forEach(result => {
        const farmId = result.farm_id;

        if (!grouped[farmId]) {
            grouped[farmId] = {
                farm: null,
                stalls: []
            };
        }

        if (result.record_type === 'farm') {
            grouped[farmId].farm = {
                id: result.farm_id,
                farmer_id: result.farmer_id,
                name: result.farm_name,
                contact_person: result.contact_person,
                email: result.email,
                phone: result.phone,
                address: result.address,
                type: result.farm_type,
                latitude: result.latitude,
                longitude: result.longitude,
                distance_meters: result.distance_meters,
                distance_miles: result.distance_meters / 1609.34
            };
        } else if (result.record_type === 'stall') {
            grouped[farmId].stalls.push({
                stall_id: result.stall_id,
                stall_name: result.stall_name,
                stall_location: result.stall_location,
                latitude: result.latitude,
                longitude: result.longitude,
                distance_meters: result.distance_meters,
                distance_miles: result.distance_meters / 1609.34
            });
        }
    });

    const new_arr = [];

    const array = Object.values(grouped).filter((g : any) => g.farm !== null);
    
    array.forEach((result:any) => {
        const farm = result.farm;
        const stalls = result.stalls;

        if (stalls.length === 0) {
            new_arr.push({
                id: farm.id,
                farm_id: farm.id,
                name: farm.name,
                contact_name: farm.contact_person,
                email: farm.email,
                phone: farm.phone,
                address: farm.address,
                type: 'farm',
                latitude: farm.latitude,
                longitude: farm.longitude,
                distance: farm.distance_miles
            });
        } else if (stalls.length === 1) {
            const stall = stalls[0];
            new_arr.push({
                id: stall.stall_id,
                farm_id: farm.id,
                name: stall.stall_name,
                contact_name: farm.contact_person, // Use farm's contact person
                email: farm.email, // Use farm's email
                phone: farm.phone, // Use farm's phone
                address: stall.stall_location || farm.address,
                type: 'stall',
                latitude: stall.latitude,
                longitude: stall.longitude,
                distance: stall.distance_miles
            });
        } else {
            
            // Add farm record
            new_arr.push({
                id: farm.id,
                farm_id: farm.id,
                name: farm.name,
                contact_name: farm.contact_person,
                email: farm.email,
                phone: farm.phone,
                address: farm.address,
                type: 'farm',
                latitude: farm.latitude,
                longitude: farm.longitude,
                distance: farm.distance_miles
            });

            // Add all stall records
            stalls.forEach(stall => {
                new_arr.push({
                    id: stall.stall_id,
                    farm_id: farm.id,
                    name: stall.stall_name,
                    contact_name: farm.contact_person,
                    email: farm.email,
                    phone: farm.phone,
                    address: stall.stall_location || farm.address,
                    type: 'stall',
                    latitude: stall.latitude,
                    longitude: stall.longitude,
                    distance: stall.distance_miles
                });
            });
        }
    });
    
    return new_arr;
}

  useEffect(() => {
    const loadFarms = async () => {
      const farms = await fetchFarms();
      setFarms(farms as any);
    };
    loadFarms();
  }, [locationCordinates, lat, lng]);

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
                  {/* <h2 className="text-2xl font-bold text-foreground">
                    {isLoading ? 'Loading...' : `${farms.length + mockProperties.length} Farm Listings`}
                  </h2> */}
                  <p className="text-muted-foreground">
                    {farms.length} Farms in your area
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
                      className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "grid"
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
                      className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "list"
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
                      className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "map"
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
                <MapView farms={farms} locationCordinates={locationCordinates} />
              </div>) :
              // ) : isLoading ? (
              //   <div className="flex items-center justify-center py-16">
              //     <div className="text-center">
              //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
              //       <p className="text-muted-foreground">Loading farms...</p>
              //     </div>
              //   </div>
              // ) : (
              (
                <div className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                  {/* Real Farms from Supabase */}
                  {farms.length !== 0 && farms.map((farm) => (
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
                  {/* {mockProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                  />
                ))} */}
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
