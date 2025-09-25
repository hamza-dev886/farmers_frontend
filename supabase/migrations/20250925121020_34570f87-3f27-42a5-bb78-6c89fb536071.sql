-- Create farm records for existing approved applications that don't have farms yet
INSERT INTO public.farms (farmer_id, name, address, bio, contact_person, email, phone, location)
SELECT 
  fa.user_id,
  fa.farm_name,
  fa.farm_address,
  fa.farm_bio,
  fa.contact_person,
  fa.email,
  fa.phone,
  fa.farm_location
FROM farmer_applications fa
LEFT JOIN farms f ON f.farmer_id = fa.user_id
WHERE fa.approval_status = 'approved' 
  AND f.id IS NULL;