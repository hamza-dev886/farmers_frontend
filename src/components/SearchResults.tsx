import { useState, useEffect } from "react";
import { Grid, List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FarmCard } from "@/components/FarmCard";
import { PropertyCard } from "@/components/PropertyCard";
import { ProductCard } from "@/components/ProductCard";
import { MapView } from "@/components/MapView";
import { useViewMode } from "@/hooks/useViewMode";
import { supabase } from "@/integrations/supabase/client";

interface SearchResultsProps {
  searchParams: {
    address: string;
    coordinates: [number, number] | null;
    searchType: string;
    searchQuery: string;
    maxDistance: string;
  };
  results: any[];
  isLoading: boolean;
}

export const SearchResults = ({ searchParams, results, isLoading }: SearchResultsProps) => {
  const { viewMode, setViewMode } = useViewMode();
  const [productInventory, setProductInventory] = useState<Record<string, number>>({});

  // Fetch inventory data for products
  useEffect(() => {
    const fetchInventory = async () => {
      if (searchParams.searchType !== 'product' || !results.length) return;

      try {
        // Extract all product IDs from results
        const productIds = results.flatMap(farm => 
          farm.products?.map((product: any) => product.id) || []
        );

        if (productIds.length === 0) return;

        const { data, error } = await supabase
          .from('inventory_tracking')
          .select('variant_id, quantity_available')
          .in('variant_id', productIds);

        if (error) throw error;

        const inventoryMap = data?.reduce((acc, item) => {
          acc[item.variant_id] = item.quantity_available;
          return acc;
        }, {} as Record<string, number>) || {};

        setProductInventory(inventoryMap);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      }
    };

    fetchInventory();
  }, [searchParams.searchType, results]);

  if (!searchParams.searchQuery) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Summary */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Search Results</h2>
        <p className="text-muted-foreground">
          {searchParams.searchType === 'product' ? (
            `Found ${results.reduce((total, farm) => total + (farm.products?.length || 0), 0)} products from ${results.length} farms for "${searchParams.searchQuery}" within ${searchParams.maxDistance} miles of ${searchParams.address}`
          ) : (
            `Found ${results.length} ${searchParams.searchType}(s) for "${searchParams.searchQuery}" within ${searchParams.maxDistance} miles of ${searchParams.address}`
          )}
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium text-muted-foreground mr-4">View:</span>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
          className="flex items-center gap-2"
        >
          <List className="h-4 w-4" />
          List
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
          className="flex items-center gap-2"
        >
          <Grid className="h-4 w-4" />
          Grid
        </Button>
        <Button
          variant={viewMode === 'map' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('map')}
          className="flex items-center gap-2"
        >
          <MapIcon className="h-4 w-4" />
          Map
        </Button>
      </div>

      {/* Results Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-green mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching...</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'list' && (
            <div className="space-y-4">
              {searchParams.searchType === 'product' ? (
                results.flatMap((farm, farmIndex) => 
                  farm.products?.map((product: any, productIndex: number) => (
                    <div key={`${farmIndex}-${productIndex}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                      <p className="text-muted-foreground mb-2">{farm.name} • {farm.address}</p>
                      <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {farm.distance.toFixed(1)} miles away
                        </span>
                        <span className="text-sm font-medium">
                          {productInventory[product.id] || 0} available
                        </span>
                      </div>
                    </div>
                  )) || []
                )
              ) : (
                results.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">{item.name || item.title}</h3>
                    <p className="text-muted-foreground mb-2">{item.address || item.location}</p>
                    {item.bio && <p className="text-sm text-muted-foreground">{item.bio}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchParams.searchType === 'product' ? (
                results.flatMap((farm, farmIndex) => 
                  farm.products?.map((product: any, productIndex: number) => (
                    <ProductCard 
                      key={`${farmIndex}-${productIndex}`}
                      product={product}
                      farm={{
                        id: farm.id,
                        name: farm.name,
                        address: farm.address,
                        distance: farm.distance
                      }}
                      availableQuantity={productInventory[product.id] || 0}
                    />
                  )) || []
                )
              ) : (
                results.map((item, index) => {
                  if (searchParams.searchType === 'farm') {
                    return <FarmCard key={index} {...item} />;
                  } else {
                    // Transform farm data to PropertyCard format
                    const propertyData = {
                      id: item.id,
                      title: item.name || 'Farm',
                      type: 'farm' as const,
                      location: item.address || 'Unknown location',
                      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
                      size: 'Family Farm',
                      description: item.bio || 'Local farm producing fresh products',
                      features: ['Fresh Produce', 'Local Farm']
                    };
                    return <PropertyCard key={index} {...propertyData} />;
                  }
                })
              )}
            </div>
          )}

          {viewMode === 'map' && (
            <div className="grid grid-cols-12 gap-6 h-[600px]">
              {/* Left column - Item list (1/3 width) */}
              <div className="col-span-4 overflow-y-auto space-y-4 pr-4">
                <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background py-2">
                  {searchParams.searchType === 'product' 
                    ? `${results.reduce((total, farm) => total + (farm.products?.length || 0), 0)} Products` 
                    : `${results.length} Results`
                  }
                </h3>
                {searchParams.searchType === 'product' ? (
                  results.flatMap((farm, farmIndex) => 
                    farm.products?.map((product: any, productIndex: number) => (
                      <div key={`${farmIndex}-${productIndex}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <h4 className="font-medium mb-1">{product.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{farm.name} • {farm.distance.toFixed(1)} miles</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                        <span className="text-xs font-medium text-farm-green">
                          {productInventory[product.id] || 0} available
                        </span>
                      </div>
                    )) || []
                  )
                ) : (
                  results.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <h4 className="font-medium mb-1">{item.name || item.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.address || item.location}</p>
                      {item.bio && <p className="text-xs text-muted-foreground line-clamp-2">{item.bio}</p>}
                    </div>
                  ))
                )}
              </div>
              
              {/* Right columns - Map (2/3 width) */}
              <div className="col-span-8">
                <MapView 
                  searchResults={results} 
                  searchType={searchParams.searchType}
                  userLocation={searchParams.coordinates}
                />
              </div>
            </div>
          )}

          {results.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No results found. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};