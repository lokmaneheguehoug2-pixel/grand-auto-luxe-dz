-- ============ PLAN TYPE ENUM ============
DO $$ BEGIN
  CREATE TYPE public.plan_type AS ENUM ('individual', 'showroom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ EXTEND PROFILES FOR PLANS ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_type public.plan_type DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS daily_posts_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_post_reset date DEFAULT CURRENT_DATE;

-- ============ PROMO CODES ============
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  plan_type public.plan_type NOT NULL DEFAULT 'individual',
  days_granted integer NOT NULL DEFAULT 3,
  max_uses integer,
  uses_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo read authenticated" ON public.promo_codes
  FOR SELECT TO authenticated USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "promo admin manage" ON public.promo_codes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ PROMO REDEMPTIONS ============
CREATE TABLE IF NOT EXISTS public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(promo_code_id, user_id)
);
GRANT SELECT, INSERT ON public.promo_redemptions TO authenticated;
GRANT ALL ON public.promo_redemptions TO service_role;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "redemption read own" ON public.promo_redemptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "redemption insert authenticated" ON public.promo_redemptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ FAKE REPORT TRACKING ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fake_reports_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_fake_report_at timestamptz;

-- ============ SUPPORT TICKETS ============
DO $$ BEGIN
  CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  status public.ticket_status NOT NULL DEFAULT 'open',
  priority public.ticket_priority NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  closed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket read own or admin" ON public.support_tickets
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "ticket insert authenticated" ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ticket update admin" ON public.support_tickets
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ SUPPORT TICKET REPLIES ============
CREATE TABLE IF NOT EXISTS public.support_ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_staff_reply boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.support_ticket_replies TO authenticated;
GRANT ALL ON public.support_ticket_replies TO service_role;
ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reply read ticket_participants" ON public.support_ticket_replies
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
    )
  );
CREATE POLICY "reply insert ticket_participants" ON public.support_ticket_replies
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
    ) AND auth.uid() = user_id
  );

-- ============ INDEXES FOR PERFORMANCE ============
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user ON public.promo_redemptions(user_id);

-- ============ HELPER: RESET DAILY POST COUNTER ============
CREATE OR REPLACE FUNCTION public.reset_daily_post_counter()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET daily_posts_used = 0, last_post_reset = CURRENT_DATE
  WHERE last_post_reset < CURRENT_DATE;
END;
$$;

-- ============ HELPER: APPLY PROMO CODE ============
CREATE OR REPLACE FUNCTION public.apply_promo_code(p_user_id uuid, p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_promo public.promo_codes%ROWTYPE;
  v_days integer;
  v_new_until timestamptz;
BEGIN
  -- Find active promo code
  SELECT * INTO v_promo FROM public.promo_codes
  WHERE code = p_code AND is_active = true AND (max_uses IS NULL OR uses_count < max_uses) AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired promo code');
  END IF;
  
  -- Check if already redeemed
  IF EXISTS (SELECT 1 FROM public.promo_redemptions WHERE promo_code_id = v_promo.id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Promo code already used');
  END IF;
  
  -- Calculate new subscription date
  SELECT COALESCE(subscription_until, trial_started_at + interval '72 hours') INTO v_new_until
  FROM public.profiles WHERE id = p_user_id;
  
  v_new_until := v_new_until + (v_promo.days_granted || ' days')::interval;
  
  -- Apply extension
  UPDATE public.profiles
  SET subscription_until = v_new_until, subscription_status = 'active'
  WHERE id = p_user_id;
  
  -- Record redemption
  INSERT INTO public.promo_redemptions (promo_code_id, user_id) VALUES (v_promo.id, p_user_id);
  
  -- Increment usage
  UPDATE public.promo_codes SET uses_count = uses_count + 1 WHERE id = v_promo.id;
  
  RETURN jsonb_build_object('success', true, 'days_granted', v_promo.days_granted, 'new_until', v_new_until);
END;
$$;

-- ============ HELPER: CHECK POST LIMIT ============
CREATE OR REPLACE FUNCTION public.can_post_vehicle(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_limit integer;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('can_post', false, 'reason', 'Profile not found'); END IF;
  
  -- Reset daily counter if needed
  IF v_profile.last_post_reset < CURRENT_DATE THEN
    UPDATE public.profiles SET daily_posts_used = 0, last_post_reset = CURRENT_DATE WHERE id = p_user_id;
    v_profile.daily_posts_used := 0;
  END IF;
  
  -- Banned users cannot post
  IF v_profile.is_banned THEN
    RETURN jsonb_build_object('can_post', false, 'reason', 'User is banned');
  END IF;
  
  -- Locked subscription cannot post
  IF v_profile.subscription_status = 'locked' THEN
    RETURN jsonb_build_object('can_post', false, 'reason', 'Subscription required');
  END IF;
  
  -- Check plan limits
  IF v_profile.plan_type = 'individual' THEN
    v_limit := 1; -- 1 post per day
  ELSE
    v_limit := NULL; -- unlimited for showroom
  END IF;
  
  IF v_limit IS NOT NULL AND v_profile.daily_posts_used >= v_limit THEN
    RETURN jsonb_build_object('can_post', false, 'reason', 'Daily post limit reached', 'limit', v_limit);
  END IF;
  
  -- Check trial expiry
  IF v_profile.subscription_status = 'trial' THEN
    IF v_profile.trial_started_at < now() - interval '72 hours' THEN
      RETURN jsonb_build_object('can_post', false, 'reason', 'Trial expired');
    END IF;
  END IF;
  
  RETURN jsonb_build_object('can_post', true, 'plan', v_profile.plan_type, 'daily_remaining', 
    CASE WHEN v_limit IS NULL THEN NULL ELSE v_limit - v_profile.daily_posts_used END);
END;
$$;

-- ============ TRIGGER: INCREMENT POST COUNT ON VEHICLE INSERT ============
CREATE OR REPLACE FUNCTION public.increment_post_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET daily_posts_used = daily_posts_used + 1
  WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_post_count ON public.vehicles;
CREATE TRIGGER trg_increment_post_count
  AFTER INSERT ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.increment_post_count();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_ticket_replies;
