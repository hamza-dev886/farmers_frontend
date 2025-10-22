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
    const {
        withinDistance = null, // 5, 15, or 30 miles
        farmTypes = [], // Filter by farm types
        includeStalls = true // Whether to include stall records for type='farm'
    } = filters;

    const distanceInMeters = withinDistance ? withinDistance * 1609.34 : null;

    // Use the RPC function for efficient distance-based search
    const { data, error } = await supabase
        .rpc('search_farms_by_distance', {
            user_lat: userLat,
            user_lon: userLon,
            max_distance_meters: distanceInMeters,
            farm_types: farmTypes,
            include_stalls: includeStalls
        });

    if (error) {
        console.error('Error fetching farms:', error);
        return { data: [], error };
    }

    // Group the results by farm if needed
    // const groupedResults = groupResultsByFarm(data);

    return { 
        data: data || [], 
        // groupedData: groupedResults,
        error: null 
    };
}

// Helper function to group results by farm
function groupResultsByFarm(results) {
    const grouped = {};

    results.forEach(result => {
        const farmId = result.id;

        if (!grouped[farmId]) {
            grouped[farmId] = {
                farm: null,
                stalls: []
            };
        }

        if (result.record_type === 'farm' || result.record_type === 'stall-only') {
            grouped[farmId].farm = {
                id: result.id,
                farmer_id: result.farmer_id,
                name: result.name,
                contact_person: result.contact_person,
                email: result.email,
                phone: result.phone,
                address: result.address,
                type: result.type,
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

    // Convert to array and filter out entries without farm data
    return Object.values(grouped).filter(g => g.farm !== null);
}

// Example usage - Get all results
const allResults = await searchFarmsWithFilters({
    userLat: 40.7128,
    userLon: -74.0060,
    filters: {
        // withinDistance: 5, // 5 miles
        farmTypes: ['farm'], // Get both types
        includeStalls: true
    }
});

console.log('Flat results:', allResults.data);
// console.log('Grouped by farm:', allResults.groupedData);