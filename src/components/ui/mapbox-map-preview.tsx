import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";

interface MapboxMapPreviewProps {
  coordinates: [number, number] | null;
  className?: string;
}

export function MapboxMapPreview({ coordinates, className = "" }: MapboxMapPreviewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: coordinates || [-74.006, 40.7128], // Default to NYC
        zoom: 12,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker if coordinates exist
      if (coordinates) {
        marker.current = new mapboxgl.Marker()
          .setLngLat(coordinates)
          .addTo(map.current);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update map when coordinates change
  useEffect(() => {
    if (map.current && coordinates) {
      // Update map center and marker
      map.current.flyTo({
        center: coordinates,
        zoom: 12,
        duration: 1000
      });

      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }

      // Add new marker
      marker.current = new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map.current);
    }
  }, [coordinates]);

  if (!coordinates) {
    return (
      <div className={`h-48 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted ${className}`}>
        <p className="text-muted-foreground text-sm">Select an address to preview location</p>
      </div>
    );
  }

  return (
    <div className={`h-48 rounded-lg overflow-hidden border ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}