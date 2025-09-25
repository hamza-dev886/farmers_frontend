import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapboxAutocomplete } from "@/components/ui/mapbox-autocomplete";
import { MapboxMapPreview } from "@/components/ui/mapbox-map-preview";
import heroImage from "@/assets/farm-hero.jpg";

export const Hero = () => {
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
    
    console.log("Search params:", {
      address,
      coordinates,
      searchType,
      searchQuery,
      maxDistance
    });
    
    // TODO: Implement search logic
    alert(`Searching for ${searchType}: "${searchQuery}" within ${maxDistance} miles of ${address}`);
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
        
        <div className="max-w-4xl mx-auto bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-farm border border-border/20">
          {/* Address Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Pin Your Location</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <MapboxAutocomplete
                  value={address}
                  onChange={(newAddress, newCoordinates) => {
                    setAddress(newAddress);
                    setCoordinates(newCoordinates || null);
                  }}
                  placeholder="Enter your address to find nearby farms..."
                  className="h-12 border-farm-green/20 focus:border-farm-green"
                />
              </div>
              <div className="h-48 md:h-32">
                <MapboxMapPreview coordinates={coordinates} className="h-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* Search Filters */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">What are you looking for?</label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="h-12 border-farm-green/20 focus:border-farm-green">
                  <SelectValue placeholder="Select search type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="farm">Farm</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Search term</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., tomatoes, Green Valley Farm, harvest festival"
                  className="pl-10 h-12 border-farm-green/20 focus:border-farm-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Max distance</label>
              <Select value={maxDistance} onValueChange={setMaxDistance}>
                <SelectTrigger className="h-12 border-farm-green/20 focus:border-farm-green">
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
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch}
            variant="hero" 
            size="hero" 
            className="w-full md:w-auto px-12"
          >
            Search Now
          </Button>
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