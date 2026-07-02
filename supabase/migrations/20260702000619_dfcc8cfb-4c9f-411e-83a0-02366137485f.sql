
-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS fake_reports_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_fake_report_at timestamptz,
  ADD COLUMN IF NOT EXISTS daily_post_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_post_reset_date date NOT NULL DEFAULT CURRENT_DATE;

-- 2. promo_codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  plan_type text NOT NULL DEFAULT 'individual',
  days_granted integer NOT NULL DEFAULT 3,
  max_uses integer,
  uses_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage promo_codes" ON public.promo_codes;
CREATE POLICY "admin manage promo_codes" ON public.promo_codes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "read active promo_codes" ON public.promo_codes;
CREATE POLICY "read active promo_codes" ON public.promo_codes
  FOR SELECT TO authenticated USING (is_active = true);

-- 3. appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  preferred_date date,
  preferred_time text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seller reads own appointments" ON public.appointments;
CREATE POLICY "seller reads own appointments" ON public.appointments
  FOR SELECT TO authenticated USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "anyone can request appointment" ON public.appointments;
CREATE POLICY "anyone can request appointment" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "seller updates appointments" ON public.appointments;
CREATE POLICY "seller updates appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "seller deletes appointments" ON public.appointments;
CREATE POLICY "seller deletes appointments" ON public.appointments
  FOR DELETE TO authenticated USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- 4. support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  admin_reply text,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user reads own tickets" ON public.support_tickets;
CREATE POLICY "user reads own tickets" ON public.support_tickets
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "user creates tickets" ON public.support_tickets;
CREATE POLICY "user creates tickets" ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin updates tickets" ON public.support_tickets;
CREATE POLICY "admin updates tickets" ON public.support_tickets
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO authenticated, anon;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone reads settings" ON public.site_settings;
CREATE POLICY "anyone reads settings" ON public.site_settings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin writes settings" ON public.site_settings;
CREATE POLICY "admin writes settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. RPC functions with fixed search_path
CREATE OR REPLACE FUNCTION public.reset_daily_post_counter()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
    SET daily_post_count = 0, last_post_reset_date = CURRENT_DATE
    WHERE last_post_reset_date < CURRENT_DATE;
END; $$;

CREATE OR REPLACE FUNCTION public.increment_post_count(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
    SET daily_post_count = CASE WHEN last_post_reset_date < CURRENT_DATE THEN 1 ELSE daily_post_count + 1 END,
        last_post_reset_date = CURRENT_DATE
    WHERE id = p_user_id;
END; $$;

CREATE OR REPLACE FUNCTION public.can_post_vehicle(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.profiles%ROWTYPE;
  today_count integer;
  daily_limit integer;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('can_post', false, 'reason', 'Profile not found');
  END IF;
  IF p.is_banned THEN
    RETURN jsonb_build_object('can_post', false, 'reason', 'Account banned');
  END IF;
  today_count := CASE WHEN p.last_post_reset_date < CURRENT_DATE THEN 0 ELSE p.daily_post_count END;
  daily_limit := CASE
    WHEN p.plan_type = 'showroom' THEN 50
    WHEN p.plan_type = 'individual' THEN 10
    ELSE 2
  END;
  IF today_count >= daily_limit THEN
    RETURN jsonb_build_object('can_post', false, 'reason', 'Daily post limit reached');
  END IF;
  RETURN jsonb_build_object('can_post', true);
END; $$;

CREATE OR REPLACE FUNCTION public.apply_promo_code(p_user_id uuid, p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.promo_codes%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.promo_codes WHERE code = upper(p_code) AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired code');
  END IF;
  IF c.max_uses IS NOT NULL AND c.uses_count >= c.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code usage limit reached');
  END IF;
  UPDATE public.profiles
    SET plan_type = c.plan_type,
        subscription_status = 'active',
        subscription_until = COALESCE(subscription_until, now()) + make_interval(days => c.days_granted)
    WHERE id = p_user_id;
  UPDATE public.promo_codes SET uses_count = uses_count + 1 WHERE id = c.id;
  RETURN jsonb_build_object('success', true, 'days_granted', c.days_granted);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_reset_user_password(user_id uuid, new_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can reset passwords';
  END IF;
  -- Password reset requires service role; return a marker so admin UI knows to call an edge fn.
  RETURN jsonb_build_object('success', false, 'error', 'Password reset requires manual admin action');
END; $$;

CREATE OR REPLACE FUNCTION public.setup_admin_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, 'admin') ON CONFLICT DO NOTHING;
END; $$;
