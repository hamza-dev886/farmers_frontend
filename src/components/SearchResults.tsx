import { useState } from "react";
import { Grid, List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FarmCard } from "@/components/FarmCard";
import { PropertyCard } from "@/components/PropertyCard";
import { MapView } from "@/components/MapView";
import { useViewMode } from "@/hooks/useViewMode";

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

  if (!searchParams.searchQuery) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Summary */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Search Results</h2>
        <p className="text-muted-foreground">
          Found {results.length} {searchParams.searchType}(s) for "{searchParams.searchQuery}" 
          within {searchParams.maxDistance} miles of {searchParams.address}
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
              {results.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">{item.name || item.title}</h3>
                  <p className="text-muted-foreground mb-2">{item.address || item.location}</p>
                  {item.bio && <p className="text-sm text-muted-foreground">{item.bio}</p>}
                </div>
              ))}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item, index) => (
                searchParams.searchType === 'farm' ? (
                  <FarmCard key={index} {...item} />
                ) : (
                  <PropertyCard key={index} {...item} />
                )
              ))}
            </div>
          )}

          {viewMode === 'map' && (
            <div className="grid grid-cols-12 gap-6 h-[600px]">
              {/* Left column - Item list (1/3 width) */}
              <div className="col-span-4 overflow-y-auto space-y-4 pr-4">
                <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background py-2">
                  {results.length} Results
                </h3>
                {results.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <h4 className="font-medium mb-1">{item.name || item.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{item.address || item.location}</p>
                    {item.bio && <p className="text-xs text-muted-foreground line-clamp-2">{item.bio}</p>}
                  </div>
                ))}
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