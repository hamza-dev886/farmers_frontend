import { useState, useEffect } from "react";
import { Wheat, Menu, Heart, User as UserIcon, LogOut } from "lucide-react";
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
  const { setViewMode } = useViewMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle authentication state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile if logged in
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              setUserProfile(profile);
              
              // Redirect users based on their role
              if (profile?.role === 'admin' && window.location.pathname === '/') {
                navigate('/admin');
              } else if (profile?.role === 'farmer' && window.location.pathname === '/') {
                navigate('/farmer-dashboard');
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

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      // Clear the session state immediately for better UX
      setSession(null);
      setUser(null);
      setUserProfile(null);
      
      const { error } = await supabase.auth.signOut();
      
      // Even if there's an error (like session already expired), 
      // we still consider it a successful logout since we cleared the local state
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
      
      // Force refresh the page to completely destroy the session
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear the state and redirect even if there's an error
      setSession(null);
      setUser(null);
      setUserProfile(null);
      
      toast({
        title: "Signed out",
        description: "You have been signed out."
      });
      
      // Force refresh the page
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