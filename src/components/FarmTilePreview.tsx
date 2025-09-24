import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Phone, Mail } from "lucide-react";

interface Farm {
  id: string;
  name: string;
  address: string;
  bio?: string;
  contact_person: string;
  email: string;
  phone?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface FarmTilePreviewProps {
  farm: Farm;
  onViewDetails?: (farm: Farm) => void;
}

export const FarmTilePreview = ({ farm, onViewDetails }: FarmTilePreviewProps) => {
  return (
    <Card className="w-80 shadow-card hover:shadow-farm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-farm-green">{farm.name}</CardTitle>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{farm.address}</span>
            </div>
          </div>
          <div className="flex text-farm-gold text-sm">
            {'★'.repeat(4)}{'☆'.repeat(1)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {farm.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {farm.bio}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            🥕 Fresh Produce
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🚚 Delivery
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🌱 Organic
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Contact:</span>
            <span>{farm.contact_person}</span>
          </div>
          
          {farm.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3 h-3 text-muted-foreground" />
              <span className="text-farm-green">{farm.phone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <span className="text-farm-green truncate">{farm.email}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails?.(farm)}
          >
            View Farm
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
          >
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};