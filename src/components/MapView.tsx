import { MapPin, Leaf, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const MapView = () => {
  return (
    <div className="relative w-full h-[600px] bg-gradient-subtle rounded-lg border border-border overflow-hidden">
      {/* Map placeholder with grid pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-farm-cream to-background">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      
      {/* Mock map markers */}
      <div className="absolute top-20 left-32">
        <div className="relative group cursor-pointer">
          <div className="w-8 h-8 bg-farm-green rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <Card className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-smooth z-10 w-48">
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm">Sunny Valley Farm</h4>
              <p className="text-xs text-muted-foreground">$475,000 • 25 acres</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="absolute top-40 right-28">
        <div className="relative group cursor-pointer">
          <div className="w-8 h-8 bg-farm-gold rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Store className="w-4 h-4 text-white" />
          </div>
          <Card className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-smooth z-10 w-48">
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm">Heritage Farm Market</h4>
              <p className="text-xs text-muted-foreground">$185,000 • 2 acres</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="absolute bottom-32 left-20">
        <div className="relative group cursor-pointer">
          <div className="w-8 h-8 bg-farm-green rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <Card className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-smooth z-10 w-48">
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm">Mountain View Dairy</h4>
              <p className="text-xs text-muted-foreground">$750,000 • 85 acres</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="absolute top-28 right-40">
        <div className="relative group cursor-pointer">
          <div className="w-8 h-8 bg-farm-gold rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Store className="w-4 h-4 text-white" />
          </div>
          <Card className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-smooth z-10 w-48">
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm">Golden Gate Farmstand</h4>
              <p className="text-xs text-muted-foreground">$220,000 • 1.5 acres</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 space-y-2">
        <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
          <MapPin className="w-4 h-4 mr-2" />
          Current Location
        </Button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4">
        <Card className="bg-background/90 backdrop-blur-sm">
          <CardContent className="p-3">
            <h4 className="font-semibold text-sm mb-2">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-farm-green rounded-full"></div>
                <span>Working Farms</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-farm-gold rounded-full"></div>
                <span>Farmstalls</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Interactive map notice */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="bg-background/80 backdrop-blur-sm border-dashed border-2 border-farm-green/30">
          <CardContent className="p-6 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-farm-green" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This demo shows property markers. A full interactive map with zoom, pan, and search capabilities will be available soon.
            </p>
            <Badge variant="secondary">Demo View</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};