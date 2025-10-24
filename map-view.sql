DROP MATERIALIZED VIEW IF EXISTS farm_locations_view CASCADE;

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
    'stall-only' AS record_type,
    -- Aggregate product information
    ARRAY_AGG(DISTINCT fp.product_id) FILTER (WHERE fp.product_id IS NOT NULL) AS product_ids,
    ARRAY_AGG(DISTINCT p.category_id) FILTER (WHERE p.category_id IS NOT NULL) AS category_ids,
    ARRAY_AGG(DISTINCT p.sub_category_id) FILTER (WHERE p.sub_category_id IS NOT NULL) AS sub_category_ids
FROM 
    farms f
    LEFT JOIN farm_products fp ON f.id = fp.farm_id
    LEFT JOIN product p ON fp.product_id = p.id AND p.deleted_at IS NULL
WHERE 
    f.type = 'stall'
GROUP BY 
    f.id, f.farmer_id, f.name, f.contact_person, f.email, f.phone, 
    f.address, f.location, f.bio, f.created_at, f.updated_at, f.type, 
    f.latitude, f.longitude, f.logo

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
    'farm' AS record_type,
    ARRAY_AGG(DISTINCT fp.product_id) FILTER (WHERE fp.product_id IS NOT NULL) AS product_ids,
    ARRAY_AGG(DISTINCT p.category_id) FILTER (WHERE p.category_id IS NOT NULL) AS category_ids,
    ARRAY_AGG(DISTINCT p.sub_category_id) FILTER (WHERE p.sub_category_id IS NOT NULL) AS sub_category_ids
FROM 
    farms f
    LEFT JOIN farm_products fp ON f.id = fp.farm_id
    LEFT JOIN product p ON fp.product_id = p.id AND p.deleted_at IS NULL
WHERE 
    f.type = 'farm'
GROUP BY 
    f.id, f.farmer_id, f.name, f.contact_person, f.email, f.phone, 
    f.address, f.location, f.bio, f.created_at, f.updated_at, f.type, 
    f.latitude, f.longitude, f.logo

UNION ALL

-- Third, get all farm_stalls for farms with type 'farm'
SELECT 
    f.id AS id,
    f.farmer_id,
    f.name AS name,
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
    'stall' AS record_type,
    ARRAY_AGG(DISTINCT fp.product_id) FILTER (WHERE fp.product_id IS NOT NULL) AS product_ids,
    ARRAY_AGG(DISTINCT p.category_id) FILTER (WHERE p.category_id IS NOT NULL) AS category_ids,
    ARRAY_AGG(DISTINCT p.sub_category_id) FILTER (WHERE p.sub_category_id IS NOT NULL) AS sub_category_ids
FROM 
    farms f
    INNER JOIN farm_stalls fs ON f.id = fs.farm_id
    LEFT JOIN farm_products fp ON f.id = fp.farm_id
    LEFT JOIN product p ON fp.product_id = p.id AND p.deleted_at IS NULL
WHERE 
    f.type = 'farm' AND fs.latitude IS NOT NULL AND fs.longitude IS NOT NULL
GROUP BY 
    f.id, f.farmer_id, f.name, f.contact_person, f.email, f.phone, 
    f.address, f.location, f.bio, f.created_at, f.updated_at, f.type, 
    fs.latitude, fs.longitude, f.logo, fs.id, fs.name, fs.location;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes
CREATE UNIQUE INDEX idx_farm_locations_unique ON farm_locations_view (id, stall_id, record_type);
CREATE INDEX idx_farm_locations_type ON farm_locations_view (type);
CREATE INDEX idx_farm_locations_record_type ON farm_locations_view (record_type);
CREATE INDEX idx_farm_locations_geo ON farm_locations_view USING GIST (location_point);
CREATE INDEX idx_farm_locations_coords ON farm_locations_view (latitude, longitude);
CREATE INDEX idx_farm_locations_name_trgm ON farm_locations_view USING gin (name gin_trgm_ops);
CREATE INDEX idx_farm_locations_stall_name_trgm ON farm_locations_view USING gin (stall_name gin_trgm_ops);
CREATE INDEX idx_farm_locations_category_ids ON farm_locations_view USING GIN (category_ids);
CREATE INDEX idx_farm_locations_sub_category_ids ON farm_locations_view USING GIN (sub_category_ids);
CREATE INDEX idx_farm_locations_product_ids ON farm_locations_view USING GIN (product_ids);

REFRESH MATERIALIZED VIEW CONCURRENTLY farm_locations_view;

-- Refresh functions and triggers (same as before)
CREATE OR REPLACE FUNCTION refresh_farm_locations_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY farm_locations_view;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_refresh_farm_locations_view()
RETURNS trigger AS $$
BEGIN
    PERFORM refresh_farm_locations_view();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_farm_locations_on_farms_change ON farms;
CREATE TRIGGER refresh_farm_locations_on_farms_change
AFTER INSERT OR UPDATE OR DELETE ON farms
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_farm_locations_view();

DROP TRIGGER IF EXISTS refresh_farm_locations_on_stalls_change ON farm_stalls;
CREATE TRIGGER refresh_farm_locations_on_stalls_change
AFTER INSERT OR UPDATE OR DELETE ON farm_stalls
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_farm_locations_view();

DROP TRIGGER IF EXISTS refresh_farm_locations_on_farm_products_change ON farm_products;
CREATE TRIGGER refresh_farm_locations_on_farm_products_change
AFTER INSERT OR UPDATE OR DELETE ON farm_products
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_farm_locations_view();

DROP TRIGGER IF EXISTS refresh_farm_locations_on_product_change ON product;
CREATE TRIGGER refresh_farm_locations_on_product_change
AFTER INSERT OR UPDATE OR DELETE ON product
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_farm_locations_view();