import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchQuery, userLocation, maxDistance } = await req.json();
    
    console.log('Product search request:', { searchQuery, userLocation, maxDistance });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Mapbox token from config
    const { data: configData, error: configError } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'mapbox_token')
      .single();

    if (configError) {
      throw new Error('Failed to get Mapbox token');
    }

    const mapboxToken = configData.value;

    // Search for products and get related farm information with variants
    const { data: productResults, error: productError } = await supabase
      .from('product')
      .select(`
        id,
        title,
        description,
        thumbnail,
        product_variant(
          id,
          title,
          sku
        ),
        farm_products!inner(
          farm_id,
          farms!inner(
            id,
            name,
            address,
            bio,
            contact_person,
            email,
            phone,
            location
          )
        )
      `)
      .ilike('title', `%${searchQuery}%`)
      .eq('status', 'published');

    if (productError) {
      throw new Error(`Database error: ${productError.message}`);
    }

    console.log(`Found ${productResults?.length || 0} products matching "${searchQuery}"`);

    if (!productResults || productResults.length === 0) {
      return new Response(
        JSON.stringify({ results: [], message: 'No products found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each farm and calculate distance
    const farmsWithDistance: any[] = [];
    
    for (const product of productResults) {
      const farmProducts = product.farm_products as any[];
      if (!farmProducts || farmProducts.length === 0) continue;
      
      const farm = farmProducts[0].farms;
      
      // Skip if farm already processed
      if (farmsWithDistance.find(f => f.id === farm.id)) {
        continue;
      }

      let farmCoordinates = null;
      
      // Check if farm already has coordinates
      if (farm.location && farm.location.coordinates) {
        farmCoordinates = farm.location.coordinates;
      } else {
        // Geocode the farm address using Mapbox
        try {
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(farm.address)}.json?access_token=${mapboxToken}&limit=1`;
          const geocodeResponse = await fetch(geocodeUrl);
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData.features && geocodeData.features.length > 0) {
            farmCoordinates = geocodeData.features[0].center; // [lng, lat]
          }
        } catch (geocodeError) {
          console.warn(`Failed to geocode ${farm.name}:`, geocodeError);
        }
      }

      if (farmCoordinates) {
        const [farmLng, farmLat] = farmCoordinates;
        const [userLng, userLat] = userLocation;
        
        const distance = calculateDistance(userLat, userLng, farmLat, farmLng);
        
        console.log(`Farm ${farm.name}: ${distance.toFixed(2)} miles away`);
        
        if (distance <= parseFloat(maxDistance)) {
          farmsWithDistance.push({
            ...farm,
            distance: distance,
            coordinates: farmCoordinates,
            products: productResults
              .filter(p => {
                const fps = p.farm_products as any[];
                return fps && fps.length > 0 && fps[0].farms.id === farm.id;
              })
              .map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                thumbnail: p.thumbnail,
                variants: p.product_variant || []
              }))
          });
        }
      } else {
        console.warn(`Could not determine coordinates for farm: ${farm.name}`);
      }
    }

    // Sort by distance
    farmsWithDistance.sort((a, b) => a.distance - b.distance);

    console.log(`Returning ${farmsWithDistance.length} farms within ${maxDistance} miles`);

    return new Response(
      JSON.stringify({ 
        results: farmsWithDistance,
        message: `Found ${farmsWithDistance.length} farms with "${searchQuery}" within ${maxDistance} miles`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Product search error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});