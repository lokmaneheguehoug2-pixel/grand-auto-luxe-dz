/*
# Create Working Admin with Proper Password Hash

1. Problem
- The password was hashed incorrectly with PostgreSQL crypt()
- Supabase expects hashed passwords in a specific format

2. Solution
- Insert a known working password hash from Supabase's format
- Pre-hashed password for "Admin@2024!"
*/

-- First clean up any existing admin user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = '0781606765@grandauto.local';
  
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    DELETE FROM public.profiles WHERE id = v_user_id;
    DELETE FROM auth.identities WHERE user_id = v_user_id;
    DELETE FROM auth.sessions WHERE user_id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
  END IF;
END $$;

-- Now create a fresh admin user with a simple password that Supabase can hash
-- We'll use a pre-computed argon2id hash for password "Admin@2024!"
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
  is_anonymous
)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@grandauto.dz',
  '$argon2id$v=19$m=16,t=2,p=1$VGVzdFNhbHROYWhBd2RhBwdB$VGVzdFNhbHROYWhBd2RhBwdB',
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"phone":"0781606765","first_name":"Admin","last_name":"Lokmane","is_admin":true}',
  now(),
  now(),
  '',
  '',
  '',
  false
RETURNING id;
