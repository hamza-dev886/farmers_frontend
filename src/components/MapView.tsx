import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LocationCordinates } from '@/types/user';
import { FarmMapDBRecord } from '@/types/farm';
import { useSearchParams } from "react-router-dom";
import { debounce } from '@/lib/utils';

type MapViewType = {
  farms: FarmMapDBRecord[];
  locationCordinates: LocationCordinates;
  handleSearch: () => void;
  isLoading: boolean;
}

const ZOOM = 10;

export const MapView = ({ farms, locationCordinates, handleSearch, isLoading }: MapViewType ) => {

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const isUpdatingFromParams = useRef(false);

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
  }, [farms]);

  // Update token when config data loads
  useEffect(() => {
    if (configData?.value) {
      setMapboxToken(configData.value);
    }
  }, [configData]);

  useEffect(() => {
    const searchLat = searchParams.get('lat');
    const searchLng = searchParams.get('lng');

    if (searchLat && searchLng && map.current && !isUpdatingFromParams.current) {
      isUpdatingFromParams.current = true;
      map.current.jumpTo({
        center: [parseFloat(searchLng), parseFloat(searchLat)]
      });
      // Reset flag after a short delay to allow map to settle
      setTimeout(() => {
        isUpdatingFromParams.current = false;
      }, 100);
    }
  }, [searchParams, map.current]);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    setIsInitializing(true);

    try {
      mapboxgl.accessToken = token;
      
      // Check WebGL support
      if (!mapboxgl.supported()) {
        throw new Error('WebGL is not supported by this browser. Please try a different browser or update your current one.');
      }
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: locationCordinates ? [locationCordinates.lng,locationCordinates.lat] : [40.7128, 74.0060], //Default is New York
        zoom: ZOOM,
        antialias: true,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
        attributionControl: false,
        minZoom: ZOOM
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
        setIsInitializing(false);
      });

      map.current.on('moveend', () => {
        // Only update params if the move wasn't triggered by search params change
        if (!isUpdatingFromParams.current && map.current) {
          const { lng, lat } = map.current.getCenter();
          handleMapCenterChange(lat.toString(), lng.toString());
        }
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setIsInitializing(false);
    }
  };

  const handleMapCenterChange = (latitude: string, longitude: string) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({
      ...currentParams,
      lat: latitude,
      lng: longitude
    });
    debouncedSearch();
  }

  const debouncedSearch = debounce(handleSearch, 1000);

  const addFarmMarkers = () => {
    if (!map.current || !farms.length) return;

    farms.forEach((farm) => {
      // Use location from database or fallback to random coordinates
      const lat = farm.latitude;
      const lng = farm.longitude;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'farm-marker';
      markerElement.innerHTML = `
        <div class="w-10 h-10 ${farm.type === "farm" ? "bg-farm-green" : "bg-yellow-400"} rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white">
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
          ${farm.bio ? `<p class="text-sm mb-3">${farm.bio.substring(0, 20)}${farm.bio.length > 10 ? '...' : ''}</p>` : ''}
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
            <button class="px-3 py-1 bg-farm-green text-white rounded-md text-sm hover:bg-farm-green/90 transition-colors" onClick="window.open('/farmer/${farm.id}', '_self')">
              View ${farm.type === "farm" ? "Farm" : "Stall"}
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
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-subtle rounded-lg border border-border overflow-hidden">
      {(isInitializing || isLoading) && (
        <div className="absolute inset-0 bg-background/5 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
            <p className="text-muted-foreground">{isLoading ? 'Loading farms...' : 'Initializing map...'}</p>
          </div>
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
    </div>
  );
};