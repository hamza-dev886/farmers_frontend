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
    
    try {
      let filteredResults = [...farms];
      
      // Filter by search type and query
      if (params.searchType === 'product') {
        // For product searches, match against common farm products
        const productKeywords = params.searchQuery.toLowerCase();
        const farmProductMap = {
          'duck': ['poultry', 'meat', 'farm'],
          'chicken': ['poultry', 'meat', 'farm'],
          'egg': ['poultry', 'farm'],
          'tomato': ['vegetable', 'produce', 'farm'],
          'vegetable': ['produce', 'farm', 'organic'],
          'fruit': ['produce', 'farm', 'organic'],
          'organic': ['organic', 'farm'],
          'fresh': ['produce', 'farm'],
          'meat': ['poultry', 'meat', 'farm']
        };
        
        filteredResults = farms.filter(farm => {
          const farmText = `${farm.name} ${farm.bio || ''} ${farm.address}`.toLowerCase();
          
          // Direct keyword match
          if (farmText.includes(productKeywords)) return true;
          
          // Check if farm might sell this product based on keywords
          const relevantKeywords = farmProductMap[productKeywords] || [productKeywords];
          return relevantKeywords.some(keyword => farmText.includes(keyword));
        });
      } else if (params.searchType === 'farm') {
        // Search farm names and descriptions
        filteredResults = farms.filter(farm => 
          farm.name.toLowerCase().includes(params.searchQuery.toLowerCase()) ||
          (farm.bio && farm.bio.toLowerCase().includes(params.searchQuery.toLowerCase())) ||
          farm.address.toLowerCase().includes(params.searchQuery.toLowerCase())
        );
      } else if (params.searchType === 'event') {
        // For now, return farms that might host events
        filteredResults = farms.filter(farm => 
          (farm.bio && farm.bio.toLowerCase().includes('event')) ||
          (farm.bio && farm.bio.toLowerCase().includes('workshop')) ||
          (farm.bio && farm.bio.toLowerCase().includes('visit'))
        );
      }
      
      // Apply distance filtering (basic implementation)
      // Note: This is a simplified distance calculation for demo purposes
      if (params.coordinates && params.maxDistance) {
        const maxDistanceKm = parseFloat(params.maxDistance) * 1.60934; // Convert miles to km
        
        filteredResults = filteredResults.filter(farm => {
          // For farms without coordinates, include them for now (they'll get random coords on map)
          if (!farm.location || !farm.location.lat) return true;
          
          // Simple distance calculation (not perfectly accurate but good enough for demo)
          const farmLat = farm.location.lat;
          const farmLng = farm.location.lng;
          const userLat = params.coordinates[0];
          const userLng = params.coordinates[1];
          
          const distance = Math.sqrt(
            Math.pow(farmLat - userLat, 2) + Math.pow(farmLng - userLng, 2)
          ) * 111; // Rough conversion to km
          
          return distance <= maxDistanceKm;
        });
      }
      
      setSearchResults(filteredResults);
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
