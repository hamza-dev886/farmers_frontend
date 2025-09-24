import { Grid, List, Map } from "lucide-react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PropertyCard } from "@/components/PropertyCard";
import { MapView } from "@/components/MapView";
import { mockProperties } from "@/data/mockProperties";
import { useViewMode } from "@/hooks/useViewMode";

const Index = () => {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="bg-card rounded-lg border p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {mockProperties.length} Farm Listings
                  </h2>
                  <p className="text-muted-foreground">
                    Family farms and farm stalls in your area
                  </p>
                </div>
                
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <button
                    className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "grid" 
                        ? "bg-farm-green text-white shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                    }`}
                    onClick={() => {
                      console.log("Grid button clicked - switching to grid view");
                      setViewMode("grid");
                    }}
                  >
                    <Grid className="w-4 h-4 mr-1" />
                    Grid
                  </button>
                  <button
                    className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "list" 
                        ? "bg-farm-green text-white shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                    }`}
                    onClick={() => {
                      console.log("List button clicked - switching to list view");
                      setViewMode("list");
                    }}
                  >
                    <List className="w-4 h-4 mr-1" />
                    List
                  </button>
                  <button
                    className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "map" 
                        ? "bg-farm-green text-white shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                    }`}
                    onClick={() => {
                      console.log("Map button clicked - switching to map view");
                      setViewMode("map");
                    }}
                  >
                    <Map className="w-4 h-4 mr-1" />
                    Map
                  </button>
                </div>
              </div>
            </div>
            
            {/* Content based on view mode */}
            {viewMode === "map" ? (
              <MapView />
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {mockProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
