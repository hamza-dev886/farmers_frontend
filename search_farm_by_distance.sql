-- Updated search function with combined search
DROP FUNCTION IF EXISTS search_farms_by_distance;

CREATE OR REPLACE FUNCTION search_farms_by_distance(
    user_lat FLOAT,
    user_lon FLOAT,
    max_distance_meters FLOAT DEFAULT NULL,
    farm_types TEXT[] DEFAULT '{}',
    include_stalls BOOLEAN DEFAULT TRUE,
    search_query TEXT DEFAULT NULL,              -- Combined: Search by farm name, stall name, or product name
    filter_category_ids UUID[] DEFAULT '{}',     -- Filter by categories
    filter_sub_category_ids UUID[] DEFAULT '{}'  -- Filter by sub-categories
)
RETURNS TABLE (
    id UUID,
    farmer_id UUID,
    name TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    type TEXT,
    latitude FLOAT,
    longitude FLOAT,
    stall_id UUID,
    stall_name TEXT,
    stall_location TEXT,
    record_type TEXT,
    bio TEXT,   
    logo TEXT,
    distance_meters FLOAT,
    product_ids TEXT[],
    category_ids UUID[],
    sub_category_ids UUID[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        flv.id,
        flv.farmer_id,
        flv.name,
        flv.contact_person,
        flv.email,
        flv.phone,
        flv.address,
        flv.type,
        flv.latitude,
        flv.longitude,
        flv.stall_id,
        flv.stall_name,
        flv.stall_location,
        flv.record_type,
        flv.bio,  
        flv.logo,
        ST_Distance(
            flv.location_point,
            ST_MakePoint(user_lon, user_lat)::geography
        ) AS distance_meters,
        flv.product_ids,
        flv.category_ids,
        flv.sub_category_ids
    FROM 
        farm_locations_view flv
    WHERE 
        -- Filter by farm types if provided
        (cardinality(farm_types) = 0 OR flv.type = ANY(farm_types))
        -- Filter by distance if provided
        AND (
            max_distance_meters IS NULL 
            OR ST_DWithin(
                flv.location_point,
                ST_MakePoint(user_lon, user_lat)::geography,
                max_distance_meters
            )
        )
        -- Optionally exclude stall records
        AND (include_stalls = TRUE OR flv.record_type != 'stall')
        -- Combined search: farm name, stall name, OR product name
        AND (
            search_query IS NULL 
            OR search_query = ''
            OR flv.name ILIKE '%' || search_query || '%'
            OR flv.stall_name ILIKE '%' || search_query || '%'
            OR EXISTS (
                SELECT 1 
                FROM unnest(flv.product_ids) AS pid
                JOIN product p ON p.id = pid
                WHERE p.deleted_at IS NULL 
                AND p.title ILIKE '%' || search_query || '%'
            )
        )
        -- Filter by categories (farms must have at least one matching category)
        AND (
            cardinality(filter_category_ids) = 0
            OR flv.category_ids && filter_category_ids
        )
        -- Filter by sub-categories (farms must have at least one matching sub-category)
        AND (
            cardinality(filter_sub_category_ids) = 0
            OR flv.sub_category_ids && filter_sub_category_ids
        )
    ORDER BY 
        -- Order by relevance (exact matches first), then by distance
        CASE 
            WHEN search_query IS NOT NULL AND search_query != '' THEN
                CASE 
                    WHEN LOWER(flv.name) = LOWER(search_query) THEN 1
                    WHEN LOWER(flv.stall_name) = LOWER(search_query) THEN 2
                    WHEN LOWER(flv.name) LIKE LOWER(search_query) || '%' THEN 3
                    WHEN LOWER(flv.stall_name) LIKE LOWER(search_query) || '%' THEN 4
                    ELSE 5
                END
            ELSE 0
        END,
        distance_meters,
        flv.id,
        flv.record_type DESC;
END;
$$ LANGUAGE plpgsql;