-- Drop existing function if it exists
DROP FUNCTION IF EXISTS search_farms_by_distance;

-- Create the updated function
CREATE OR REPLACE FUNCTION search_farms_by_distance(
    user_lat FLOAT,
    user_lon FLOAT,
    max_distance_meters FLOAT DEFAULT NULL,
    farm_types TEXT[] DEFAULT '{}',
    include_stalls BOOLEAN DEFAULT TRUE
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
    logo TEXT,                 -- Added missing bio column
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
        flv.logo,               -- Added missing bio column
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
        AND (include_stalls = TRUE OR flv.record_type = 'farm')
    ORDER BY 
        flv.id,
        flv.record_type DESC, -- Farm records first, then stalls
        distance_meters;
END;
$$ LANGUAGE plpgsql;