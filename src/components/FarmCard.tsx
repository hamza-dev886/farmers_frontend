import { Heart, MapPin, Leaf, Star, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface FarmCardProps {
  id: string;
  name: string;
  address: string;
  bio?: string;
  contact_person: string;
  email: string;
  phone?: string;
  isFavorited?: boolean;
  logo?: string;
  type?: string;
}

export const FarmCard = ({
  id,
  name,
  address,
  bio,
  contact_person,
  email,
  phone,
  isFavorited = false,
  logo,
  type
}: FarmCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/farmer/${id}`);
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const url = logo ? supabase.storage.from('farmers_bucket').getPublicUrl(logo).data.publicUrl : "";

  return (
    <Card
      className="group hover:shadow-card transition-smooth border-border/50 hover:border-farm-green/30 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* Placeholder farm image with initials */}
        <div className="w-full h-48 bg-gradient-to-br from-farm-green/20 to-farm-green/10 flex items-center justify-center relative overflow-hidden">
          <img
            src={url}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90 ${isFavorited ? 'text-red-500' : 'text-muted-foreground'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>

        <Badge className={`absolute top-3 left-3 ${type === 'farm' ? "bg-farm-green" : "bg-yellow-500"}  text-primary-foreground`}>
          <Leaf className="h-3 w-3 mr-1" />
          {type === 'farm' ? "Farm" : "Stall"}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg group-hover:text-farm-green transition-smooth">
            {name}
          </h3>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-farm-gold text-farm-gold' : 'text-muted-foreground'}`} />
            ))}
          </div>
        </div>

        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{address}</span>
        </div>

        {bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {bio}
          </p>
        )}

        <div className="flex justify-between items-center text-sm mb-3">
          <span className="text-muted-foreground">Contact: {contact_person}</span>
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">
              Organic
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Local
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={handleEmailClick}
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
          {phone && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={handlePhoneClick}
            >
              <Phone className="h-3 w-3 mr-1" />
              Call
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};