-- First drop the existing constraint if it exists
ALTER TABLE public.inventory_tracking 
DROP CONSTRAINT IF EXISTS inventory_tracking_variant_id_fkey;

-- Change variant_id column type from uuid to text to match product.id
ALTER TABLE public.inventory_tracking 
ALTER COLUMN variant_id TYPE text;

-- Add correct foreign key constraint to reference the product table
ALTER TABLE public.inventory_tracking 
ADD CONSTRAINT inventory_tracking_variant_id_fkey 
FOREIGN KEY (variant_id) REFERENCES public.product(id) ON DELETE CASCADE;