-- Create config table for application settings
CREATE TABLE public.config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can manage config
CREATE POLICY "Admins can manage config" 
ON public.config 
FOR ALL 
USING (is_admin());

-- Allow public read access for certain config keys (like map tokens)
CREATE POLICY "Public can read map config" 
ON public.config 
FOR SELECT 
USING (key IN ('mapbox_token'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_config_updated_at
BEFORE UPDATE ON public.config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the Mapbox token
INSERT INTO public.config (key, value, description) 
VALUES (
  'mapbox_token', 
  'pk.eyJ1IjoibnN1bXJlaW4iLCJhIjoiY21meGR5NDloMDl3cDJxcTZxMXIydmZkayJ9.lhb5ISRz6pcLKqLzwls_0g',
  'Mapbox public API token for map functionality'
);