-- Add default UUID generation for the order table id column
ALTER TABLE public.order 
ALTER COLUMN id SET DEFAULT gen_random_uuid();