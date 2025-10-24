import { supabase } from "@/integrations/supabase/client";
import { FarmMapDBRecord, SearchFarmsWithFiltersType } from "@/types/farm";
import { PostgrestError } from "@supabase/supabase-js";

type ReturnType = {
    data: FarmMapDBRecord[] | [];
    error: PostgrestError
}

export async function searchFarmsWithFilters({
    userLat,
    userLon,
    filters = {}
}: SearchFarmsWithFiltersType): Promise<ReturnType> {
    const {
        withinDistance, // 5, 15, or 30 miles
        farmTypes, // Filter by farm types
        includeStalls, // Whether to include stall records for type='farm'
        searchQuery, // Search by name
        categoryIds,
        subCategoryIds,
    } = filters;

    const distanceInMeters = withinDistance ? withinDistance * 1609.34 : null;

    const { data, error } = await supabase
        .rpc('search_farms_by_distance', {
            user_lat: userLat,
            user_lon: userLon,
            max_distance_meters: distanceInMeters,
            farm_types: farmTypes,
            include_stalls: includeStalls,
            search_query: searchQuery,
            filter_category_ids: categoryIds,
            filter_sub_category_ids: subCategoryIds,
        });

    if (error) {
        console.error('Error fetching farms:', error);
        return { data: [], error };
    }

    return { data: data || [], error };
}