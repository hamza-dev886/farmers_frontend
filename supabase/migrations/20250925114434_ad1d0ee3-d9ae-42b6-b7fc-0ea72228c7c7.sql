-- Create missing profile for the approved farmer
INSERT INTO public.profiles (id, email, full_name, role, password_expired)
VALUES ('d1009563-0f50-40ae-b87f-74065eab5f57', 'redhook@gmail.com', 'Red Hook Farms - Columbia Street Farm', 'farmer', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  password_expired = EXCLUDED.password_expired;