import { Heart, MapPin, Leaf, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  id: string;
  title: string;
  type: "farm" | "farmstall";
  location: string;
  price: string;
  image: string;
  size: string;
  description: string;
  features: string[];
  isFavorited?: boolean;
}

export const PropertyCard = ({ 
  title, 
  type, 
  location, 
  price, 
  image, 
  size, 
  description, 
  features,
  isFavorited = false 
}: PropertyCardProps) => {
  return (
    <Card className="group hover:shadow-card transition-smooth border-border/50 hover:border-farm-green/30 overflow-hidden">
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className={`absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90 ${
            isFavorited ? 'text-red-500' : 'text-muted-foreground'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>
        <Badge 
          className={`absolute top-3 left-3 ${
            type === 'farm' 
              ? 'bg-farm-green text-primary-foreground' 
              : 'bg-farm-gold text-foreground'
          }`}
        >
          {type === 'farm' ? (
            <><Leaf className="h-3 w-3 mr-1" /> Farm</>
          ) : (
            <><Store className="h-3 w-3 mr-1" /> Farmstall</>
          )}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg group-hover:text-farm-green transition-smooth">
            {title}
          </h3>
          <span className="text-lg font-bold text-farm-green">{price}</span>
        </div>
        
        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{location}</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {description}
        </p>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{size}</span>
          <div className="flex gap-1">
            {features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {features.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{features.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};