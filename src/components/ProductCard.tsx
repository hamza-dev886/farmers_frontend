import { useState } from "react";
import { ShoppingCart, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
  };
  farm: {
    id: string;
    name: string;
    address: string;
    distance: number;
  };
  availableQuantity?: number;
}

export const ProductCard = ({ product, farm, availableQuantity = 0 }: ProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (availableQuantity <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    setIsAddingToCart(true);
    
    try {
      // Add to cart
      addToCart({
        id: `${product.id}-${farm.id}`, // Unique cart item ID
        productId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        farmName: farm.name,
        farmId: farm.id,
      });
      
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for UX
      toast.success(`${product.title} added to cart!`);
    } catch (error) {
      toast.error("Failed to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getStockStatus = () => {
    if (availableQuantity <= 0) return { text: "Out of Stock", variant: "destructive" as const };
    if (availableQuantity <= 5) return { text: "Low Stock", variant: "secondary" as const };
    return { text: "In Stock", variant: "default" as const };
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        {product.thumbnail && (
          <div className="aspect-square rounded-md overflow-hidden mb-3">
            <img 
              src={product.thumbnail} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="space-y-2">
          <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{farm.name}</span>
            <span>•</span>
            <span>{farm.distance.toFixed(1)} miles away</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-3">
        <CardDescription className="line-clamp-3 mb-3">
          {product.description}
        </CardDescription>
        
        <div className="flex items-center justify-between">
          <Badge variant={stockStatus.variant}>
            {stockStatus.text}
          </Badge>
          {availableQuantity > 0 && (
            <span className="text-sm text-muted-foreground">
              {availableQuantity} available
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={availableQuantity <= 0 || isAddingToCart}
          className="w-full"
          variant="farm"
        >
          <ShoppingCart className="h-4 w-4" />
          {isAddingToCart ? "Adding..." : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};