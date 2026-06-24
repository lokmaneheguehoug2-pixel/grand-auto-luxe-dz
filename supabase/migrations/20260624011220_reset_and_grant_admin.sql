/*
# Reset Admin User for Clean Signup

1. Problem
- Password was hashed incorrectly
- Supabase uses argon2id which can't be created via SQL

2. Solution
- Delete the broken admin user
- User should sign up fresh through the UI
- Then grant admin rights via this function
*/

-- Clean up existing broken admin
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = '0781606765@grandauto.local';
  
  IF v_user_id IS NOT NULL THEN
    -- Delete from user_roles
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    -- Delete from profiles (will cascade due to FK)
    DELETE FROM public.profiles WHERE id = v_user_id;
    -- Delete from auth
    DELETE FROM auth.users WHERE id = v_user_id;
    RAISE NOTICE 'Deleted user %', v_user_id;
  END IF;
END $$;

-- Create a function to grant admin rights after user signs up
CREATE OR REPLACE FUNCTION public.grant_admin_after_signup(p_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find user by phone
  SELECT id INTO v_user_id FROM public.profiles WHERE phone = p_phone;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with phone %', p_phone;
  END IF;
  
  -- Update profile to active subscription
  UPDATE public.profiles
  SET 
    subscription_status = 'active',
    subscription_until = now() + interval '100 years',
    plan_type = 'showroom'
  WHERE id = v_user_id;
  
  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Also grant 'user' role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Instructions comment
COMMENT ON FUNCTION public.grant_admin_after_signup(text) IS 
'Call this function after admin user signs up: SELECT public.grant_admin_after_signup(''0781606765'');';
