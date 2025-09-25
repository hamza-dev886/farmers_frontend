-- Create a security definer function to check if user is a farmer
CREATE OR REPLACE FUNCTION public.is_farmer()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'farmer'
  );
END;
$$;

-- Update the INSERT policy for product table to use the security definer function
DROP POLICY IF EXISTS "Farmers can create products" ON public.product;

CREATE POLICY "Farmers can create products" 
ON public.product 
FOR INSERT 
WITH CHECK (is_farmer());