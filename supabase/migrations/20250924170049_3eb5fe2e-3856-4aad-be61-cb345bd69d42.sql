-- Revert user_id to NOT NULL and update the farmer application flow
-- First, make user_id NOT NULL again since we'll create users
ALTER TABLE public.farmer_applications ALTER COLUMN user_id SET NOT NULL;

-- Drop the current policy
DROP POLICY IF EXISTS "Allow public farmer applications" ON public.farmer_applications;

-- Create policy for authenticated users only
CREATE POLICY "Users can insert their own farmer application" 
ON public.farmer_applications 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- Add password_expired flag to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_expired boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS temp_password text;

-- Update the handle_new_user function to handle farmer applications
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, password_expired)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'shopper'),
    COALESCE((NEW.raw_user_meta_data->>'password_expired')::boolean, false)
  );
  
  -- If user is a farmer, assign them to free plan by default
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'shopper') = 'farmer' THEN
    INSERT INTO public.farm_pricing_plans (user_id, pricing_plan_id)
    SELECT NEW.id, id FROM public.pricing_plans WHERE name = 'Free' LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$;