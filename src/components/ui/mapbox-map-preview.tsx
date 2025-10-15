import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";

interface MapboxMapPreviewProps {
  coordinates: [number, number] | null;
  className?: string;
  onSelect?: (coordinates: [number, number], placeName?: string) => void;
}

export function MapboxMapPreview({ coordinates, className = "", onSelect }: MapboxMapPreviewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const clickHandlerRef = useRef<((e: any) => void) | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log('Fetching Mapbox token...');
        const { data } = await supabase
          .from('config')
          .select('value')
          .eq('key', 'mapbox_token')
          .single();

        console.log('Mapbox token response:', data);
        if (data?.value) {
          setMapboxToken(data.value);
          console.log('Mapbox token set successfully');
        } else {
          console.log('No Mapbox token found in response');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };
    
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    console.log('Map initialization effect triggered', { 
      hasContainer: !!mapContainer.current, 
      hasToken: !!mapboxToken, 
      coordinates 
    });
    
    if (!mapContainer.current || !mapboxToken) {
      console.log('Skipping map initialization - missing container or token');
      return;
    }

    try {
      console.log('Setting mapbox access token and initializing map...');
      mapboxgl.accessToken = mapboxToken;

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: coordinates || [-74.006, 40.7128], // Default to NYC
        zoom: 12,
      });

      console.log('Map initialized successfully');

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker if coordinates exist
      if (coordinates) {
        console.log('Adding marker at coordinates:', coordinates);
        marker.current = new mapboxgl.Marker()
          .setLngLat(coordinates)
          .addTo(map.current);
      }

      // Add click handler to allow pinning by tapping/clicking the map
  const handleMapClick = async (e: any) => {
        try {
          const lngLat = e.lngLat;
          const picked: [number, number] = [lngLat.lng, lngLat.lat];

          // Move map and update marker
          map.current?.flyTo({ center: picked, zoom: 12, duration: 700 });

          if (marker.current) {
            marker.current.remove();
            marker.current = null;
          }

          marker.current = new mapboxgl.Marker().setLngLat(picked).addTo(map.current!);

          // Optionally reverse geocode to get a human readable place name and call onSelect
          let placeName: string | undefined = undefined;
          if (mapboxToken) {
            try {
              const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${picked[0]},${picked[1]}.json?access_token=${mapboxToken}&limit=1`
              );
              if (res.ok) {
                const data = await res.json();
                placeName = data.features?.[0]?.place_name;
              }
            } catch (err) {
              console.error('Reverse geocode failed:', err);
            }
          }

          if (onSelect) {
            onSelect(picked, placeName);
          }
        } catch (err) {
          console.error('Error handling map click:', err);
        }
      };

  clickHandlerRef.current = handleMapClick;
  map.current.on('click', handleMapClick as any);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      console.log('Cleaning up map...');
      if (map.current) {
        try {
          if (clickHandlerRef.current) {
            map.current.off('click', clickHandlerRef.current as any);
          }
        } catch (e) {
          // ignore
        }
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, coordinates]);

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

  return (
    <div className={`h-48 rounded-lg overflow-hidden border relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      {!coordinates && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 px-3 py-2 rounded text-sm text-muted-foreground border">
            Tap on the map to pick a location
          </div>
        </div>
      )}
    </div>
  );
}