-- Fix admin user: password !Admin2024, missing identity record, profile, and roles
DO $$
DECLARE
  v_admin_id uuid;
  v_password_hash text;
BEGIN
  v_admin_id := 'b0ada8e1-32cd-42b0-b788-6e8ecacf0b06';
  v_password_hash := crypt('!Admin2024', gen_salt('bf', 10));

  -- Set password and ensure email is confirmed
  UPDATE auth.users
  SET
    encrypted_password = v_password_hash,
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmation_token = '',
    updated_at = now()
  WHERE id = v_admin_id;

  -- Create missing identity record (required for email/password login)
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(),
    v_admin_id,
    '0781606765@grandauto.local',
    jsonb_build_object('sub', v_admin_id::text, 'email', '0781606765@grandauto.local'),
    'email',
    now(), now(), now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- Fix profile: active subscription, showroom plan
  INSERT INTO public.profiles (
    id, first_name, last_name, dob, place_of_birth, phone,
    subscription_status, subscription_until, plan_type, is_banned
  )
  VALUES (
    v_admin_id, 'Admin', 'Lokmane', '1990-01-01', 'Algeria', '0781606765',
    'active', now() + interval '100 years', 'showroom', false
  )
  ON CONFLICT (id) DO UPDATE SET
    subscription_status = 'active',
    subscription_until = now() + interval '100 years',
    plan_type = 'showroom',
    is_banned = false;

  -- Grant admin + user roles
  INSERT INTO public.user_roles (user_id, role) VALUES (v_admin_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_admin_id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;
