-- Temporarily allow all authenticated users to create products to test
DROP POLICY IF EXISTS "Farmers can create products" ON public.product;

CREATE POLICY "Authenticated users can create products" 
ON public.product 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);