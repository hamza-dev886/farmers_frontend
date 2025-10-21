-- Drop the materialized view if it exists
DROP MATERIALIZED VIEW IF EXISTS farm_locations_view CASCADE;

-- Create the materialized view
CREATE MATERIALIZED VIEW farm_locations_view AS
SELECT 
    f.id,
    f.farmer_id,
    f.name,
    f.contact_person,
    f.email,
    f.phone,
    f.address,
    f.location,
    f.bio,
    f.created_at,
    f.updated_at,
    f.type,
    -- Use conditional logic for coordinates
    CASE 
        WHEN f.type = 'farm' THEN f.latitude
        WHEN f.type = 'stall' AND fs.latitude IS NOT NULL THEN fs.latitude
        ELSE f.latitude
    END AS effective_latitude,
    CASE 
        WHEN f.type = 'farm' THEN f.longitude
        WHEN f.type = 'stall' AND fs.longitude IS NOT NULL THEN fs.longitude
        ELSE f.longitude
    END AS effective_longitude,
    -- Include farm_stall data
    fs.id AS stall_id,
    fs.name AS stall_name,
    fs.location AS stall_location,
    fs.fence_radius_m,
    fs.inventory_item_ids,
    fs.operating_hours,
    fs.stall_images,
    fs.is_pickup,
    fs.pickup_from,
    fs.pickup_to,
    fs.prep_buffer,
    fs."capacityPerSlot"
FROM 
    farms f
LEFT JOIN 
    farm_stalls fs ON f.id = fs.farm_id AND f.type = 'stall';

-- Create indexes for better performance
CREATE INDEX idx_farm_locations_type ON farm_locations_view (type);
CREATE INDEX idx_farm_locations_coords ON farm_locations_view (effective_latitude, effective_longitude);
CREATE INDEX idx_farm_locations_farmer_id ON farm_locations_view (farmer_id);

-- Create a unique index for concurrent refresh
CREATE UNIQUE INDEX idx_farm_locations_id ON farm_locations_view (id, COALESCE(stall_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_farm_locations_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY farm_locations_view;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically refresh the view when data changes
CREATE OR REPLACE FUNCTION trigger_refresh_farm_locations_view()
RETURNS trigger AS $$
BEGIN
    PERFORM refresh_farm_locations_view();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for farms table
CREATE TRIGGER refresh_farm_locations_on_farms_change
AFTER INSERT OR UPDATE OR DELETE ON farms
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_farm_locations_view();

-- Trigger for farm_stalls table
CREATE TRIGGER refresh_farm_locations_on_stalls_change
AFTER INSERT OR UPDATE OR DELETE ON farm_stalls
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_farm_locations_view();