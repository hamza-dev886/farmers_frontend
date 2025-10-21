import { createClient } from '@supabase/supabase-js';

// --- Configuration ---
// IMPORTANT: Replace these with your actual Supabase URL and Service Role Key (admin key).
// The Service Role Key is required to bypass Row Level Security (RLS) and perform
// mass updates across all user data. NEVER use the anon key for this script.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ahzhkzqsaxvzixiivupb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoemhrenFzYXh2eml4aWl2dXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTc1ODMsImV4cCI6MjA3Mzc5MzU4M30.wu_lKG279SSMKdggRoCkIxiGIuFrmINI5OOUpBsST5w';

// Initialize the Supabase Client with the Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function searchFarmsWithFilters({
    userLat,
    userLon,
    filters = {}
}) {
    // Extract filter values
    const {
        withinDistance = null, // 5, 15, or 30 miles
    } = filters;

    // Convert miles to meters for distance calculations
    const distanceInMeters = withinDistance ? withinDistance * 1609.34 : null;

    // Start with base query
    let query = supabase
        .from('farm_locations_view')
        .select('*');

    // Execute the query
    const { data: farms, error } = await query;

    if (error) {
        console.error('Error fetching farms:', error);
        return { data: [], error };
    }

    // Filter by distance if needed
    let filteredFarms = farms;

    if (distanceInMeters && userLat && userLon) {
        filteredFarms = farms.map(farm => {
            // Calculate distance using the effective coordinates from the view
            const distance = calculateDistance(
                userLat, 
                userLon, 
                farm.effective_latitude, 
                farm.effective_longitude
            );

            // Add distance to the farm object
            return {
                ...farm,
                distance_meters: distance,
                distance_miles: distance / 1609.34
            };
        }).filter(farm => farm.distance_meters <= distanceInMeters)
          .sort((a, b) => a.distance_meters - b.distance_meters); // Sort by distance
    }

    return { data: filteredFarms, error: null };
}

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
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

// Example usage
const results = await searchFarmsWithFilters({
    userLat: 40.7128,
    userLon: -74.0060,
    filters: {
        // organic: true,
        // withinDistance: 5, // 5 miles
        // farmTypes: ['Family Farms', 'Farm Stalls'],
        // products: ['Vegetables', 'Fruits'],
        // features: ['Organic Certified', 'Farm Tours']
    }
});

console.log(results);