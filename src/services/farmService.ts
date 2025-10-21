import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions based on actual database schema
export interface FarmFilters {
  organic?: boolean;
  withinDistance?: number; // 5, 15, or 30 miles
  farmTypes?: string[]; // ['Family Farms', 'Farm Stalls', 'Farm Events']
  products?: string[]; // ['Vegetables', 'Fruits', 'Dairy', 'Meat']
  features?: string[]; // ['Organic Certified', 'Family Owned', 'Farm Tours', 'CSA Program']
}

// Farm type based on actual database structure
export type Farm = Database['public']['Tables']['farms']['Row'] & {
  farm_products?: Array<{
    id: string;
    product_id: string;
    product?: {
      id: string;
      title: string;
      description?: string;
    };
  }>;
}

export interface SearchFarmsParams {
  userLat?: number;
  userLon?: number;
  filters?: FarmFilters;
}

export interface SearchFarmsResult {
  data: Farm[];
  error: string | null;
}

/**
 * Search farms with advanced filtering capabilities
 */
export async function searchFarmsWithFilters({
  userLat,
  userLon,
  filters = {}
}: SearchFarmsParams): Promise<SearchFarmsResult> {
  try {
    // Extract filter values with defaults
    const {
      organic = false,
      withinDistance = null,
      farmTypes = [],
      products = [],
      features = []
    } = filters;

    // Convert miles to meters for distance calculations
    const distanceInMeters = withinDistance ? withinDistance * 1609.34 : null;

    // Start with base query - include farm_stalls for location data
    let query = (supabase as any)
      .from('farms')
      .select(`
        *,
        farm_stalls!left(
          id,
          latitude,
          longitude,
          name,
          location
        )
      `);

    // Apply farm type filters
    if (farmTypes.length > 0) {
      const typeFilters: string[] = [];

      if (farmTypes.includes('Family Farms')) {
        typeFilters.push('farm');
      }
      if (farmTypes.includes('Farm Stalls')) {
        typeFilters.push('stall');
      }
      if (farmTypes.includes('Farm Events')) {
        typeFilters.push('event');
      }

      if (typeFilters.length > 0) {
        query = query.in('type', typeFilters);
      }
    }

    // Apply organic filter
    if (organic) {
      query = query.eq('is_organic', true);
    }

    // Apply product filters (assuming products is a JSONB array column)
    if (products.length > 0) {
      // Using overlaps operator to check if any of the products match
      query = query.overlaps('products', products);
    }

    // Apply feature filters (assuming features is a JSONB array column)
    if (features.length > 0) {
      // Using overlaps operator to check if any of the features match
      query = query.overlaps('features', features);
    }

    // Execute the query
    const { data: farms, error } = await query;
    console.log('Farms fetched from database:', farms);
    if (error) {
      console.error('Error fetching farms:', error);
      return { data: [], error: error.message };
    }

    if (!farms) {
      return { data: [], error: null };
    }

    // Filter by distance if needed
    let filteredFarms = farms as any[];

    if (distanceInMeters && userLat && userLon) {
      filteredFarms = farms.filter(farm => {
        let farmLat: number, farmLon: number;

        // Determine which coordinates to use based on farm type and available data
        if (farm.type === 'farm' && farm.latitude && farm.longitude) {
          farmLat = farm.latitude;
          farmLon = farm.longitude;
        } else if (farm.type === 'stall' && farm.farm_stalls && farm.farm_stalls.length > 0) {
          // Use the first stall's coordinates
          farmLat = farm.farm_stalls[0].latitude;
          farmLon = farm.farm_stalls[0].longitude;
        } else if (farm.location?.lat && farm.location?.lng) {
          // Use location JSON field
          farmLat = farm.location.lat;
          farmLon = farm.location.lng;
        } else if (farm.latitude && farm.longitude) {
          // Fallback to farm coordinates
          farmLat = farm.latitude;
          farmLon = farm.longitude;
        } else {
          // Skip farms without valid coordinates
          return false;
        }

        // Calculate distance using Haversine formula
        const distance = calculateDistance(userLat, userLon, farmLat, farmLon);
        console.log("Distance to farm", farm.id, "is", distance, "meters");
        return distance <= distanceInMeters;
      });
    }

    return { data: filteredFarms, error: null };
  } catch (error) {
    console.error('Unexpected error in searchFarmsWithFilters:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Helper function to calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Simplified function to get all farms without filtering
 */
export async function getAllFarms(): Promise<SearchFarmsResult> {
  try {
    const { data: farms, error } = await supabase
      .from('farms')
      .select(`
        *,
        farm_stalls!left(
          id,
          latitude,
          longitude,
          name,
          location
        )
      `);

    if (error) {
      console.error('Error fetching all farms:', error);
      return { data: [], error: error.message };
    }

    return { data: farms as Farm[] || [], error: null };
  } catch (error) {
    console.error('Unexpected error in getAllFarms:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Get user's current location
 */
export function getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Error getting location:', error);
        resolve(null);
      }
    );
  });
}