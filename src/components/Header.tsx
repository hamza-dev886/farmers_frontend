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

export const Header = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Wheat className="h-8 w-8 text-farm-green" />
            <span className="text-2xl font-bold text-foreground">FarmFinder</span>
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
                      <div className="text-sm font-medium">Working Farms</div>
                      <p className="text-sm text-muted-foreground">
                        Explore active agricultural operations
                      </p>
                    </NavigationMenuLink>
                    <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                      <div className="text-sm font-medium">Farmstalls</div>
                      <p className="text-sm text-muted-foreground">
                        Local farm shops and markets
                      </p>
                    </NavigationMenuLink>
                    <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                      <div className="text-sm font-medium">U-Pick Farms</div>
                      <p className="text-sm text-muted-foreground">
                        Pick your own produce experiences
                      </p>
                    </NavigationMenuLink>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="px-4 py-2 hover:text-farm-green transition-smooth">
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
          <Button variant="farm" className="hidden sm:flex">
            List Property
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};