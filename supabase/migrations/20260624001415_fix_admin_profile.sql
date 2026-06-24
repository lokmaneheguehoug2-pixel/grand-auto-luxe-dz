/*
# Create Admin User Directly (Fixed)

1. Purpose
- Create an admin user with phone number 0781606765
- Set up admin role and active subscription
- Password: Admin@2024!
*/

-- Get the created user ID and create profile with all required fields
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = '0781606765@grandauto.local';
  
  IF v_user_id IS NOT NULL THEN
    -- Create profile with all required fields
    INSERT INTO public.profiles (
      id, 
      first_name, 
      last_name, 
      phone,
      dob,
      place_of_birth,
      subscription_status, 
      subscription_until,
      plan_type
    )
    VALUES (
      v_user_id,
      'Admin',
      'Lokmane',
      '0781606765',
      '1990-01-01',
      'Algeria',
      'active',
      now() + interval '100 years',
      'showroom'
    )
    ON CONFLICT (id) DO UPDATE SET
      subscription_status = 'active',
      subscription_until = now() + interval '100 years';
    
    -- Add admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
