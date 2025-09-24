import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface MapboxAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  className?: string;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

export function MapboxAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Search for an address...",
  className 
}: MapboxAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data } = await supabase
          .from('config')
          .select('value')
          .eq('key', 'mapbox_token')
          .single();
        
        if (data?.value) {
          setMapboxToken(data.value);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };
    
    fetchToken();
  }, []);

  // Set default to New York, USA on mount
  useEffect(() => {
    if (!value && mapboxToken) {
      onChange("New York, NY, USA", [-74.006, 40.7128]);
    }
  }, [mapboxToken, value, onChange]);

  const searchAddresses = async (query: string) => {
    if (!mapboxToken || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=address,poi&limit=5&country=us`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.features || []);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      searchAddresses(newValue);
      setIsOpen(true);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: MapboxFeature) => {
    console.log('Autocomplete suggestion clicked:', suggestion.place_name, 'Coordinates:', suggestion.center);
    onChange(suggestion.place_name, suggestion.center);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => setIsOpen(false), 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={cn(className)}
        autoComplete="off"
      />
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.place_name}
            </button>
          ))}
        </div>
      )}
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}