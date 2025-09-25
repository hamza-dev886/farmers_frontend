-- Fix the handle_new_user function to prevent signup errors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    user_name text;
    plan_id uuid;
BEGIN
    -- Extract role and name from metadata
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'shopper');
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1) -- Fallback to email username
    );
    
    -- Insert profile with better error handling
    INSERT INTO public.profiles (id, email, full_name, role, password_expired)
    VALUES (
        NEW.id, 
        NEW.email,
        user_name,
        user_role,
        COALESCE((NEW.raw_user_meta_data->>'password_expired')::boolean, false)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
        role = CASE 
            WHEN profiles.role IS NULL OR profiles.role = 'shopper' 
            THEN EXCLUDED.role 
            ELSE profiles.role 
        END,
        password_expired = EXCLUDED.password_expired;
    
    -- If user is a farmer, try to assign them to free plan by default (with error handling)
    IF user_role = 'farmer' THEN
        BEGIN
            -- Find a free plan
            SELECT id INTO plan_id 
            FROM public.pricing_plans 
            WHERE name ILIKE '%free%' OR name ILIKE '%starter%'
            LIMIT 1;
            
            -- Only insert if we found a plan
            IF plan_id IS NOT NULL THEN
                INSERT INTO public.farm_pricing_plans (user_id, pricing_plan_id, is_active)
                VALUES (NEW.id, plan_id, true)
                ON CONFLICT DO NOTHING; -- Simple conflict resolution
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Log the error but don't fail the user creation
            RAISE NOTICE 'Failed to assign pricing plan to user %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If anything fails, log it but don't prevent user creation
    RAISE NOTICE 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- Still return NEW to allow user creation to proceed
    RETURN NEW;
END;
$$;

-- Ensure there's a unique constraint on farm_pricing_plans
ALTER TABLE public.farm_pricing_plans 
ADD CONSTRAINT farm_pricing_plans_user_plan_unique 
UNIQUE (user_id, pricing_plan_id);