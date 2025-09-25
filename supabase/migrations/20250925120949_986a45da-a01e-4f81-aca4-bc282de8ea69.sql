-- Fix the farm creation issue during application approval
-- The existing RLS policy for farms is too restrictive

-- Drop the existing restrictive INSERT policy for farms
DROP POLICY IF EXISTS "Admins can create farm records for approved applications" ON public.farms;

-- Create a more comprehensive policy that allows both admins to create farms 
-- and the system to create farms for approved farmers
CREATE POLICY "Allow farm creation for approved applications" 
ON public.farms 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow admins to create farms
  is_admin() 
  OR 
  -- Allow farmers to create their own farm record (during approval process)
  auth.uid() = farmer_id
);

-- Also ensure farmers can view their own farms (this might be missing)
DROP POLICY IF EXISTS "Farmers can view their own farms" ON public.farms;
CREATE POLICY "Farmers can view their own farms" 
ON public.farms 
FOR SELECT 
TO authenticated
USING (auth.uid() = farmer_id OR is_admin());

-- Ensure farmers can update their own farm details
DROP POLICY IF EXISTS "Farmers can update their own farms" ON public.farms;
CREATE POLICY "Farmers can update their own farms" 
ON public.farms 
FOR UPDATE 
TO authenticated
USING (auth.uid() = farmer_id OR is_admin());