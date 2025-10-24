import { Grid, List, Map, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FilterSidebar } from "@/components/FilterSidebar";
import { FarmCard } from "@/components/FarmCard";
import { MapView } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useViewMode } from "@/hooks/useViewMode";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/store";
import { searchFarmsWithFilters } from "@/services/getFarmfromDB";
import { FarmMapDBRecord, SearchFarmsWithFiltersType } from "@/types/farm";
import { getDefaultCoordinates } from "@/lib/utils";

type FetchFarmsFuncType = {
    latitude: number;
    longitude: number;
    query?: string;
    distance?: number;
    categories?: string[];
    subCategories?: string[];
};

const Index = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [farms, setFarms] = useState<FarmMapDBRecord[]>([]);

    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { locationCordinates } = useStore((state) => state);
    const { viewMode, setViewMode } = useViewMode();
    const { setLocationCordinates } = useStore((state) => state);

    useEffect(() => {
        getLocationWithFallback();
    }, []);

    // Check if user is admin or farmer and redirect
    useEffect(() => {
        const checkUserRole = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from("profiles" as any)
                    .select("role")
                    .eq("user_id", session.user.id)
                    .single();

                if ((profile as any)?.role === "admin") {
                    navigate("/admin");
                } else if ((profile as any)?.role === "farmer") {
                    navigate("/farmer-dashboard");
                }
            }
        };

        checkUserRole();
    }, [navigate]);

    // Load farm on initial load with user's current lcoation
    useEffect(() => {
        console.log("locationCordinates : ", locationCordinates);
        const loadFarms = async () => {
            const farms = await fetchFarms({
                latitude: locationCordinates.lat,
                longitude: locationCordinates.lng,
            });
            setFarms(farms);
        };

        loadFarms();
    }, [locationCordinates]);

    const getLocationWithFallback = () => {
        // First attempt: Network-based location
        navigator.geolocation.getCurrentPosition(
            (position) => handleFetchUserLocationSuccess({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
            (error) => {
                console.log(
                    "First attempt failed, trying with different settings..."
                );
                // Third attempt: Use IP geolocation API as fallback
                fetch(
                    "https://api.ipgeolocation.io/ipgeo?apiKey=343a031cd06e40ee990c6b03ad272fac"
                )
                    .then((response) => response.json())
                    .then((data) => {
                        console.log("User location:", data);
                        handleFetchUserLocationSuccess(data);
                    })
                    .catch((error) => {
                        console.error("Error fetching user location:", error);
                        // Defaut to New York
                        handleFetchUserLocationSuccess(getDefaultCoordinates())
                    });
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleFetchUserLocationSuccess = ({ latitude, longitude }) => {
        setLocationCordinates({
            lat: latitude,
            lng: longitude,
        });
    };

    async function fetchFarms({
        latitude,
        longitude,
        query,
        distance = 100,
        categories,
        subCategories,
    }: FetchFarmsFuncType) {
        try {
            setIsLoading(true);

            const payload: SearchFarmsWithFiltersType = {
                userLat: latitude,
                userLon: longitude,
                filters: {
                    withinDistance: distance,
                    farmTypes: ["farm", "stall"],
                    includeStalls: true,
                    searchQuery: query,
                    categoryIds: categories,
                    subCategoryIds: subCategories,
                },
            };

            console.log("Fetching farms payload", payload);

            const { data: farms, error } = await searchFarmsWithFilters(
                payload
            );

            if (error) throw new Error(error as unknown as string);

            console.log("Farms fetched from searchFarmsWithFilters:", farms);

            return farms;
        } catch (error) {
            console.error("Error fetching the farms : ", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSearch = async (distance = 100) => {
        try {
            // I have used URLSearchParams because useSearchParams from react-router-dom was not updating the query parameters in real time
            const params = new URLSearchParams(window.location.search);
            const searchLat = params.get("lat");
            const searchLng = params.get("lng");
            const searchQuery = params.get("q");
            const categories = params.get("categories");
            const subCategories = params.get("subCategories")

            const latitude = searchLat
                ? parseFloat(searchLat)
                : locationCordinates.lat;
            const longitude = searchLng
                ? parseFloat(searchLng)
                : locationCordinates.lng;

            const farms = await fetchFarms({
                latitude: latitude,
                longitude: longitude,
                query: searchQuery,
                distance: distance,
                categories: categories?.length ? categories.split(",") : [],
                subCategories: subCategories?.length ? subCategories.split(",") : [],
            });
            setFarms(farms);
        } catch (error) {
            console.error("Error while handling search : ", error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Hero handleSearch={handleSearch} />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Desktop Filters Sidebar - Always visible */}
                    <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                        <div className="sticky top-24">
                            <FilterSidebar handleSubmit={handleSearch} />
                        </div>
                    </aside>

                    {/* Mobile Filters Sheet */}
                    <Sheet
                        open={showFilters && isMobile}
                        onOpenChange={(open) => !open && setShowFilters(false)}
                    >
                        <SheetContent side="left" className="w-80 p-0">
                            <div className="p-4">
                                <FilterSidebar handleSubmit={handleSearch} />
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* View Controls */}
                        <div className="bg-card rounded-lg border p-4 mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {isLoading
                                            ? "Loading..."
                                            : `${farms.length} Farm Listings`}
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {farms.length} Farms in your area
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Only show filter button on mobile */}
                                    {isMobile && (
                                        <Button
                                            variant={
                                                showFilters
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setShowFilters(!showFilters)
                                            }
                                            className="flex items-center gap-2"
                                        >
                                            <Filter className="w-4 h-4" />
                                            Filters
                                        </Button>
                                    )}

                                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                        <button
                                            className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                viewMode === "grid"
                                                    ? "bg-farm-green text-white shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                                            }`}
                                            onClick={() => {
                                                console.log(
                                                    "Grid button clicked - switching to grid view"
                                                );
                                                setViewMode("grid");
                                            }}
                                        >
                                            <Grid className="w-4 h-4 mr-1" />
                                            Grid
                                        </button>
                                        <button
                                            className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                viewMode === "list"
                                                    ? "bg-farm-green text-white shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                                            }`}
                                            onClick={() => {
                                                console.log(
                                                    "List button clicked - switching to list view"
                                                );
                                                setViewMode("list");
                                            }}
                                        >
                                            <List className="w-4 h-4 mr-1" />
                                            List
                                        </button>
                                        <button
                                            className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                viewMode === "map"
                                                    ? "bg-farm-green text-white shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                                            }`}
                                            onClick={() => {
                                                console.log(
                                                    "Map button clicked - switching to map view"
                                                );
                                                setViewMode("map");
                                            }}
                                        >
                                            <Map className="w-4 h-4 mr-1" />
                                            Map
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isLoading &&
                        (viewMode === "grid" || viewMode === "list") ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">
                                        Loading farms...
                                    </p>
                                </div>
                            </div>
                        ) : viewMode === "map" ? (
                            <div className="relative">
                                <MapView
                                    farms={farms}
                                    locationCordinates={locationCordinates}
                                    handleSearch={handleSearch}
                                    isLoading={isLoading}
                                />
                            </div>
                        ) : (
                            <div
                                className={
                                    viewMode === "grid"
                                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                                        : "grid grid-cols-1 space-y-3"
                                }
                            >
                                {/* Real Farms from Supabase */}
                                {farms.length !== 0 &&
                                    farms.map((farm) => (
                                        <FarmCard
                                            key={farm.id}
                                            id={farm.id}
                                            name={farm.name}
                                            address={farm.address}
                                            bio={farm.bio}
                                            contact_person={farm.contact_person}
                                            email={farm.email}
                                            phone={farm.phone}
                                            logo={farm.logo}
                                            type={farm.type}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Index;
