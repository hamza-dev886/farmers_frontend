import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapboxAutocomplete } from "@/components/ui/mapbox-autocomplete";
import { MapboxMapPreview } from "@/components/ui/mapbox-map-preview";
import heroImage from "@/assets/farm-hero.jpg";

interface HeroProps {
  onSearch?: (searchParams: {
    address: string;
    coordinates: [number, number] | null;
    searchType: string;
    searchQuery: string;
    maxDistance: string;
  }) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [searchType, setSearchType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDistance, setMaxDistance] = useState("");

  const handleSearch = () => {
    if (!address || !searchType || !searchQuery || !maxDistance) {
      alert("Please fill in all fields before searching");
      return;
    }
    
    // Pass search parameters to parent component
    if (onSearch) {
      onSearch({
        address,
        coordinates,
        searchType,
        searchQuery,
        maxDistance
      });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/75 to-background/60" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
          From Local Farms To
          <span className="block text-farm-green">Local Tables</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Connecting farm families with customers who love fresh, 
          local produce. Support family farms and discover farm events in your community.
        </p>
        
        <div className="max-w-6xl mx-auto bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-farm border border-border/20">
          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 mb-8">
            
            {/* Left Column - Location */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-farm-green text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <h3 className="text-xl font-semibold text-foreground">Where are you located?</h3>
              </div>
              
              <div className="space-y-4">
                <MapboxAutocomplete
                  value={address}
                  onChange={(newAddress, newCoordinates) => {
                    setAddress(newAddress);
                    setCoordinates(newCoordinates || null);
                  }}
                  placeholder="Enter your address to find nearby farms..."
                  className="h-14 text-lg border-farm-green/20 focus:border-farm-green"
                />
                <div className="h-48 rounded-lg border border-border/20 overflow-hidden">
                  <MapboxMapPreview coordinates={coordinates} className="h-full w-full" />
                </div>
              </div>
            </div>

            {/* Right Column - Search Preferences */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-farm-green text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <h3 className="text-xl font-semibold text-foreground">What are you looking for?</h3>
              </div>
              
              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-foreground">I'm looking for</label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="h-14 border-farm-green/20 focus:border-farm-green text-lg">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">🥕 Products</SelectItem>
                      <SelectItem value="farm">🚜 Farms</SelectItem>
                      <SelectItem value="event">📅 Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Distance */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-foreground">Within</label>
                  <Select value={maxDistance} onValueChange={setMaxDistance}>
                    <SelectTrigger className="h-14 border-farm-green/20 focus:border-farm-green text-lg">
                      <SelectValue placeholder="Select distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 mile</SelectItem>
                      <SelectItem value="2">2 miles</SelectItem>
                      <SelectItem value="3">3 miles</SelectItem>
                      <SelectItem value="5">5 miles</SelectItem>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Input */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-foreground">Search for</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="tomatoes, Green Valley Farm..."
                      className="pl-12 h-14 text-lg border-farm-green/20 focus:border-farm-green"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="text-center">
            <Button 
              onClick={handleSearch}
              variant="hero" 
              size="hero" 
              className="px-16 py-4 text-lg font-semibold"
            >
              🔍 Find Local Farms
            </Button>
          </div>
        </div>
        
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-farm-green rounded-full"></div>
            500+ Family Farms
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-farm-gold rounded-full"></div>
            200+ Farm Stalls
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-farm-earth rounded-full"></div>
            Weekly Events
          </span>
        </div>
      </div>
    </section>
  );
};