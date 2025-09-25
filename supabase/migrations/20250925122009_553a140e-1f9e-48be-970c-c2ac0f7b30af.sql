-- Fix missing profile records for users with approved farmer applications
-- This script will create profile records for users who have farmer applications but no profile

INSERT INTO public.profiles (id, email, full_name, role, password_expired)
SELECT 
    fa.user_id,
    fa.email,
    fa.contact_person,
    'farmer',
    false
FROM farmer_applications fa
LEFT JOIN profiles p ON p.id = fa.user_id
WHERE fa.approval_status = 'approved' 
  AND p.id IS NULL;

-- Also ensure all farmers with pricing plans have complete profile data
-- Update any missing data for existing farmer profiles
UPDATE public.profiles 
SET 
    email = fa.email,
    full_name = fa.contact_person,
    role = 'farmer'
FROM farmer_applications fa
WHERE profiles.id = fa.user_id 
  AND fa.approval_status = 'approved'
  AND (profiles.email IS NULL OR profiles.full_name IS NULL OR profiles.role != 'farmer');