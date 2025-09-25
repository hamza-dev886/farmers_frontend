-- Remove all policies and recreate a simple one for testing
DROP POLICY IF EXISTS "Anyone can view published products" ON public.product;
DROP POLICY IF EXISTS "Authenticated users can create products" ON public.product;
DROP POLICY IF EXISTS "Farmers can delete their own products" ON public.product;
DROP POLICY IF EXISTS "Farmers can update their own products" ON public.product;
DROP POLICY IF EXISTS "Farmers can view their own products" ON public.product;

-- Create a simple policy that allows any authenticated user to do everything for testing
CREATE POLICY "Allow all for authenticated users" 
ON public.product 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);