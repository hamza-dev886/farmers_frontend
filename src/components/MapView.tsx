import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Leaf, Store, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Farm {
  id: string;
  name: string;
  address: string;
  bio?: string;
  contact_person: string;
  email: string;
  phone?: string;
  location?: any; // JSON field from Supabase
}

interface MapViewProps {
  searchResults?: any[];
  searchType?: string;
  userLocation?: [number, number] | null;
}

export const MapView = ({ searchResults, searchType, userLocation }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [mapError, setMapError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);

  // Fetch Mapbox token from config table
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
      setMapboxToken(configData.value);
      setShowTokenInput(false);
    }
  }, [configData]);

  // Use search results if provided, otherwise fetch all farms
  const { data: allFarms = [], isLoading } = useQuery({
    queryKey: ['farms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farms')
        .select('*');
      
      if (error) throw error;
      return data as Farm[];
    },
    enabled: !searchResults // Only fetch if no search results provided
  });

  // Use search results or all farms
  const farms = searchResults || allFarms;

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    setIsInitializing(true);
    setMapError('');

    try {
      mapboxgl.accessToken = token;
      
      // Check WebGL support
      if (!mapboxgl.supported()) {
        throw new Error('WebGL is not supported by this browser. Please try a different browser or update your current one.');
      }
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-98.5795, 39.8283], // Center of US
        zoom: 4,
        antialias: true,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Handle map load and errors
      map.current.on('load', () => {
        setIsInitializing(false);
        addFarmMarkers();
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load the map. Please check your token and try again.');
        setIsInitializing(false);
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError(error instanceof Error ? error.message : 'Failed to initialize map');
      setIsInitializing(false);
    }
  };

  const addFarmMarkers = () => {
    if (!map.current || !farms.length) return;

    // Clear existing markers before adding new ones
    const existingMarkers = document.querySelectorAll('.farm-marker');
    existingMarkers.forEach(marker => marker.remove());

    farms.forEach((farm) => {
      // Handle different coordinate sources based on search type
      let lat, lng;
      
      if (searchType === 'product' && farm.farm_location) {
        // If searching for products, use the related farm's location
        lat = farm.farm_location.lat;
        lng = farm.farm_location.lng;
      } else if (farm.location) {
        // Use farm's own location
        lat = farm.location.lat || farm.location.latitude;
        lng = farm.location.lng || farm.location.longitude;
      } else {
        // Fallback to random coordinates in US
        lat = 39.8283 + (Math.random() - 0.5) * 20;
        lng = -98.5795 + (Math.random() - 0.5) * 40;
      }

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'farm-marker';
      markerElement.innerHTML = `
        <div class="w-10 h-10 bg-farm-green rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2L3 7l9 5 9-5-9-5z"/>
            <path d="M3 17l9 5 9-5"/>
            <path d="M3 12l9 5 9-5"/>
          </svg>
        </div>
      `;

      // Create popup content
      const popup = new mapboxgl.Popup({
        offset: 25,
        className: 'farm-popup'
      }).setHTML(`
        <div class="p-4 max-w-xs">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-lg text-farm-green">${farm.name}</h3>
            <div class="flex text-farm-gold">
              ${'★'.repeat(4)}${'☆'.repeat(1)}
            </div>
          </div>
          <p class="text-sm text-muted-foreground mb-2">${farm.address}</p>
          ${farm.bio ? `<p class="text-sm mb-3">${farm.bio.substring(0, 100)}${farm.bio.length > 100 ? '...' : ''}</p>` : ''}
          <div class="flex flex-wrap gap-1 mb-3">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-farm-green/10 text-farm-green">
              🥕 Fresh Produce
            </span>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-farm-gold/10 text-farm-gold">
              🚚 Delivery Available
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-muted-foreground">Contact: ${farm.contact_person}</span>
            <button class="px-3 py-1 bg-farm-green text-white rounded-md text-sm hover:bg-farm-green/90 transition-colors">
              View Farm
            </button>
          </div>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(markerElement)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // If user location is provided, add a marker for it
    if (userLocation && map.current) {
      const userMarker = document.createElement('div');
      userMarker.innerHTML = `
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </div>
      `;
      
      new mapboxgl.Marker(userMarker)
        .setLngLat([userLocation[1], userLocation[0]])
        .addTo(map.current);
        
      // Center map on user location
      map.current.flyTo({
        center: [userLocation[1], userLocation[0]],
        zoom: 10
      });
    }
  };

  useEffect(() => {
    if (mapboxToken && !map.current && mapContainer.current) {
      console.log('Initializing map with token:', mapboxToken.substring(0, 10) + '...');
      initializeMap(mapboxToken);
    }
  }, [mapboxToken]);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && farms.length > 0) {
      addFarmMarkers();
    }
  }, [farms, userLocation, searchType]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      setMapError('');
      initializeMap(mapboxToken);
    }
  };

  if (isLoading && !searchResults) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-subtle rounded-lg border border-border overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading farms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-gradient-subtle rounded-lg border border-border overflow-hidden">
      {/* Debug info */}
      <div className="absolute top-2 right-2 z-50 bg-background/90 p-2 rounded text-xs">
        Token: {mapboxToken ? 'Set' : 'Not set'} | 
        Show Input: {showTokenInput.toString()} | 
        Error: {mapError ? 'Yes' : 'No'} | 
        Initializing: {isInitializing.toString()}
      </div>
      {mapError && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center text-destructive">Map Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">{mapError}</p>
              <Button onClick={() => {
                setMapError('');
                setShowTokenInput(true);
                if (map.current) {
                  map.current.remove();
                  map.current = null;
                }
              }}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {isInitializing && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing map...</p>
          </div>
        </div>
      )}

      {showTokenInput && !configData?.value && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center">Mapbox Configuration</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Mapbox token is configured in the system configuration.
              </p>
              <Button onClick={() => setShowTokenInput(false)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 space-y-2 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-background/90 backdrop-blur-sm hover:bg-background"
          onClick={() => {
            if (map.current && navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                map.current?.flyTo({
                  center: [position.coords.longitude, position.coords.latitude],
                  zoom: 12
                });
              });
            }
          }}
        >
          <MapPin className="w-4 h-4 mr-2" />
          My Location
        </Button>
      </div>
      
      {/* Farm count and legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="bg-background/90 backdrop-blur-sm">
          <CardContent className="p-3">
            <h4 className="font-semibold text-sm mb-2">Farms Directory</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-farm-green rounded-full"></div>
                <span>{farms.length} Active Farms</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Leaf className="w-3 h-3 text-farm-green" />
                <span>Click markers for details</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings button */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-background/90 backdrop-blur-sm hover:bg-background"
          onClick={() => setShowTokenInput(true)}
        >
          Settings
        </Button>
      </div>
    </div>
  );
};