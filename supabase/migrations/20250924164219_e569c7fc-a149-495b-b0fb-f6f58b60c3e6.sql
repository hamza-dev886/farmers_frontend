-- Fix RLS policy for farmer_applications to allow anonymous submissions
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can insert their own farmer application" ON public.farmer_applications;

-- Create a new policy that allows anonymous users to submit applications
CREATE POLICY "Allow public farmer applications" 
ON public.farmer_applications 
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated and owns the record
  (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text) 
  OR 
  -- Allow anonymous submissions (user_id can be null)
  (auth.uid() IS NULL)
);