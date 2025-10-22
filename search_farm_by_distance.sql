-- Drop existing function if it exists
DROP FUNCTION IF EXISTS search_farms_by_distance;

<<<<<<< HEAD
-- Create the updated function with name search
=======
-- Create the updated function
>>>>>>> 1b67387f2e8c51984e931155f53dd7c1791f709a
CREATE OR REPLACE FUNCTION search_farms_by_distance(
    user_lat FLOAT,
    user_lon FLOAT,
    max_distance_meters FLOAT DEFAULT NULL,
    farm_types TEXT[] DEFAULT '{}',
<<<<<<< HEAD
    include_stalls BOOLEAN DEFAULT TRUE,
    search_query TEXT DEFAULT NULL  -- New parameter for name search
=======
    include_stalls BOOLEAN DEFAULT TRUE
>>>>>>> 1b67387f2e8c51984e931155f53dd7c1791f709a
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
<<<<<<< HEAD
    logo TEXT,
=======
    logo TEXT,                 -- Added missing bio column
>>>>>>> 1b67387f2e8c51984e931155f53dd7c1791f709a
    distance_meters FLOAT
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
        ) AS distance_meters
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
<<<<<<< HEAD
        AND (include_stalls = TRUE OR flv.record_type != 'stall')
        -- Search by farm name or stall name (case-insensitive)
        AND (
            search_query IS NULL 
            OR search_query = ''
            OR flv.name ILIKE '%' || search_query || '%'
            OR flv.stall_name ILIKE '%' || search_query || '%'
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
=======
        AND (include_stalls = TRUE OR flv.record_type = 'farm')
    ORDER BY 
        flv.id,
        flv.record_type DESC, -- Farm records first, then stalls
        distance_meters;
>>>>>>> 1b67387f2e8c51984e931155f53dd7c1791f709a
END;
$$ LANGUAGE plpgsql;