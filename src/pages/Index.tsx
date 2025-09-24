import { useState } from "react";
import { Grid, List, Map } from "lucide-react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PropertyCard } from "@/components/PropertyCard";
import { MapView } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockProperties } from "@/data/mockProperties";

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");

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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {mockProperties.length} Properties Found
                </h2>
                <p className="text-muted-foreground">
                  Farms and farmstalls in your area
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "farm" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "farm" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "farm" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                >
                  <Map className="w-4 h-4" />
                </Button>
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
