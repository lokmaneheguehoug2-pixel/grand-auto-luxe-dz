/*
# Create Admin User with Correct Metadata for Trigger

1. Purpose
- Create admin user with phone 0781606765
- Include correct metadata in raw_user_meta_data for trigger
- Password: Admin@2024!

2. Note
- The handle_new_user trigger reads from raw_user_meta_data
- We need to include: first_name, last_name, phone, dob, place_of_birth
*/

-- Insert user with complete metadata that trigger expects
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_new,
  email_change,
  recovery_token,
  email_change_token_current,
  is_anonymous
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  '0781606765@grandauto.local',
  crypt('Admin@2024!', gen_salt('bf')),
  now(),
  '{"provider":"phone","providers":["phone"]}',
  '{"phone":"0781606765","first_name":"Admin","last_name":"Lokmane","dob":"1990-01-01","place_of_birth":"Algeria"}',
  now(),
  now(),
  '',
  '',
  '',
  '',
  '',
  false
)
RETURNING id, email;
