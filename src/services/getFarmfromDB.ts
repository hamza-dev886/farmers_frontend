import { supabase } from "@/integrations/supabase/client";

export async function searchFarmsWithPostGIS({
    userLat,
    userLon,
    filters = {}
}) {
    const {
        organic = false,
        withinDistance = null,
        farmTypes = [],
        products = [],
        features = [],
        include_stalls = false
    } = filters as any;

    // Create a SQL query that handles the conditional coordinate selection
    const distanceInMeters = withinDistance ? withinDistance * 1609.34 : null;

    let rpcQuery = (supabase as any).rpc('search_farms_by_location', {
        user_lat: userLat,
        user_lon: userLon,
        max_distance_meters: distanceInMeters,
        farm_types: farmTypes,
        include_stalls: include_stalls,
    });

    const { data, error } = await rpcQuery;

    return { data: data || [], error };
}