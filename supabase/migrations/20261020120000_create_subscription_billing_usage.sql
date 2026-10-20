-- Subscription, BaridiMob payment, and usage foundation for GRAND Auto Luxe.
-- Additive migration: preserves existing profiles and pending_subscriptions data.

DO $$ BEGIN
  CREATE TYPE public.subscription_plan_code AS ENUM ('individual_monthly','individual_yearly','showroom_monthly','showroom_yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.subscription_record_status AS ENUM ('trialing','active','past_due','expired','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_submission_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  code public.subscription_plan_code PRIMARY KEY,
  name text NOT NULL,
  price_dzd integer NOT NULL CHECK (price_dzd > 0),
  duration_days integer NOT NULL CHECK (duration_days > 0),
  daily_listing_limit integer,
  monthly_reel_limit integer,
  max_images integer NOT NULL DEFAULT 30 CHECK (max_images > 0),
  can_pin boolean NOT NULL DEFAULT false,
  can_analytics boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.subscription_plans (code,name,price_dzd,duration_days,daily_listing_limit,monthly_reel_limit,max_images,can_pin,can_analytics)
VALUES
 ('individual_monthly','Individual Monthly',1000,30,1,30,30,false,false),
 ('individual_yearly','Individual Yearly',10000,365,1,30,30,false,false),
 ('showroom_monthly','Showroom Monthly',2500,30,NULL,NULL,30,true,true),
 ('showroom_yearly','Showroom Yearly',25000,365,NULL,NULL,30,true,true)
ON CONFLICT (code) DO UPDATE SET name=excluded.name, price_dzd=excluded.price_dzd, duration_days=excluded.duration_days,
 daily_listing_limit=excluded.daily_listing_limit, monthly_reel_limit=excluded.monthly_reel_limit, max_images=excluded.max_images,
 can_pin=excluded.can_pin, can_analytics=excluded.can_analytics;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_code public.subscription_plan_code NOT NULL REFERENCES public.subscription_plans(code),
  status public.subscription_record_status NOT NULL DEFAULT 'trialing',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  provider text NOT NULL DEFAULT 'baridimob',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_current_per_user ON public.subscriptions(user_id) WHERE status IN ('trialing','active','past_due');

CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_code public.subscription_plan_code NOT NULL REFERENCES public.subscription_plans(code),
  amount_dzd integer NOT NULL CHECK (amount_dzd > 0),
  sender_phone text NOT NULL,
  transaction_reference text NOT NULL,
  proof_path text,
  status public.payment_submission_status NOT NULL DEFAULT 'pending',
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_note text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_submissions_reference_unique ON public.payment_submissions(transaction_reference);

CREATE TABLE IF NOT EXISTS public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('listing','reel','pin','ai_analysis')),
  entity_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS usage_events_user_type_time_idx ON public.usage_events(user_id,event_type,occurred_at DESC);

GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT ON public.payment_submissions TO authenticated;
GRANT SELECT, INSERT ON public.usage_events TO authenticated;
GRANT ALL ON public.subscription_plans, public.subscriptions, public.payment_submissions, public.usage_events TO service_role;

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY subscription_plans_public_read ON public.subscription_plans FOR SELECT TO anon, authenticated USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY subscriptions_owner_read ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY payment_submissions_owner_read ON public.payment_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY payment_submissions_owner_insert ON public.payment_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY payment_submissions_admin_update ON public.payment_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY usage_events_owner_read ON public.usage_events FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY usage_events_owner_insert ON public.usage_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.touch_subscription_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS subscriptions_touch_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_touch_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_subscription_updated_at();

INSERT INTO storage.buckets (id,name,public) VALUES ('payment-proofs','payment-proofs',false) ON CONFLICT (id) DO NOTHING;
