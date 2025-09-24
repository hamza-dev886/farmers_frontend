import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/farm-hero.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/60 to-background/40" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
          From local farms to
          <span className="block text-farm-green">local tables</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Your digital marketplace connecting farm families with customers who love fresh, 
          local produce. Support family farms and discover farm events in your community.
        </p>
        
        <div className="max-w-2xl mx-auto bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-farm border border-border/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Enter location (city, state, or zip)"
                className="pl-10 h-12 border-farm-green/20 focus:border-farm-green"
              />
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search farms, produce, or events"
                className="pl-10 h-12 border-farm-green/20 focus:border-farm-green"
              />
            </div>
            <Button variant="hero" size="hero" className="md:w-auto w-full">
              Find Farms
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