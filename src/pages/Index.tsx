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
import { SearchResults } from "@/components/SearchResults";

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
  const [searchParams, setSearchParams] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Check if user is admin or farmer and redirect
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role === 'admin') {
          navigate('/admin');
        } else if (profile?.role === 'farmer') {
          navigate('/farmer-dashboard');
        }
      }
    };
    
    checkUserRole();
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

  const handleSearch = async (params: any) => {
    setSearchParams(params);
    setIsSearching(true);
    
    console.log('Search params:', params);
    
    try {
      if (params.searchType === 'product') {
        // Use edge function for product search with distance calculation
        console.log('Calling product search edge function...');
        
        const { data, error } = await supabase.functions.invoke('product-search', {
          body: {
            searchQuery: params.searchQuery,
            userLocation: params.coordinates,
            maxDistance: params.maxDistance
          }
        });
        
        if (error) {
          console.error('Product search error:', error);
          setSearchResults([]);
        } else {
          console.log('Product search results:', data);
          setSearchResults(data.results || []);
        }
      } else {
        // For farm and event searches, use the existing logic
        let filteredResults = [...farms];
        
        if (params.searchType === 'farm') {
          filteredResults = farms.filter(farm => 
            farm.name.toLowerCase().includes(params.searchQuery.toLowerCase()) ||
            (farm.bio && farm.bio.toLowerCase().includes(params.searchQuery.toLowerCase())) ||
            farm.address.toLowerCase().includes(params.searchQuery.toLowerCase())
          );
        } else if (params.searchType === 'event') {
          filteredResults = farms.filter(farm => 
            (farm.bio && farm.bio.toLowerCase().includes('event')) ||
            (farm.bio && farm.bio.toLowerCase().includes('workshop')) ||
            (farm.bio && farm.bio.toLowerCase().includes('visit'))
          );
        }
        
        // Apply distance filtering for farm/event searches
        if (params.coordinates && params.maxDistance) {
          console.log('Applying distance filter:', params.maxDistance, 'miles from', params.coordinates);
          const maxDistanceKm = parseFloat(params.maxDistance) * 1.60934;
          
          filteredResults = filteredResults.filter(farm => {
            if (!farm.location || !farm.location.lat || !farm.location.lng) {
              const farmAddress = farm.address.toLowerCase();
              const [userLng, userLat] = params.coordinates;
              
              if (userLng > -74.1 && userLng < -73.8 && userLat > 40.5 && userLat < 40.8) {
                if (farmAddress.includes('brooklyn') || farmAddress.includes('new york')) {
                  return true;
                }
              }
              return false;
            }
            
            const farmLat = farm.location.lat;
            const farmLng = farm.location.lng;
            const userLat = params.coordinates[1];
            const userLng = params.coordinates[0];
            
            const distance = Math.sqrt(
              Math.pow(farmLat - userLat, 2) + Math.pow(farmLng - userLng, 2)
            ) * 111;
            
            return distance <= maxDistanceKm;
          });
        }
        
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero onSearch={handleSearch} />
      {searchParams && (
        <SearchResults 
          searchParams={searchParams}
          results={searchResults}
          isLoading={isSearching}
        />
      )}
    </div>
  );
};

export default Index;
