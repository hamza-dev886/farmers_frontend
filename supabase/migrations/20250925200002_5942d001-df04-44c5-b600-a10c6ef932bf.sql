-- Add missing columns to existing order table
ALTER TABLE public."order" 
ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
ADD COLUMN IF NOT EXISTS pickup_time TIMESTAMP WITH TIME ZONE;

-- Add RLS policies for orders
ALTER TABLE public."order" ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view their own orders" 
ON public."order" 
FOR SELECT 
USING (customer_id = auth.uid()::text);

-- Customers can create orders
CREATE POLICY "Customers can create orders" 
ON public."order" 
FOR INSERT 
WITH CHECK (customer_id = auth.uid()::text);

-- Allow anyone to view orders (for now, will be refined based on actual schema)
CREATE POLICY "Allow order reads" 
ON public."order" 
FOR SELECT 
USING (true);

-- Allow anyone to update orders (for now, will be refined based on actual schema)
CREATE POLICY "Allow order updates" 
ON public."order" 
FOR UPDATE 
USING (true);