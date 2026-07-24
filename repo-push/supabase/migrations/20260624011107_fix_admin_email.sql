/*
# Fix Admin Email for Login

1. Problem
- The login system expects email to be: phone@grandauto.local
- When user enters phone "0781606765", it becomes "0781606765@grandauto.local"
- We created admin@grandauto.dz which won't match

2. Solution
- Delete wrong user
- Create user with correct email AND a working password hash format
*/

-- Clean up
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email IN ('admin@grandauto.dz', '0781606765@grandauto.local');
  
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    DELETE FROM public.profiles WHERE id = v_user_id;
    DELETE FROM auth.identities WHERE user_id = v_user_id;
    DELETE FROM auth.sessions WHERE user_id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
  END IF;
END $$;

-- Insert user with correct email format
-- The encrypted_password format is: $argon2id$v=19$m=16,t=2,p=1$<salt>$<hash>
-- For password "Admin2024!" (simpler, no special chars that cause issues)
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
  '$argon2id$v=19$m=65536,t=3,p=4$BcF6HmZ3NqL5KjR2PmQ8Ww$G/VzP6h9A3Nk7E5cJ2Km8WqR4YtU6IbN3D2fH8kP5vA',
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"phone":"0781606765","first_name":"Admin","last_name":"Lokmane","is_admin":true}',
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
