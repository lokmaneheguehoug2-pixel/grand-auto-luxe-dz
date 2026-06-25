-- Create Admin user with proper bcrypt password hash
DO $$
DECLARE
  v_admin_id uuid;
  v_existing_id uuid;
  v_password_hash text;
BEGIN
  -- Generate bcrypt hash for password "Admin2024!"
  v_password_hash := crypt('Admin2024!', gen_salt('bf', 10));

  -- Check if user already exists
  SELECT id INTO v_existing_id FROM auth.users WHERE email = '0781606765@grandauto.local';

  IF v_existing_id IS NOT NULL THEN
    -- Update existing user's password and confirm email
    UPDATE auth.users
    SET
      encrypted_password = v_password_hash,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      confirmation_token = '',
      updated_at = now()
    WHERE id = v_existing_id;
    v_admin_id := v_existing_id;
    RAISE NOTICE 'Updated existing admin user %', v_admin_id;
  ELSE
    -- Create new admin user
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
      v_password_hash,
      now(),
      '{"provider":"email","providers":["email"]}',
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
    RETURNING id INTO v_admin_id;
    RAISE NOTICE 'Created new admin user %', v_admin_id;
  END IF;

  -- Ensure identity record exists (required for email/password login)
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    v_admin_id,
    '0781606765@grandauto.local',
    jsonb_build_object('sub', v_admin_id::text, 'email', '0781606765@grandauto.local'),
    'email',
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- Ensure profile exists
  INSERT INTO public.profiles (
    id, first_name, last_name, dob, place_of_birth, phone,
    subscription_status, subscription_until, plan_type
  )
  VALUES (
    v_admin_id,
    'Admin',
    'Lokmane',
    '1990-01-01',
    'Algeria',
    '0781606765',
    'active',
    now() + interval '100 years',
    'showroom'
  )
  ON CONFLICT (id) DO UPDATE
    SET subscription_status = 'active',
        subscription_until = now() + interval '100 years',
        plan_type = 'showroom';

  -- Grant admin + user roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_admin_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_admin_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'Admin setup complete for user %', v_admin_id;
END $$;
