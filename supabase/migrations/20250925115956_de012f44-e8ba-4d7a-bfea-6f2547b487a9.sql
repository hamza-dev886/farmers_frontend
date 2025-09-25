-- Add RLS policy to allow admins to insert farm records when approving applications
CREATE POLICY "Admins can create farm records for approved applications" 
ON public.farms 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());