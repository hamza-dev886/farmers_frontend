-- Drop existing policies first
DROP POLICY IF EXISTS "Allow order reads" ON public.order;
DROP POLICY IF EXISTS "Allow order updates" ON public.order;
DROP POLICY IF EXISTS "Customers can create orders" ON public.order;
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.order;

-- Enable RLS on order table
ALTER TABLE public.order ENABLE ROW LEVEL SECURITY;

-- Policy for customers to view their own orders
CREATE POLICY "Customers can view own orders" 
ON public.order 
FOR SELECT 
USING (customer_id = (auth.uid())::text);

-- Policy for customers to create orders
CREATE POLICY "Customers can create new orders" 
ON public.order 
FOR INSERT 
WITH CHECK (customer_id = (auth.uid())::text);

-- Policy for farmers to view orders containing their products
CREATE POLICY "Farmers can view orders with their products" 
ON public.order 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.farms f
    WHERE f.farmer_id = auth.uid()
    AND EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(metadata->'cart_items') AS item
      WHERE item->>'farmId' = f.id::text
    )
  )
);

-- Policy for farmers to update order status for their products
CREATE POLICY "Farmers can update order status" 
ON public.order 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.farms f
    WHERE f.farmer_id = auth.uid()
    AND EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(metadata->'cart_items') AS item
      WHERE item->>'farmId' = f.id::text
    )
  )
);

-- Policy for admins to manage all orders
CREATE POLICY "Admins can manage all orders" 
ON public.order 
FOR ALL 
USING (is_admin());