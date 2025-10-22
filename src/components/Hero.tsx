import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/farm-hero.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from 'react-router-dom';

type HeroType = {
  handleSearch: () => void;
}

export const Hero = ({
  handleSearch
}: HeroType) => {
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapboxToken, setMapboxToken] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const suggestionsRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const { data: configData } = useQuery({
    queryKey: ['config', 'mapbox_token'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('config')
        .select('value')
        .eq('key', 'mapbox_token')
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Update token when config data loads
  useEffect(() => {
    if (configData?.value) {
      console.log('Mapbox token loaded from config.', configData.value);
      setMapboxToken(configData.value);
    }
  }, [configData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (locationQuery.length < 3 || locationQuery === selectedLocation?.name) {
        setSuggestions([]);
        return;
      }

      if (!mapboxToken) return;

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationQuery)}.json?access_token=${mapboxToken}&types=place,postcode,locality`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchLocationSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [locationQuery, mapboxToken, selectedLocation]);


  useEffect(() => {
    console.log('Location suggestions updated:', suggestions);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions]);

  const handleLocationSelect = (feature, e) => {
    e.stopPropagation();
    setSelectedLocation({
      name: feature.place_name,
      coordinates: feature.center,
    });
    setLocationQuery(feature.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleInputSearch = () => {
    if (selectedLocation) {
      const [lng, lat] = selectedLocation.coordinates;

      setSearchParams({ lng, lat })

      if (searchQuery.trim()) {
        setSearchParams({
          ...searchParams,
          q: searchQuery.trim()
        })
      }

      handleSearch();
    }
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-visible">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/75 to-background/60" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
          From Local Farms To
          <span className="block text-farm-green">Local Tables</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Connecting farm families with customers who love fresh,
          local produce. Support family farms and discover farm events in your community.
        </p>

        <div className="max-w-2xl mx-auto bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-farm border border-border/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative" ref={suggestionsRef}>
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
              <Input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter location (city, state, or zip)"
                className="pl-10 h-12 border-green-600/20 focus:border-green-600"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card backdrop-blur-sm rounded-lg shadow-lg border border-border z-[10] overflow-y-auto max-h-56">
                  {suggestions.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={(e) => handleLocationSelect(feature, e)}
                      className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{feature.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {feature.place_name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInputSearch()}
                placeholder="Search farms, produce, or events"
                className="pl-10 h-12 border-farm-green/20 focus:border-farm-green"
              />
            </div>

            <Button
              onClick={handleInputSearch}
              className="md:w-auto w-full"
            >
              Find Farms
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-farm-green rounded-full"></div>
            500+ Family Farms
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-farm-gold rounded-full"></div>
            200+ Farm Stalls
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-farm-earth rounded-full"></div>
            Weekly Events
          </span>
        </div>
      </div>
    </section>
  );
};