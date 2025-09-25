import { useState, useEffect } from "react";
import { Wheat, Menu, Heart, User as UserIcon, LogOut, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useViewMode } from "@/hooks/useViewMode";
import { JoinAsFarmerModal } from "@/components/JoinAsFarmerModal";
import { AuthModal } from "@/components/AuthModal";
import { PasswordChangeModal } from "@/components/PasswordChangeModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";

export const Header = () => {
  const { getTotalItems } = useCart();
  const { setViewMode } = useViewMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle authentication state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        // If we're in the process of logging out, don't process the session change
        if (isLoggingOut) {
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile if logged in
        if (session?.user && event !== 'SIGNED_OUT') {
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              setUserProfile(profile);
              
              // Only redirect on initial sign in, not on every auth state change
              if (event === 'SIGNED_IN') {
                if (profile?.role === 'admin' && window.location.pathname === '/') {
                  navigate('/admin');
                } else if (profile?.role === 'farmer' && window.location.pathname === '/') {
                  navigate('/farmer-dashboard');
                }
              }
              
              // Check if password is expired and show password change modal
              if (profile?.password_expired && !isPasswordChangeModalOpen) {
                setIsPasswordChangeModalOpen(true);
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Separate effect to get initial session - only runs once
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isLoggingOut) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });
  }, []);

  const handleSignOut = async () => {
    try {
      // Set logging out flag to prevent auth state change processing
      setIsLoggingOut(true);
      
      // Try to sign out from Supabase first
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('Logout error:', error);
      }
      
      // Clear the session state after logout attempt
      setSession(null);
      setUser(null);
      setUserProfile(null);
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
      
      // Reset the logging out flag
      setIsLoggingOut(false);
      
      // Clear local storage manually to ensure session is gone
      localStorage.removeItem('sb-ahzhkzqsaxvzixiivupb-auth-token');
      
      // Force a page reload to completely clear the session
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      
      // For any error, force clear everything and reload the page
      setSession(null);
      setUser(null);
      setUserProfile(null);
      setIsLoggingOut(false);
      
      // Clear local storage manually
      localStorage.removeItem('sb-ahzhkzqsaxvzixiivupb-auth-token');
      
      toast({
        title: "Signed out",
        description: "You have been signed out."
      });
      
      // Force a page reload to completely clear the session
      window.location.href = '/';
    }
  };

  const handleSignInClick = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <Wheat className="h-8 w-8 text-farm-green" />
            <span className="text-2xl font-bold text-foreground">Farmers Stall</span>
          </div>
        </div>
        
        {/* Hide navigation menu for admin and farmer users */}
        {userProfile?.role !== 'admin' && userProfile?.role !== 'farmer' && (
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
        )}
        
        <div className="flex items-center gap-2">
          {/* Cart Icon - Only show for non-admin/farmer users */}
          {userProfile?.role !== 'admin' && userProfile?.role !== 'farmer' && (
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Heart className="h-5 w-5" />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <UserIcon className="h-4 w-4 mr-2" />
                  {userProfile?.full_name || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem>
                  {userProfile?.role || 'User'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {userProfile?.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                {userProfile?.role === 'farmer' && (
                  <DropdownMenuItem onClick={() => navigate('/farmer-dashboard')}>
                    Farmer Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={handleSignInClick}>
              <UserIcon className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
          
          {/* Hide "Join as Farmer" button for admin and farmer users */}
          {userProfile?.role !== 'admin' && userProfile?.role !== 'farmer' && (
            <Button 
              variant="farm" 
              className="hidden sm:flex"
              onClick={() => setIsModalOpen(true)}
            >
              Join as Farmer
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <JoinAsFarmerModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
      <AuthModal 
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onOpenFarmerModal={() => setIsModalOpen(true)}
      />
      
      <PasswordChangeModal
        open={isPasswordChangeModalOpen}
        onOpenChange={setIsPasswordChangeModalOpen}
        onPasswordChanged={() => {
          setIsPasswordChangeModalOpen(false);
          if (user) {
            // Refresh user profile
            setTimeout(async () => {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', user.id)
                  .single();
                setUserProfile(profile);
              } catch (error) {
                console.error('Error fetching user profile:', error);
              }
            }, 0);
          }
        }}
      />
    </header>
  );
};