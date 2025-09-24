-- Drop the existing INSERT policy that requires authentication
DROP POLICY IF EXISTS "Users can insert their own farmer application" ON public.farmer_applications;

-- Create a new INSERT policy that allows unauthenticated users to insert applications
-- as long as they provide a valid user_id
CREATE POLICY "Users can create farmer applications" 
ON public.farmer_applications 
FOR INSERT 
WITH CHECK (
  user_id IS NOT NULL
);