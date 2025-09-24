-- Add 'customer' to the user_role enum first
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer';

-- Update the function to handle the correct role value
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::user_role
  );
  
  -- If user is a farmer, assign them to free plan by default
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'farmer' THEN
    INSERT INTO public.farm_pricing_plans (user_id, pricing_plan_id)
    SELECT NEW.id, id FROM public.pricing_plans WHERE name = 'Free' LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;