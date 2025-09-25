-- Improve the farmer application approval process to ensure proper profile and farm creation

-- First, let's create a function that handles the complete farmer approval process
CREATE OR REPLACE FUNCTION public.approve_farmer_application(application_id uuid, approved_by_admin uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    app_record farmer_applications%ROWTYPE;
    farm_id uuid;
    profile_exists boolean;
BEGIN
    -- Get the application details
    SELECT * INTO app_record 
    FROM farmer_applications 
    WHERE id = application_id AND approval_status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found or already processed';
    END IF;
    
    -- Check if profile exists, create if missing
    SELECT EXISTS(
        SELECT 1 FROM profiles WHERE id = app_record.user_id
    ) INTO profile_exists;
    
    IF NOT profile_exists THEN
        -- Create profile from application data
        INSERT INTO profiles (id, email, full_name, role, password_expired)
        VALUES (
            app_record.user_id,
            app_record.email,
            app_record.contact_person,
            'farmer',
            false
        );
    ELSE
        -- Update existing profile to farmer role
        UPDATE profiles 
        SET role = 'farmer', 
            email = app_record.email,
            full_name = COALESCE(full_name, app_record.contact_person)
        WHERE id = app_record.user_id;
    END IF;
    
    -- Create the farm
    INSERT INTO farms (
        farmer_id,
        name,
        address,
        bio,
        contact_person,
        email,
        phone,
        location
    ) VALUES (
        app_record.user_id,
        app_record.farm_name,
        app_record.farm_address,
        app_record.farm_bio,
        app_record.contact_person,
        app_record.email,
        app_record.phone,
        app_record.farm_location
    ) RETURNING id INTO farm_id;
    
    -- Assign to free pricing plan if not already assigned
    INSERT INTO farm_pricing_plans (user_id, pricing_plan_id, assigned_by, is_active)
    SELECT 
        app_record.user_id,
        pp.id,
        approved_by_admin,
        true
    FROM pricing_plans pp
    WHERE pp.name = 'Free (Starter)'
    ON CONFLICT (user_id, pricing_plan_id) DO NOTHING;
    
    -- Update application status
    UPDATE farmer_applications 
    SET 
        approval_status = 'approved',
        approved_at = now(),
        approved_by = approved_by_admin
    WHERE id = application_id;
    
    -- Log the action
    INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
    VALUES (
        approved_by_admin,
        'farmer_application_approved',
        app_record.user_id,
        jsonb_build_object(
            'application_id', application_id,
            'farm_id', farm_id,
            'farm_name', app_record.farm_name
        )
    );
    
    RETURN true;
END;
$$;

-- Also improve the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    user_name text;
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
    
    -- If user is a farmer, assign them to free plan by default
    IF user_role = 'farmer' THEN
        INSERT INTO public.farm_pricing_plans (user_id, pricing_plan_id)
        SELECT NEW.id, id 
        FROM public.pricing_plans 
        WHERE name ILIKE '%free%' OR name ILIKE '%starter%'
        LIMIT 1
        ON CONFLICT (user_id, pricing_plan_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for the new user handler if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix any existing farmers who might be missing profile data
INSERT INTO profiles (id, email, full_name, role, password_expired)
SELECT 
    fa.user_id,
    fa.email,
    fa.contact_person,
    'farmer',
    false
FROM farmer_applications fa
WHERE fa.approval_status = 'approved'
    AND NOT EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = fa.user_id
    )
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    role = 'farmer',
    password_expired = EXCLUDED.password_expired;