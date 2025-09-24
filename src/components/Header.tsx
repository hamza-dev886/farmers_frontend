import { useState } from "react";
import { Wheat, Menu, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { useViewMode } from "@/hooks/useViewMode";
import { JoinAsFarmerModal } from "@/components/JoinAsFarmerModal";

export const Header = () => {
  const { setViewMode } = useViewMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Wheat className="h-8 w-8 text-farm-green" />
            <span className="text-2xl font-bold text-foreground">Farmers Stall</span>
          </div>
        </div>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Browse</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 w-[400px]">
                  <div className="row-span-3">
                    <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                      <div className="text-sm font-medium">Family Farms</div>
                      <p className="text-sm text-muted-foreground">
                        Discover local family-owned farms
                      </p>
                    </NavigationMenuLink>
                    <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                      <div className="text-sm font-medium">Farm Stalls</div>
                      <p className="text-sm text-muted-foreground">
                        Local farm markets and fresh produce
                      </p>
                    </NavigationMenuLink>
                    <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                      <div className="text-sm font-medium">Farm Events</div>
                      <p className="text-sm text-muted-foreground">
                        Seasonal events and farm experiences
                      </p>
                    </NavigationMenuLink>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink 
                className="px-4 py-2 hover:text-farm-green transition-smooth cursor-pointer"
                onClick={() => setViewMode('map')}
              >
                Map View
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="px-4 py-2 hover:text-farm-green transition-smooth">
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="outline">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
          <Button 
            variant="farm" 
            className="hidden sm:flex"
            onClick={() => setIsModalOpen(true)}
          >
            Join as Farmer
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <JoinAsFarmerModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </header>
  );
};