-- Update farmer_applications table to match the form fields
-- Rename firm_bio to farm_bio to match the form
ALTER TABLE public.farmer_applications 
RENAME COLUMN firm_bio TO farm_bio;

-- Add farm_coordinates column to store map coordinates
ALTER TABLE public.farmer_applications 
ADD COLUMN farm_coordinates jsonb;