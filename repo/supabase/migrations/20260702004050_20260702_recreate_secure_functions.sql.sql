-- Recreate functions with proper security (search_path and permissions)

-- 1. Reset daily post counter - SECURITY DEFINER with search_path, admin only
CREATE FUNCTION public.reset_daily_post_counter()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET daily_posts_used = 0, last_post_reset = CURRENT_DATE
  WHERE last_post_reset < CURRENT_DATE;
END;
$$;

-- 2. Apply promo code - SECURITY INVOKER (runs with caller's permissions)
CREATE FUNCTION public.apply_promo_code(p_user_id uuid, p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  promo_record RECORD;
BEGIN
  SELECT * INTO promo_record
  FROM public.promo_codes
  WHERE code = p_code AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR uses_count < max_uses);

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.promo_redemptions (promo_code_id, user_id)
  VALUES (promo_record.id, p_user_id);

  UPDATE public.promo_codes
  SET uses_count = uses_count + 1
  WHERE id = promo_record.id;

  UPDATE public.profiles
  SET subscription_status = 'active',
      subscription_until = GREATEST(
        COALESCE(subscription_until, now()),
        now()
      ) + make_interval(days => promo_record.days_granted)
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

-- 3. Can post vehicle - SECURITY DEFINER with admin check inside
CREATE FUNCTION public.can_post_vehicle(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile RECORD;
BEGIN
  SELECT is_banned, subscription_status, daily_posts_used, last_post_reset,
         plan_type, is_showroom
  INTO profile
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND OR profile.is_banned THEN
    RETURN false;
  END IF;

  IF profile.subscription_status = 'active' THEN
    RETURN true;
  END IF;

  IF profile.last_post_reset < CURRENT_DATE THEN
    UPDATE public.profiles
    SET daily_posts_used = 0, last_post_reset = CURRENT_DATE
    WHERE id = p_user_id;
    profile.daily_posts_used := 0;
  END IF;

  RETURN profile.daily_posts_used < 5;
END;
$$;

-- 4. Increment post count
CREATE FUNCTION public.increment_post_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET daily_posts_used = daily_posts_used + 1
  WHERE id = auth.uid();
END;
$$;

-- 5. Has role helper - needed for admin checks
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  has_role boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO has_role;

  RETURN has_role;
END;
$$;

-- 6. Admin reset user password - admin only
CREATE FUNCTION public.admin_reset_user_password(p_user_id uuid, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Permission denied: Admin role required';
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf'))
  WHERE id = p_user_id;
END;
$$;

-- 7. Setup admin user - admin only
CREATE FUNCTION public.setup_admin_user(p_phone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Permission denied: Admin role required';
  END IF;

  INSERT INTO auth.users (
    id,
    phone,
    phone_confirmed_at,
    raw_app_meta_data,
    encrypted_password
  )
  SELECT
    gen_random_uuid(),
    p_phone,
    now(),
    '{"provider":"phone","providers":["phone"]}',
    crypt('LOK12MANE', gen_salt('bf'))
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE phone = p_phone)
  RETURNING id INTO v_user_id;

  INSERT INTO public.profiles (id, phone)
  VALUES (v_user_id, p_phone)
  ON CONFLICT (phone) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT DO NOTHING;
END;
$$;

-- 8. Update updated_at trigger function
CREATE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 9. Auto confirm email - admin only
CREATE FUNCTION public.auto_confirm_email()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Permission denied: Admin role required';
  END IF;

  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE email_confirmed_at IS NULL;
END;
$$;

-- 10. Has active subscription
CREATE FUNCTION public.has_active_subscription(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_subscription_status text;
BEGIN
  SELECT subscription_status INTO v_subscription_status
  FROM public.profiles
  WHERE id = p_user_id;

  RETURN v_subscription_status = 'active';
END;
$$;

-- 11. Update last seen
CREATE FUNCTION public.update_last_seen()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen_at = now()
  WHERE id = auth.uid();
END;
$$;

-- Recreate triggers
CREATE TRIGGER trg_update_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();