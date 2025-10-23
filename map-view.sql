-- Drop the existing materialized view if it exists
DROP MATERIALIZED VIEW IF EXISTS farm_locations_view CASCADE;

-- Create the new materialized view
CREATE MATERIALIZED VIEW farm_locations_view AS
-- First, get all farms with type 'stall' (standalone records)
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
    f.latitude,
    f.longitude,
    f.logo,
    ST_MakePoint(f.longitude, f.latitude)::geography AS location_point,
    NULL::UUID AS stall_id,
    NULL::TEXT AS stall_name,
    NULL::TEXT AS stall_location,
    'stall-only' AS record_type -- Indicates this is a farm record
FROM 
    farms f
WHERE 
    f.type = 'stall'

UNION ALL

-- Second, get all farms with type 'farm' (parent records)
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
    f.latitude,
    f.longitude,
    f.logo,
    ST_MakePoint(f.longitude, f.latitude)::geography AS location_point,
    NULL::UUID AS stall_id,
    NULL::TEXT AS stall_name,
    NULL::TEXT AS stall_location,
    'farm' AS record_type
FROM 
    farms f
WHERE 
    f.type = 'farm'

UNION ALL

-- Third, get all farm_stalls for farms with type 'farm'
SELECT 
    f.id AS id, -- Keep farm id for grouping
    f.farmer_id,
    f.name AS name, -- Farm name
    f.contact_person,
    f.email,
    f.phone,
    f.address,
    f.location,
    f.bio,
    f.created_at,
    f.updated_at,
    f.type,
    fs.latitude,
    fs.longitude,
    f.logo,
    ST_MakePoint(fs.longitude, fs.latitude)::geography AS location_point,
    fs.id AS stall_id,
    fs.name AS stall_name,
    fs.location AS stall_location,
    'stall' AS record_type -- Indicates this is a stall record
FROM 
    farms f
INNER JOIN 
    farm_stalls fs ON f.id = fs.farm_id
WHERE 
    f.type = 'farm' AND fs.latitude IS NOT NULL AND fs.longitude IS NOT NULL;

CREATE UNIQUE INDEX idx_farm_locations_unique ON farm_locations_view (id, stall_id, record_type);

-- Create indexes for better performance
CREATE INDEX idx_farm_locations_type ON farm_locations_view (type);
CREATE INDEX idx_farm_locations_record_type ON farm_locations_view (record_type);
CREATE INDEX idx_farm_locations_geo ON farm_locations_view USING GIST (location_point);
CREATE INDEX idx_farm_locations_coords ON farm_locations_view (latitude, longitude);

-- REFRESH MATERIALIZED VIEW CONCURRENTLY farm_locations_view;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_farm_locations_name_trgm ON farm_locations_view USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_farm_locations_stall_name_trgm ON farm_locations_view USING gin (stall_name gin_trgm_ops);

-- Create a unique index for concurrent refresh

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
CREATE OR REPLACE TRIGGER refresh_farm_locations_on_farms_change
AFTER INSERT OR UPDATE OR DELETE ON farms
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_farm_locations_view();

-- Trigger for farm_stalls table
CREATE OR REPLACE TRIGGER refresh_farm_locations_on_stalls_change
AFTER INSERT OR UPDATE OR DELETE ON farm_stalls
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_farm_locations_view();