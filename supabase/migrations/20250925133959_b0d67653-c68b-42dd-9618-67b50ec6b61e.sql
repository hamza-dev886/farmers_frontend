-- Test the is_farmer function for the current user
SELECT 
  auth.uid() as current_user_id,
  is_farmer() as is_farmer_result,
  (SELECT role FROM profiles WHERE id = auth.uid()) as user_role;